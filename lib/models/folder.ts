import { type Db, ObjectId } from "mongodb"

import { connectToDatabase } from "@/lib/db"
import type { Folder } from "@/lib/types"

/**
 * A folder stored in MongoDB. Folders nest via `parentId` (null = library root).
 */
type StoredFolder = {
  _id?: ObjectId
  name: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
}

const COLLECTION_NAME = "folders"

function serializeFolder(folder: StoredFolder): Folder {
  const id =
    folder._id instanceof ObjectId
      ? folder._id.toHexString()
      : typeof folder._id === "string"
        ? folder._id
        : String(folder._id ?? "")

  return {
    id,
    name: folder.name,
    parentId: folder.parentId ?? null,
    createdAt:
      folder.createdAt instanceof Date
        ? folder.createdAt.toISOString()
        : typeof folder.createdAt === "string"
          ? folder.createdAt
          : String(folder.createdAt ?? ""),
    updatedAt:
      folder.updatedAt instanceof Date
        ? folder.updatedAt.toISOString()
        : typeof folder.updatedAt === "string"
          ? folder.updatedAt
          : String(folder.updatedAt ?? ""),
  }
}

async function findDuplicateName(
  db: Db,
  name: string,
  parentId: string | null,
  excludeId?: string
): Promise<boolean> {
  const query: Record<string, unknown> = {
    name,
    parentId: parentId ?? null,
  }
  if (excludeId) query._id = { $ne: new ObjectId(excludeId) }
  const existing = await db.collection(COLLECTION_NAME).findOne(query)
  return existing !== null
}

/**
 * Create a folder. Rejects empty/oversized names and duplicates within the
 * same parent. Returns a graceful failure if the DB is unavailable.
 */
async function createFolder(
  name: string,
  parentId: string | null
): Promise<{ id?: string; success: boolean; error?: string }> {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return { success: false, error: "Folder name cannot be empty" }
  }
  if (trimmedName.length > 100) {
    return { success: false, error: "Folder name cannot exceed 100 characters" }
  }

  try {
    const connection = await connectToDatabase()
    if (!connection) {
      return { success: false, error: "Database unavailable" }
    }
    const { db } = connection

    if (parentId) {
      const parent = await db
        .collection(COLLECTION_NAME)
        .findOne({ _id: new ObjectId(parentId) })
      if (!parent) {
        return { success: false, error: "Parent folder not found" }
      }
    }

    if (await findDuplicateName(db, trimmedName, parentId)) {
      return {
        success: false,
        error: "A folder with this name already exists here",
      }
    }

    const now = new Date()
    const result = await db.collection(COLLECTION_NAME).insertOne({
      name: trimmedName,
      parentId: parentId ?? null,
      createdAt: now,
      updatedAt: now,
    })

    console.log(
      "[DB] Folder created:",
      trimmedName,
      result.insertedId.toString()
    )
    return { id: result.insertedId.toString(), success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create folder"
    console.error("[DB] Create folder error:", message)
    return { success: false, error: message }
  }
}

/**
 * List all folders, sorted by name.
 */
async function listFolders(): Promise<Folder[]> {
  try {
    const connection = await connectToDatabase()
    if (!connection) return []
    const { db } = connection

    const folders = await db
      .collection(COLLECTION_NAME)
      .find()
      .sort({ name: 1 })
      .toArray()

    return (folders as StoredFolder[]).map(serializeFolder)
  } catch (error) {
    console.error("[DB] List folders error:", error)
    return []
  }
}

/**
 * Get a single folder by ID.
 */
async function getFolder(id: string): Promise<Folder | null> {
  try {
    const connection = await connectToDatabase()
    if (!connection) return null
    const { db } = connection

    const folder = await db
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })

    if (!folder) return null
    return serializeFolder(folder as StoredFolder)
  } catch (error) {
    console.error("[DB] Get folder error:", error)
    return null
  }
}

/**
 * Rename a folder, rejecting duplicates within the same parent.
 */
async function renameFolder(
  id: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return { success: false, error: "Folder name cannot be empty" }
  }
  if (trimmedName.length > 100) {
    return { success: false, error: "Folder name cannot exceed 100 characters" }
  }

  try {
    const connection = await connectToDatabase()
    if (!connection) {
      return { success: false, error: "Database unavailable" }
    }
    const { db } = connection

    const folder = await db
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })
    if (!folder) {
      return { success: false, error: "Folder not found" }
    }

    const parentId = (folder as StoredFolder).parentId ?? null
    if (await findDuplicateName(db, trimmedName, parentId, id)) {
      return {
        success: false,
        error: "A folder with this name already exists here",
      }
    }

    await db
      .collection(COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { name: trimmedName, updatedAt: new Date() } }
      )

    console.log("[DB] Folder renamed:", id, trimmedName)
    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to rename folder"
    console.error("[DB] Rename folder error:", message)
    return { success: false, error: message }
  }
}

/**
 * Delete multiple folders by ID. Documents inside them are handled by callers.
 */
async function deleteFolders(
  ids: string[]
): Promise<{ deletedCount: number; success: boolean; error?: string }> {
  try {
    const connection = await connectToDatabase()
    if (!connection) {
      return { deletedCount: 0, success: false, error: "Database unavailable" }
    }
    const { db } = connection

    const objectIds = ids.map((id) => new ObjectId(id))
    const result = await db
      .collection(COLLECTION_NAME)
      .deleteMany({ _id: { $in: objectIds } })

    console.log("[DB] Folders deleted:", result.deletedCount)
    return { success: true, deletedCount: result.deletedCount }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete folders"
    console.error("[DB] Delete folders error:", message)
    return { deletedCount: 0, success: false, error: message }
  }
}

/**
 * Return the folder id plus the ids of every nested descendant folder.
 */
async function getDescendantFolderIds(rootId: string): Promise<string[]> {
  try {
    const folders = await listFolders()
    const childrenByParent = new Map<string, string[]>()
    for (const folder of folders) {
      if (!folder.parentId) continue
      const siblings = childrenByParent.get(folder.parentId) ?? []
      siblings.push(folder.id)
      childrenByParent.set(folder.parentId, siblings)
    }

    const descendantIds = [rootId]
    const queue = [rootId]
    while (queue.length > 0) {
      const current = queue.shift()
      if (!current) continue
      for (const child of childrenByParent.get(current) ?? []) {
        descendantIds.push(child)
        queue.push(child)
      }
    }
    return descendantIds
  } catch (error) {
    console.error("[DB] Descendant folders error:", error)
    return [rootId]
  }
}

export type { StoredFolder }
export {
  createFolder,
  deleteFolders,
  getDescendantFolderIds,
  getFolder,
  listFolders,
  renameFolder,
}
