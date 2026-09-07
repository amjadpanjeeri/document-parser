"use client"

import { FolderOpen, Loader2, Sparkles } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import type { DocStructDocument, Folder } from "@/lib/types"
import { getDescendantFolderIds, getFolderPath } from "../utils/folder-utils"
import { getFilteredDocuments } from "../utils/library-utils"
import { DeleteDialog } from "./delete-dialog"
import { DeleteFolderDialog } from "./delete-folder-dialog"
import { EmptyState } from "./empty-state"
import { FolderBreadcrumb } from "./folder-breadcrumb"
import { FolderSidebar } from "./folder-sidebar"
import { LibraryRenameDialog } from "./library-rename-dialog"
import { LibraryResults } from "./library-results"
import { LibrarySearch } from "./library-search"
import { MoveToFolderDialog } from "./move-to-folder-dialog"
import { NewFolderDialog } from "./new-folder-dialog"
import { PageHeader } from "./page-header"
import { RenameFolderDialog } from "./rename-folder-dialog"
import { SelectionBar } from "./selection-bar"

type LibraryViewProps = {
  documents?: DocStructDocument[]
  documentsLoading?: boolean
  folders?: Folder[]
  foldersLoading?: boolean
  onOpenDocument?: (doc: DocStructDocument) => void
  onDeleteDocuments?: (ids: string[]) => Promise<boolean>
  onRenameDocument?: (id: string, filename: string) => Promise<boolean>
  onMoveDocuments?: (ids: string[], folderId: string | null) => Promise<boolean>
  onCreateFolder?: (name: string, parentId: string | null) => Promise<boolean>
  onRenameFolder?: (id: string, name: string) => Promise<boolean>
  onDeleteFolder?: (id: string, deleteContents: boolean) => Promise<boolean>
}

type DeleteFolderTarget = {
  folder: Folder
  affectedDocumentCount: number
}

