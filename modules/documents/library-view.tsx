"use client"

import { Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import type { DocStructDocument } from "@/lib/types"
import { DeleteDialog } from "./delete-dialog"
import { EmptyState } from "./empty-state"
import { LibraryRenameDialog } from "./library-rename-dialog"
import { LibraryResults } from "./library-results"
import { LibrarySearch } from "./library-search"
import { getFilteredDocuments } from "./library-utils"
import { PageHeader } from "./page-header"
import { SelectionBar } from "./selection-bar"

type LibraryViewProps = {
  documents?: DocStructDocument[]
  documentsLoading?: boolean
  onOpenDocument?: (doc: DocStructDocument) => void
  onDeleteDocuments?: (ids: string[]) => Promise<boolean>
  onRenameDocument?: (id: string, filename: string) => Promise<boolean>
}

export function LibraryView({
  documents = [],
  documentsLoading = false,
  onOpenDocument,
  onDeleteDocuments,
  onRenameDocument,
}: LibraryViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [sort, setSort] = useState("date-desc")
  const [filter, setFilter] = useState("all")
  const [aiResultIds, setAiResultIds] = useState<string[] | null>(null)
  const [aiAnswer, setAiAnswer] = useState("")
  const [aiSearching, setAiSearching] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [renameTarget, setRenameTarget] = useState<DocStructDocument | null>(
    null
  )
  const [renameValue, setRenameValue] = useState("")
  const [renaming, setRenaming] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

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

  const filteredDocuments = getFilteredDocuments(
    documents,
    debouncedQuery,
    aiResultIds,
    filter,
    sort
  )
  const filteredIds = filteredDocuments.map((document) => document.id)
  const selection = selectedIds.filter((id) => filteredIds.includes(id))
  const selectedCount = selection.length
  const allSelected =
    filteredDocuments.length > 0 && selectedCount === filteredDocuments.length

  const toggleSelect = (id: string) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : filteredIds)
  }

  const clearSelection = () => setSelectedIds([])

  const requestDelete = (ids: string[]) => setDeleteTarget(ids)

  const confirmDelete = async () => {
    if (!deleteTarget || !onDeleteDocuments) {
      setDeleteTarget(null)
      return
    }

    setDeleting(true)
    const deleted = await onDeleteDocuments(deleteTarget)
    setDeleting(false)
    setDeleteTarget(null)
    if (deleted) clearSelection()
  }

  const requestRename = (id: string) => {
    const document = documents.find((item) => item.id === id)
    if (!document) return
    setRenameTarget(document)
    setRenameValue(document.name)
  }

  const confirmRename = async () => {
    if (!renameTarget || !onRenameDocument || !renameValue.trim()) return

    setRenaming(true)
    try {
      await onRenameDocument(renameTarget.id, renameValue.trim())
      toast.success("Filename updated")
      setRenameTarget(null)
    } catch (error) {
      toast.error("Couldn't rename the document", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setRenaming(false)
    }
  }

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

  const clearSearch = () => {
    setQuery("")
    setDebouncedQuery("")
    setAiResultIds(null)
    setAiAnswer("")
  }

  const deleteTargetNames = deleteTarget
    ? documents
        .filter((document) => deleteTarget.includes(document.id))
        .map((document) => document.name)
    : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        totalCount={filteredDocuments.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sort={sort}
        filter={filter}
        onSortChange={setSort}
        onFilterChange={setFilter}
      />

      <LibrarySearch
        query={query}
        aiSearching={aiSearching}
        onQueryChange={(nextQuery) => {
          setQuery(nextQuery)
          setAiResultIds(null)
          setAiAnswer("")
        }}
        onSearchWithAi={searchWithAi}
        onClear={clearSearch}
      />

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

      <LibraryResults
        documents={filteredDocuments}
        viewMode={viewMode}
        selectedIds={selectedIds}
        hasAiResults={aiResultIds !== null}
        onOpenDocument={onOpenDocument}
        onToggleSelect={toggleSelect}
        onDelete={(id) => requestDelete([id])}
        onRename={requestRename}
      />

      <DeleteDialog
        open={deleteTarget !== null}
        documentNames={deleteTargetNames}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <LibraryRenameDialog
        open={renameTarget !== null}
        value={renameValue}
        saving={renaming}
        onValueChange={setRenameValue}
        onClose={() => setRenameTarget(null)}
        onConfirm={confirmRename}
      />
    </div>
  )
}
