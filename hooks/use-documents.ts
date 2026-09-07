"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { toUserMessage } from "@/lib/error-message"
import type {
  SerializableStoredDocument,
  StoredSection,
} from "@/lib/models/document"
import type {
  DocStructDocument,
  DocumentStatus,
  ExtractedSection,
} from "@/lib/types"
import { useDocumentStore } from "@/stores/document-store"

/**
 * Map a stored MongoDB document to the shape the UI listing expects.
 */
function mapStoredDocument(doc: SerializableStoredDocument): DocStructDocument {
  const searchText = [
    doc.filename,
    doc.documentType,
    doc.summary,
    ...Object.entries(doc.fields).flat(),
    ...doc.sections.flatMap((section) => [
      section.title,
      ...section.fields.flatMap((field) => [field.label, field.value ?? ""]),
    ]),
  ]
    .filter(Boolean)
    .join(" ")

  return {
    id: doc.id,
    name: doc.filename,
    type: doc.documentType as DocStructDocument["type"],
    status: doc.status as DocumentStatus,
    uploadedAt: doc.createdAt,
    confidence: doc.confidence,
    searchText,
    folderId: doc.folderId ?? null,
  }
}

/**
 * Map stored DB sections to the ExtractedSection shape the viewer expects.
 */
function mapStoredSections(sections: StoredSection[]): ExtractedSection[] {
  return (sections || []).map((s) => ({
    title: s.title,
    fields: s.fields.map((f) => ({
      key: f.key,
      label: f.label,
      value: f.value || "-",
      confidence: Math.round(f.confidence * 100),
      isAiCompleted: f.confidence < 0.9,
      isAiFilled: f.confidence < 0.9,
    })),
  }))
}

type UseDocumentsReturn = {
  documents: DocStructDocument[]
  documentsLoading: boolean
  loadDocuments: () => Promise<void>
  /** Up to 3 most recent documents, shown on the landing page. */
  recentDocuments: DocStructDocument[]
  recentDocumentsLoading: boolean
  loadRecentDocuments: () => Promise<void>
  /** Open a saved document from the listing in the viewer. */
  openDocument: (doc: DocStructDocument) => Promise<void>
  /** Delete documents by ID — resolves true when all were deleted. */
  deleteDocuments: (ids: string[]) => Promise<boolean>
  renameDocument: (id: string, filename: string) => Promise<boolean>
  /** Move documents into a folder — resolves true on success. */
  moveDocuments: (ids: string[], folderId: string | null) => Promise<boolean>
}

/**
 * Owns the documents library state: the full document list, the recent items
 * shown on the landing page, and the load / open / delete flows backed by the
 * server actions.
 */
