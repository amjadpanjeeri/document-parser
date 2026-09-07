import { ObjectId } from "mongodb"

import { connectToDatabase } from "@/lib/db"
import { getFolder } from "./folder"

/**
 * A single extracted field from a document.
 */
type StoredField = {
  key: string
  label: string
  value: string | null
  confidence: number
}

/**
 * A section of extracted fields (e.g. "Vendor Information", "Invoice Details").
 */
type StoredSection = {
  title: string
  fields: StoredField[]
}

/**
 * Document stored in MongoDB.
 * Flexible schema — different document types (invoice, bank statement, etc.)
 * can have completely different fields without migrations.
 */
type StoredDocument = {
  _id?: ObjectId
  filename: string
  documentType: string
  confidence: number
  status?: "needs_review" | "ready"
  sections: StoredSection[]
  fields: Record<string, string | null>
  summary?: string
  /** Parent folder id, or null/absent when the document lives in the root. */
  folderId?: string | null
  /** SHA-256 of the uploaded file, used to detect duplicate uploads. */
  contentHash?: string
  createdAt: Date
  updatedAt: Date
}

type SerializableStoredDocument = {
  id: string
  filename: string
  documentType: string
  confidence: number
  status: "needs_review" | "ready"
  sections: StoredSection[]
  fields: Record<string, string | null>
  summary?: string
  folderId: string | null
  contentHash: string | null
  createdAt: string
  updatedAt: string
}

export type { SerializableStoredDocument }

function serializeStoredDocument(
  doc: StoredDocument
): SerializableStoredDocument {
  const id =
    doc._id instanceof ObjectId
      ? doc._id.toHexString()
      : typeof doc._id === "string"
        ? doc._id
        : String(doc._id ?? "")

  return {
    id,
    filename: doc.filename,
    documentType: doc.documentType,
    confidence: doc.confidence,
    status: doc.status ?? (doc.confidence >= 0.8 ? "ready" : "needs_review"),
    sections: doc.sections,
    fields: doc.fields,
    summary: doc.summary ?? undefined,
    folderId: doc.folderId ?? null,
    contentHash: doc.contentHash ?? null,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : typeof doc.createdAt === "string"
          ? doc.createdAt
          : String(doc.createdAt ?? ""),
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : typeof doc.updatedAt === "string"
          ? doc.updatedAt
          : String(doc.updatedAt ?? ""),
  }
}

const COLLECTION_NAME = "documents"

/**
 * Save an extracted document to the database.
 * Returns a graceful failure if DB is unavailable.
 */
async function saveDocument(
  data: Omit<StoredDocument, "_id" | "createdAt" | "updatedAt">
): Promise<{
  id?: string
  success: boolean
  duplicate?: boolean
  error?: string
}> {
  try {
    const connection = await connectToDatabase()
    if (!connection) {
      return { success: false, error: "Database unavailable" }
    }
    const { db } = connection
    const now = new Date()

    // Duplicate guard: never create a second record for the same file bytes.
    if (data.contentHash) {
      const existing = await db
        .collection(COLLECTION_NAME)
        .findOne({ contentHash: data.contentHash })
      if (existing) {
        const existingId =
          existing._id instanceof ObjectId
            ? existing._id.toHexString()
            : String(existing._id)
        console.log("[DB] Duplicate document skipped:", data.filename)
        return { id: existingId, success: true, duplicate: true }
      }
    }

    const result = await db.collection(COLLECTION_NAME).insertOne({
      ...data,
      createdAt: now,
      updatedAt: now,
    })

    console.log(
      "[DB] Document saved:",
      data.filename,
      result.insertedId.toString()
    )

    return { id: result.insertedId.toString(), success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save document"
    console.error("[DB] Save error:", message)
    return { success: false, error: message }
  }
}

/**
 * Find a saved document by its file content hash, if any.
 */
async function findDocumentByContentHash(
  hash: string
): Promise<SerializableStoredDocument | null> {
  try {
    const connection = await connectToDatabase()
    if (!connection) return null
    const { db } = connection

    const doc = await db
      .collection(COLLECTION_NAME)
      .findOne({ contentHash: hash })

    if (!doc) return null
    return serializeStoredDocument(doc as StoredDocument)
  } catch (error) {
    console.error("[DB] Find by content hash error:", error)
    return null
  }
}

/**
 * Get a document by its ID.
 */
async function getDocument(
  id: string
): Promise<SerializableStoredDocument | null> {
  try {
    const connection = await connectToDatabase()
    if (!connection) return null
    const { db } = connection

    const doc = await db
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })

    if (!doc) return null
    return serializeStoredDocument(doc as StoredDocument)
  } catch (error) {
    console.error("[DB] Get error:", error)
    return null
  }
}

/**
 * List all documents, newest first.
 */
async function listDocuments(
  limit = 50
): Promise<SerializableStoredDocument[]> {
  try {
    const connection = await connectToDatabase()
    if (!connection) return []
    const { db } = connection

    const docs = await db
      .collection(COLLECTION_NAME)
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return (docs as StoredDocument[]).map(serializeStoredDocument)
  } catch (error) {
    console.error("[DB] List error:", error)
    return []
  }
}

/**
 * Delete a document by ID.
 */
async function deleteDocument(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const connection = await connectToDatabase()
    if (!connection) {
      return { success: false, error: "Database unavailable" }
    }
    const { db } = connection

    await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })
    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete document"
    console.error("[DB] Delete error:", message)
    return { success: false, error: message }
  }
}