export function LibraryView({
  documents = [],
  documentsLoading = false,
  folders = [],
  foldersLoading = false,
  onOpenDocument,
  onDeleteDocuments,
  onRenameDocument,
  onMoveDocuments,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: LibraryViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
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
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [folderCreating, setFolderCreating] = useState(false)
  const [renameFolderTarget, setRenameFolderTarget] = useState<Folder | null>(
    null
  )
  const [renameFolderValue, setRenameFolderValue] = useState("")
  const [folderRenaming, setFolderRenaming] = useState(false)
  const [deleteFolderTarget, setDeleteFolderTarget] =
    useState<DeleteFolderTarget | null>(null)
  const [folderDeleting, setFolderDeleting] = useState(false)
  const [moveTargetIds, setMoveTargetIds] = useState<string[] | null>(null)
  const [moving, setMoving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const currentFolder =
    folders.find((folder) => folder.id === currentFolderId) ?? null
  const folderPath = currentFolder
    ? getFolderPath(folders, currentFolder.parentId)
    : []
  const folderDocuments = documents.filter(
    (document) => (document.folderId ?? null) === currentFolderId
  )
  const subfolders = folders.filter(
    (folder) => (folder.parentId ?? null) === currentFolderId
  )
  const visibleItemCount = folderDocuments.length + subfolders.length

  const folderDocumentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const document of documents) {
      if (document.folderId) {
        counts[document.folderId] = (counts[document.folderId] ?? 0) + 1
      }
    }
    return counts
  }, [documents])

  const folderItemCounts = useMemo(() => {
    const counts = { ...folderDocumentCounts }
    for (const folder of folders) {
      if (folder.parentId) {
        counts[folder.parentId] = (counts[folder.parentId] ?? 0) + 1
      }
    }
    return counts
  }, [folderDocumentCounts, folders])

  const libraryEmpty =
    currentFolderId === null && documents.length === 0 && folders.length === 0

  if (libraryEmpty) {
    if (documentsLoading || foldersLoading) {
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
    folderDocuments,
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

  const hasFolders = folders.length > 0

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

  const confirmCreateFolder = async (name: string) => {
    if (!name.trim() || !onCreateFolder) return
    setFolderCreating(true)
    const created = await onCreateFolder(name.trim(), currentFolderId)
    setFolderCreating(false)
    if (created) setNewFolderOpen(false)
  }

  const requestRenameFolder = (folder: Folder) => {
    setRenameFolderTarget(folder)
    setRenameFolderValue(folder.name)
  }

  const confirmRenameFolder = async () => {
    if (!renameFolderTarget || !onRenameFolder || !renameFolderValue.trim())
      return

    setFolderRenaming(true)
    const renamed = await onRenameFolder(
      renameFolderTarget.id,
      renameFolderValue.trim()
    )
    setFolderRenaming(false)
    if (renamed) setRenameFolderTarget(null)
  }

  const requestDeleteFolder = (folder: Folder) => {
    const descendantIds = getDescendantFolderIds(folders, folder.id)
    const affectedDocumentCount = documents.filter(
      (document) =>
        document.folderId != null && descendantIds.includes(document.folderId)
    ).length
    setDeleteFolderTarget({ folder, affectedDocumentCount })
  }

  const confirmDeleteFolder = async (deleteContents: boolean) => {
    if (!deleteFolderTarget || !onDeleteFolder) {
      setDeleteFolderTarget(null)
      return
    }

    const target = deleteFolderTarget
    setFolderDeleting(true)
    const deleted = await onDeleteFolder(target.folder.id, deleteContents)
    setFolderDeleting(false)

    if (deleted) {
      const descendantIds = getDescendantFolderIds(folders, target.folder.id)
      if (currentFolderId && descendantIds.includes(currentFolderId)) {
        setCurrentFolderId(target.folder.parentId)
      }
      clearSelection()
    }
    setDeleteFolderTarget(null)
  }

  const requestMove = (ids: string[]) => setMoveTargetIds(ids)

  const confirmMove = async (folderId: string | null) => {
    if (!moveTargetIds || !onMoveDocuments) {
      setMoveTargetIds(null)
      return
    }

    setMoving(true)
    const moved = await onMoveDocuments(moveTargetIds, folderId)
    setMoving(false)
    setMoveTargetIds(null)
    if (moved) clearSelection()
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

  const folderIsEmpty =
    currentFolderId !== null &&
    visibleItemCount === 0 &&
    !debouncedQuery &&
    aiResultIds === null

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <FolderSidebar
        folders={folders}
        folderCounts={folderDocumentCounts}
        totalDocumentCount={documents.length}
        currentFolderId={currentFolderId}
        onNavigate={setCurrentFolderId}
        onCreateFolder={() => setNewFolderOpen(true)}
        onRenameFolder={requestRenameFolder}
        onDeleteFolder={requestDeleteFolder}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {currentFolder && (
          <FolderBreadcrumb
            path={folderPath}
            currentFolderName={currentFolder.name}
            onNavigate={setCurrentFolderId}
          />
        )}

        <PageHeader
          totalCount={visibleItemCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sort={sort}
          filter={filter}
          onSortChange={setSort}
          onFilterChange={setFilter}
          onCreateFolder={() => setNewFolderOpen(true)}
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
            onMove={hasFolders ? () => requestMove(selection) : undefined}
            onDelete={() => requestDelete(selection)}
          />
        )}

        {folderIsEmpty ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <FolderOpen className="size-6 text-muted-foreground" />
            <p className="font-medium text-sm">This folder is empty</p>
            <p className="text-muted-foreground text-sm">
              Move documents here or create a subfolder.
            </p>
          </div>
        ) : (
          <LibraryResults
            documents={filteredDocuments}
            folders={subfolders}
            folderItemCounts={folderItemCounts}
            viewMode={viewMode}
            selectedIds={selectedIds}
            hasAiResults={aiResultIds !== null}
            onOpenDocument={onOpenDocument}
            onOpenFolder={setCurrentFolderId}
            onToggleSelect={toggleSelect}
            onDelete={(id) => requestDelete([id])}
            onRename={requestRename}
            onMove={hasFolders ? (id) => requestMove([id]) : undefined}
          />
        )}

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

        <NewFolderDialog
          open={newFolderOpen}
          locationLabel={
            currentFolder
              ? `Create a folder inside “${currentFolder.name}”.`
              : undefined
          }
          saving={folderCreating}
          onClose={() => setNewFolderOpen(false)}
          onConfirm={confirmCreateFolder}
        />

        <RenameFolderDialog
          open={renameFolderTarget !== null}
          value={renameFolderValue}
          saving={folderRenaming}
          onValueChange={setRenameFolderValue}
          onClose={() => setRenameFolderTarget(null)}
          onConfirm={confirmRenameFolder}
        />

        <DeleteFolderDialog
          open={deleteFolderTarget !== null}
          folderName={deleteFolderTarget?.folder.name ?? ""}
          affectedDocumentCount={deleteFolderTarget?.affectedDocumentCount ?? 0}
          saving={folderDeleting}
          onClose={() => setDeleteFolderTarget(null)}
          onConfirm={confirmDeleteFolder}
        />

        <MoveToFolderDialog
          open={moveTargetIds !== null}
          documentCount={moveTargetIds?.length ?? 0}
          folders={folders}
          saving={moving}
          onClose={() => setMoveTargetIds(null)}
          onConfirm={confirmMove}
        />
      </div>
    </div>
  )
}
