"use client"

import { Loader2, Search, Sparkles, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { DocStructDocument } from "@/lib/types"
import { DeleteDialog } from "./delete-dialog"
import { DocumentCard } from "./document-card"
import { EmptyState } from "./empty-state"
import { PageHeader } from "./page-header"
import { SelectionBar } from "./selection-bar"

type LibraryViewProps = {
  documents?: DocStructDocument[]
  documentsLoading?: boolean
  onOpenDocument?: (doc: DocStructDocument) => void
  onDeleteDocuments?: (ids: string[]) => Promise<boolean>
}

export function LibraryView({
  documents = [],
  documentsLoading = false,
  onOpenDocument,
  onDeleteDocuments,
}: LibraryViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [query, setQuery] = useState("")
  const [aiResultIds, setAiResultIds] = useState<string[] | null>(null)
  const [aiAnswer, setAiAnswer] = useState("")
  const [aiSearching, setAiSearching] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const keywordDocuments = searchTerms.length
    ? documents.filter((doc) =>
        searchTerms.every((term) =>
          doc.searchText?.toLowerCase().includes(term)
        )
      )
    : documents
  const filteredDocuments = aiResultIds
    ? documents.filter((doc) => aiResultIds.includes(doc.id))
    : keywordDocuments
  const filteredIds = filteredDocuments.map((doc) => doc.id)
  const selection = selectedIds.filter((id) => filteredIds.includes(id))
  const selectedCount = selection.length
  const allSelected =
    filteredDocuments.length > 0 && selectedCount === filteredDocuments.length

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selId) => selId !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : filteredIds)
  }

  const clearSelection = () => setSelectedIds([])

  const requestDelete = (ids: string[]) => setDeleteTarget(ids)

  const searchWithAi = async () => {
    if (!query.trim()) return
    setAiSearching(true)
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      const result = (await response.json()) as {
        success?: boolean
        ids?: string[]
        answer?: string
        error?: string
      }
      if (!response.ok || !result.success) {
        throw new Error(result.error || "AI search failed")
      }
      setAiResultIds(result.ids ?? [])
      setAiAnswer(result.answer ?? "")
    } catch (error) {
      toast.error("AI search failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setAiSearching(false)
    }
  }

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
        totalCount={filteredDocuments.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setAiResultIds(null)
            setAiAnswer("")
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") searchWithAi()
          }}
          placeholder="Search or ask about your documents..."
          className="h-10 pl-9 pr-24"
          aria-label="Search documents and extracted fields"
        />
        <div className="absolute top-1/2 right-1 flex -translate-y-1/2 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={searchWithAi}
            disabled={!query.trim() || aiSearching}
            aria-label="Search with AI"
            title="Search with AI"
          >
            {aiSearching ? <Loader2 className="animate-spin" /> : <Sparkles />}
          </Button>
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setQuery("")
                setAiResultIds(null)
                setAiAnswer("")
              }}
              aria-label="Clear document search"
            >
              <X />
            </Button>
          )}
        </div>
      </div>

      {aiAnswer && (
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>{aiAnswer}</p>
        </div>
      )}

      {selectedCount > 0 && (
        <SelectionBar
          selectedCount={selectedCount}
          totalCount={filteredDocuments.length}
          onToggleSelectAll={toggleSelectAll}
          onClear={clearSelection}
          onDelete={() => requestDelete(selection)}
        />
      )}

      {filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Search className="size-6 text-muted-foreground" />
          <p className="font-medium text-sm">
            {aiResultIds
              ? "AI found no matching documents"
              : "No matching documents"}
          </p>
          <p className="text-muted-foreground text-sm">
            Try a filename, field label, or extracted value.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDocuments.map((doc) => (
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
      ) : (
        <div className="flex flex-col gap-2">
          {filteredDocuments.map((doc) => (
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
