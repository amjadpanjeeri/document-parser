"use server"

import {
  deleteDocument,
  deleteManyDocuments,
  getDocument,
  listDocuments,
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
}): Promise<{ id: string | null; success: boolean; error?: string }> {
  const result = await saveDocument({
    filename: data.filename,
    documentType: data.documentType,
    confidence: data.confidence,
    sections: data.sections,
    fields: data.fields,
    summary: data.summary,
  })

  return { ...result, id: result.id ?? null }
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
  }>
): Promise<{ success: boolean; error?: string }> {
  return updateDocument(id, data)
}

export {
  deleteExtractedDocument,
  deleteExtractedDocuments,
  getExtractedDocument,
  listExtractedDocuments,
  saveExtractedDocument,
  updateExtractedDocument,
}
