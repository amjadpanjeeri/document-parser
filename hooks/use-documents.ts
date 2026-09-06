"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { toUserMessage } from "@/lib/error-message"
import type { StoredDocument } from "@/lib/models/document"
import type {
  DocStructDocument,
  DocumentStatus,
  ExtractedSection,
} from "@/lib/types"
import { useDocumentStore } from "@/stores/document-store"

/**
 * Map a stored MongoDB document to the shape the UI listing expects.
 */
function mapStoredDocument(doc: StoredDocument): DocStructDocument {
  return {
    id: doc._id?.toString() || "",
    name: doc.filename,
    type: doc.documentType as DocStructDocument["type"],
    status: (doc.confidence >= 0.8
      ? "ready"
      : "needs_review") as DocumentStatus,
    uploadedAt: doc.createdAt.toISOString(),
    confidence: doc.confidence,
  }
}

/**
 * Map stored DB sections to the ExtractedSection shape the viewer expects.
 */
function mapStoredSections(
  sections: StoredDocument["sections"]
): ExtractedSection[] {
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
  activeTab: "upload" | "documents"
  setActiveTab: (tab: "upload" | "documents") => void
  documents: DocStructDocument[]
  documentsLoading: boolean
  loadDocuments: () => Promise<void>
  /** Open a saved document from the listing in the viewer. */
  openDocument: (doc: DocStructDocument) => Promise<void>
  /** Delete documents by ID — resolves true when all were deleted. */
  deleteDocuments: (ids: string[]) => Promise<boolean>
}

/**
 * Owns the documents-library tab: which tab is active, the document list,
 * and the load / open / delete flows backed by the server actions.
 */
function useDocuments(): UseDocumentsReturn {
  const [activeTab, setActiveTab] = useState<"upload" | "documents">("upload")
  const [documents, setDocuments] = useState<DocStructDocument[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)

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

  // Refresh the list whenever the user opens the Documents tab.
  useEffect(() => {
    if (activeTab === "documents") {
      loadDocuments()
    }
  }, [activeTab, loadDocuments])

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

  return {
    activeTab,
    setActiveTab,
    documents,
    documentsLoading,
    loadDocuments,
    openDocument,
    deleteDocuments,
  }
}

export { useDocuments }