/**
 * Delete multiple documents by IDs.
 */
async function deleteManyDocuments(
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

    console.log("[DB] Documents deleted:", result.deletedCount)
    return { success: true, deletedCount: result.deletedCount }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete documents"
    console.error("[DB] Delete error:", message)
    return { deletedCount: 0, success: false, error: message }
  }
}

/**
 * Update a document by ID.
 */
async function updateDocument(
  id: string,
  data: Partial<Omit<StoredDocument, "_id" | "createdAt">>
): Promise<{ success: boolean; error?: string }> {
  try {
    const connection = await connectToDatabase()
    if (!connection) {
      return { success: false, error: "Database unavailable" }
    }
    const { db } = connection

    await db
      .collection(COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...data, updatedAt: new Date() } }
      )
    console.log("[DB] Document updated:", id)
    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update document"
    console.error("[DB] Update error:", message)
    return { success: false, error: message }
  }
}

/**
 * Rename a saved document without changing its extracted data.
 */
async function renameDocument(
  id: string,
  filename: string
): Promise<{ success: boolean; error?: string }> {
  const trimmedFilename = filename.trim()
  if (!trimmedFilename) {
    return { success: false, error: "Filename cannot be empty" }
  }
  if (trimmedFilename.length > 255) {
    return { success: false, error: "Filename cannot exceed 255 characters" }
  }

  try {
    const connection = await connectToDatabase()
    if (!connection) {
      return { success: false, error: "Database unavailable" }
    }

    const result = await connection.db
      .collection(COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { filename: trimmedFilename, updatedAt: new Date() } }
      )

    if (result.matchedCount === 0) {
      return { success: false, error: "Document not found" }
    }

    console.log("[DB] Document renamed:", id, trimmedFilename)
    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to rename document"
    console.error("[DB] Rename error:", message)
    return { success: false, error: message }
  }
}

/**
 * Move documents into a folder (or back to the library root when null).
 */
async function moveDocuments(
  ids: string[],
  folderId: string | null
): Promise<{ success: boolean; error?: string }> {
  if (ids.length === 0) {
    return { success: false, error: "No documents selected" }
  }

  try {
    const connection = await connectToDatabase()
    if (!connection) {
      return { success: false, error: "Database unavailable" }
    }
    const { db } = connection

    if (folderId) {
      const folder = await getFolder(folderId)
      if (!folder) {
        return { success: false, error: "Destination folder not found" }
      }
    }

    const objectIds = ids.map((id) => new ObjectId(id))
    const result = await db
      .collection(COLLECTION_NAME)
      .updateMany(
        { _id: { $in: objectIds } },
        { $set: { folderId: folderId ?? null, updatedAt: new Date() } }
      )

    console.log("[DB] Documents moved:", result.modifiedCount, "->", folderId)
    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to move documents"
    console.error("[DB] Move documents error:", message)
    return { success: false, error: message }
  }
}

/**
 * Count documents currently assigned to any of the given folders.
 */
async function countDocumentsInFolders(folderIds: string[]): Promise<number> {
  try {
    const connection = await connectToDatabase()
    if (!connection) return 0
    const { db } = connection

    return await db.collection(COLLECTION_NAME).countDocuments({
      folderId: { $in: folderIds },
    })
  } catch (error) {
    console.error("[DB] Count documents in folders error:", error)
    return 0
  }
}

/**
 * Move every document inside the given folders back to the library root.
 */
async function moveDocumentsOutOfFolders(
  folderIds: string[]
): Promise<{ modifiedCount: number; success: boolean; error?: string }> {
  try {
    const connection = await connectToDatabase()
    if (!connection) {
      return { modifiedCount: 0, success: false, error: "Database unavailable" }
    }
    const { db } = connection

    const result = await db
      .collection(COLLECTION_NAME)
      .updateMany(
        { folderId: { $in: folderIds } },
        { $set: { folderId: null, updatedAt: new Date() } }
      )

    console.log("[DB] Documents moved to root:", result.modifiedCount)
    return { success: true, modifiedCount: result.modifiedCount }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to move documents"
    console.error("[DB] Move documents to root error:", message)
    return { modifiedCount: 0, success: false, error: message }
  }
}

/**
 * Permanently delete every document inside the given folders.
 */
async function deleteDocumentsInFolders(
  folderIds: string[]
): Promise<{ deletedCount: number; success: boolean; error?: string }> {
  try {
    const connection = await connectToDatabase()
    if (!connection) {
      return { deletedCount: 0, success: false, error: "Database unavailable" }
    }
    const { db } = connection

    const result = await db.collection(COLLECTION_NAME).deleteMany({
      folderId: { $in: folderIds },
    })

    console.log("[DB] Documents deleted by folder:", result.deletedCount)
    return { success: true, deletedCount: result.deletedCount }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete documents"
    console.error("[DB] Delete documents by folder error:", message)
    return { deletedCount: 0, success: false, error: message }
  }
}

export type { StoredDocument, StoredField, StoredSection }
export {
  countDocumentsInFolders,
  deleteDocument,
  deleteDocumentsInFolders,
  deleteManyDocuments,
  findDocumentByContentHash,
  getDocument,
  listDocuments,
  moveDocuments,
  moveDocumentsOutOfFolders,
  renameDocument,
  saveDocument,
  updateDocument,
}
