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
 */
async function saveDocument(
  data: Omit<StoredDocument, "_id" | "createdAt" | "updatedAt">
): Promise<{ id?: string; success: boolean; error?: string }> {
  try {
    const { db } = await connectToDatabase()
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
    const { db } = await connectToDatabase()
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
    const { db } = await connectToDatabase()
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
    const { db } = await connectToDatabase()
    await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })
    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete document"
    console.error("[DB] Delete error:", message)
    return { success: false, error: message }
  }
}

export type { StoredDocument, StoredField, StoredSection }
export { deleteDocument, getDocument, listDocuments, saveDocument }
