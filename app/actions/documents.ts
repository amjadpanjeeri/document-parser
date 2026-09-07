"use server"

import {
  deleteDocument,
  deleteManyDocuments,
  findDocumentByContentHash,
  getDocument,
  listDocuments,
  moveDocuments,
  type SerializableStoredDocument,
  saveDocument,
  updateDocument,
} from "@/lib/models/document"

/**
 * Save extracted document data to the database.
 * Called after Gemini extraction completes.
 */
async function saveExtractedDocument(data: {
  filename: string
  documentType: string
  confidence: number
  status?: "needs_review" | "ready"
  sections: Array<{
    title: string
    fields: Array<{
      key: string
      label: string
      value: string | null
      confidence: number
    }>
  }>
  fields: Record<string, string | null>
  summary?: string
  contentHash?: string
  thumbnail?: string
}): Promise<{
  id: string | null
  success: boolean
  duplicate?: boolean
  error?: string
}> {
  const result = await saveDocument({
    filename: data.filename,
    documentType: data.documentType,
    confidence: data.confidence,
    status: data.status ?? "ready",
    sections: data.sections,
    fields: data.fields,
    summary: data.summary,
    contentHash: data.contentHash,
    thumbnail: data.thumbnail,
  })

  return { ...result, id: result.id ?? null }
}

/**
 * Find a saved document whose file content matches the given SHA-256 hash.
 * Returns null when no duplicate exists (or the DB is unavailable).
 */
async function findDuplicateDocument(
  hash: string
): Promise<SerializableStoredDocument | null> {
  if (!hash) return null
  return findDocumentByContentHash(hash)
}

/**
 * Get a single document by ID.
 */
async function getExtractedDocument(
  id: string
): Promise<Awaited<ReturnType<typeof getDocument>>> {
  return getDocument(id)
}

/**
 * List all saved documents, newest first.
 */
async function listExtractedDocuments(
  limit?: number
): Promise<SerializableStoredDocument[]> {
  return listDocuments(limit)
}

/**
 * Delete a document by ID.
 */
async function deleteExtractedDocument(
  id: string
): Promise<{ success: boolean; error?: string }> {
  return deleteDocument(id)
}

/**
 * Delete multiple documents by IDs.
 */
async function deleteExtractedDocuments(
  ids: string[]
): Promise<{ deletedCount: number; success: boolean; error?: string }> {
  return deleteManyDocuments(ids)
}

/**
 * Move documents into a folder, or back to the library root when folderId is null.
 */
async function moveExtractedDocuments(
  ids: string[],
  folderId: string | null
): Promise<{ success: boolean; error?: string }> {
  return moveDocuments(ids, folderId)
}

/**
 * Update a saved document's fields (e.g. after user edits).
 */
async function updateExtractedDocument(
  id: string,
  data: Partial<{
    sections: Array<{
      title: string
      fields: Array<{
        key: string
        label: string
        value: string | null
        confidence: number
      }>
    }>
    fields: Record<string, string | null>
    confidence: number
    status?: "needs_review" | "ready"
  }>
): Promise<{ success: boolean; error?: string }> {
  return updateDocument(id, data)
}

export {
  deleteExtractedDocument,
  deleteExtractedDocuments,
  findDuplicateDocument,
  getExtractedDocument,
  listExtractedDocuments,
  moveExtractedDocuments,
  saveExtractedDocument,
  updateExtractedDocument,
}
