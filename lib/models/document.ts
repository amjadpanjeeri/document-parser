import { ObjectId } from "mongodb"

import { connectToDatabase } from "@/lib/db"

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
  sections: StoredSection[]
  fields: Record<string, string | null>
  summary?: string
  createdAt: Date
  updatedAt: Date
}

const COLLECTION_NAME = "documents"

/**
 * Save an extracted document to the database.
 * Returns a graceful failure if DB is unavailable.
 */
async function saveDocument(
  data: Omit<StoredDocument, "_id" | "createdAt" | "updatedAt">
): Promise<{ id?: string; success: boolean; error?: string }> {
  try {
    const connection = await connectToDatabase()
    if (!connection) {
      return { success: false, error: "Database unavailable" }
    }
    const { db } = connection
    const now = new Date()

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
 * Get a document by its ID.
 */
async function getDocument(id: string): Promise<StoredDocument | null> {
  try {
    const connection = await connectToDatabase()
    if (!connection) return null
    const { db } = connection

    const doc = await db
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })

    return doc as StoredDocument | null
  } catch (error) {
    console.error("[DB] Get error:", error)
    return null
  }
}

/**
 * List all documents, newest first.
 */
async function listDocuments(limit = 50): Promise<StoredDocument[]> {
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

    return docs as StoredDocument[]
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

export type { StoredDocument, StoredField, StoredSection }
export {
  deleteDocument,
  deleteManyDocuments,
  getDocument,
  listDocuments,
  saveDocument,
  updateDocument,
}