function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<DocStructDocument[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [recentDocuments, setRecentDocuments] = useState<DocStructDocument[]>(
    []
  )
  const [recentDocumentsLoading, setRecentDocumentsLoading] = useState(false)
  const viewerOpen = useDocumentStore((s) => s.viewerOpen)
  const uploadStatus = useDocumentStore((s) => s.uploadStatus)
  const wasViewerOpenRef = useRef(viewerOpen)

  const loadDocuments = useCallback(async () => {
    setDocumentsLoading(true)
    try {
      const { listExtractedDocuments } = await import("@/app/actions/documents")
      const docs = await listExtractedDocuments()
      setDocuments(docs.map(mapStoredDocument))
    } catch (err) {
      const message = err instanceof Error ? err.message : null
      toast.error("Couldn't load your documents", {
        description: toUserMessage(
          message,
          "We couldn't fetch your documents from the database. Please try again."
        ),
      })
    } finally {
      setDocumentsLoading(false)
    }
  }, [])

  const loadRecentDocuments = useCallback(async () => {
    setRecentDocumentsLoading(true)
    try {
      const { listExtractedDocuments } = await import("@/app/actions/documents")
      const docs = await listExtractedDocuments(3)
      setRecentDocuments(docs.map(mapStoredDocument))
    } catch (err) {
      const message = err instanceof Error ? err.message : null
      toast.error("Couldn't load recent documents", {
        description: toUserMessage(
          message,
          "We couldn't fetch your recent documents. Please try again."
        ),
      })
    } finally {
      setRecentDocumentsLoading(false)
    }
  }, [])

  // Recent documents are the landing page's primary content, so load them
  // immediately on mount. The full library is loaded separately on the
  // /documents page.
  useEffect(() => {
    loadRecentDocuments()
  }, [loadRecentDocuments])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // After an upload completes and the viewer closes, the new document is in
  // the DB — refresh whichever lists are visible so it appears immediately.
  useEffect(() => {
    const wasOpen = wasViewerOpenRef.current
    wasViewerOpenRef.current = viewerOpen

    if (wasOpen && !viewerOpen && uploadStatus === "done") {
      const timer = setTimeout(() => {
        loadRecentDocuments()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [viewerOpen, uploadStatus, loadRecentDocuments])

  const openDocument = useCallback(async (doc: DocStructDocument) => {
    try {
      const { getExtractedDocument } = await import("@/app/actions/documents")
      const fullDoc = await getExtractedDocument(doc.id)
      if (!fullDoc) return

      useDocumentStore.getState().openDocumentFromDb({
        documentId: doc.id,
        fileName: fullDoc.filename,
        documentType: fullDoc.documentType,
        confidence: fullDoc.confidence,
        sections: mapStoredSections(fullDoc.sections),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : null
      toast.error("Couldn't open this document", {
        description: toUserMessage(
          message,
          "The document data couldn't be loaded from the database. Please try again."
        ),
      })
    }
  }, [])

  const deleteDocuments = useCallback(
    async (ids: string[]): Promise<boolean> => {
      if (ids.length === 0) return false
      try {
        const { deleteExtractedDocuments } = await import(
          "@/app/actions/documents"
        )
        const result = await deleteExtractedDocuments(ids)
        if (!result.success) {
          toast.error("Couldn't delete the document", {
            description: toUserMessage(
              result.error,
              "The document wasn't deleted. Please try again."
            ),
          })
          return false
        }

        const deleted = result.deletedCount
        toast.success(deleted > 1 ? "Documents deleted" : "Document deleted", {
          description:
            deleted > 1
              ? `${deleted} documents removed from your library.`
              : "The document was removed from your library.",
        })
        await loadDocuments()
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : null
        toast.error("Couldn't delete the document", {
          description: toUserMessage(
            message,
            "Something went wrong while deleting. Please try again."
          ),
        })
        return false
      }
    },
    [loadDocuments]
  )

  const renameDocument = useCallback(
    async (id: string, filename: string) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      })
      const result = (await response.json()) as {
        success?: boolean
        error?: string
      }
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Filename update failed")
      }
      await loadDocuments()
      return true
    },
    [loadDocuments]
  )

  const moveDocuments = useCallback(
    async (ids: string[], folderId: string | null): Promise<boolean> => {
      if (ids.length === 0) return false
      try {
        const { moveExtractedDocuments } = await import(
          "@/app/actions/documents"
        )
        const result = await moveExtractedDocuments(ids, folderId)
        if (!result.success) {
          toast.error("Couldn't move the document", {
            description: toUserMessage(
              result.error,
              "The document wasn't moved. Please try again."
            ),
          })
          return false
        }

        toast.success(ids.length > 1 ? "Documents moved" : "Document moved", {
          description:
            ids.length > 1
              ? `${ids.length} documents moved.`
              : "The document was moved.",
        })
        await loadDocuments()
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : null
        toast.error("Couldn't move the document", {
          description: toUserMessage(
            message,
            "Something went wrong while moving. Please try again."
          ),
        })
        return false
      }
    },
    [loadDocuments]
  )

  return {
    documents,
    documentsLoading,
    loadDocuments,
    recentDocuments,
    recentDocumentsLoading,
    loadRecentDocuments,
    openDocument,
    deleteDocuments,
    renameDocument,
    moveDocuments,
  }
}

export { mapStoredSections, useDocuments }
