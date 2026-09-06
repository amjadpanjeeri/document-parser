"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import type { DocStructDocument } from "@/lib/types"
import { useDocumentStore } from "@/stores/document-store"
import { DeleteDialog } from "./delete-dialog"
import { DocumentCard } from "./document-card"
import { EmptyState } from "./empty-state"
import { PageHeader } from "./page-header"
import { SelectionBar } from "./selection-bar"
import { UploadHero } from "./upload-hero"

type DocumentsViewProps = {
  documents?: DocStructDocument[]
  documentsLoading?: boolean
  activeTab?: "upload" | "documents"
  onOpenDocument?: (doc: DocStructDocument) => void
  /** Delete documents by ID — resolves true when all were deleted. */
  onDeleteDocuments?: (ids: string[]) => Promise<boolean>
  /** Reload the document list (e.g. after an upload finished). */
  onRefreshDocuments?: () => void
}

function DocumentsView({
  documents = [],
  documentsLoading = false,
  activeTab = "upload",
  onOpenDocument,
  onDeleteDocuments,
  onRefreshDocuments,
}: DocumentsViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null)
  const [deleting, setDeleting] = useState(false)
  const viewerOpen = useDocumentStore((s) => s.viewerOpen)
  const uploadStatus = useDocumentStore((s) => s.uploadStatus)
  const wasViewerOpenRef = useRef(viewerOpen)

  // If a document was just uploaded from this (empty) tab and the viewer is
  // closed, the DB save may still be finishing — refresh the list so the new
  // document appears without requiring a tab switch.
  useEffect(() => {
    const wasOpen = wasViewerOpenRef.current
    wasViewerOpenRef.current = viewerOpen

    if (activeTab !== "documents") return
    if (!wasOpen || viewerOpen) return
    if (uploadStatus !== "done") return

    const timer = setTimeout(() => onRefreshDocuments?.(), 1000)
    return () => clearTimeout(timer)
  }, [activeTab, viewerOpen, uploadStatus, onRefreshDocuments])

  if (activeTab === "upload") {
    return <UploadHero />
  }

  if (documents.length === 0) {
    if (documentsLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm">Loading documents...</p>
        </div>
      )
    }
    return <EmptyState />
  }

  const visibleIds = documents.map((doc) => doc.id)
  const selection = selectedIds.filter((id) => visibleIds.includes(id))
  const selectedCount = selection.length
  const allSelected = selectedCount === documents.length

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selId) => selId !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : visibleIds)
  }

  const clearSelection = () => setSelectedIds([])

  const requestDelete = (ids: string[]) => setDeleteTarget(ids)

  const confirmDelete = async () => {
    if (!deleteTarget || !onDeleteDocuments) {
      setDeleteTarget(null)
      return
    }
    setDeleting(true)
    const ok = await onDeleteDocuments(deleteTarget)
    setDeleting(false)
    setDeleteTarget(null)
    if (ok) clearSelection()
  }

  const deleteTargetNames = deleteTarget
    ? documents
        .filter((doc) => deleteTarget.includes(doc.id))
        .map((doc) => doc.name)
    : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        totalCount={documents.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {selectedCount > 0 && (
        <SelectionBar
          selectedCount={selectedCount}
          totalCount={documents.length}
          onToggleSelectAll={toggleSelectAll}
          onClear={clearSelection}
          onDelete={() => requestDelete(selection)}
        />
      )}

      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              viewMode="grid"
              onClick={() => onOpenDocument?.(doc)}
              selected={selectedIds.includes(doc.id)}
              onToggleSelect={toggleSelect}
              onDelete={(id) => requestDelete([id])}
            />
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              viewMode="list"
              onClick={() => onOpenDocument?.(doc)}
              selected={selectedIds.includes(doc.id)}
              onToggleSelect={toggleSelect}
              onDelete={(id) => requestDelete([id])}
            />
          ))}
        </div>
      )}

      <DeleteDialog
        open={deleteTarget !== null}
        documentNames={deleteTargetNames}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export { DocumentsView }
