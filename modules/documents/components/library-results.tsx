"use client"

import { Search } from "lucide-react"

import type { DocStructDocument, Folder } from "@/lib/types"
import { DocumentCard } from "./document-card"
import { FolderCard } from "./folder-card"

type LibraryResultsProps = {
  documents: DocStructDocument[]
  folders: Folder[]
  /** Item count (documents + subfolders) per folder id. */
  folderItemCounts: Record<string, number>
  viewMode: "grid" | "list"
  selectedIds: string[]
  hasAiResults: boolean
  onOpenDocument?: (doc: DocStructDocument) => void
  onOpenFolder: (id: string) => void
  onToggleSelect: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string) => void
  /** When undefined (no folders exist yet), the Move action is hidden. */
  onMove?: (id: string) => void
}

function LibraryResults({
  documents,
  folders,
  folderItemCounts,
  viewMode,
  selectedIds,
  hasAiResults,
  onOpenDocument,
  onOpenFolder,
  onToggleSelect,
  onDelete,
  onRename,
  onMove,
}: LibraryResultsProps) {
  if (documents.length === 0 && folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <Search className="size-6 text-muted-foreground" />
        <p className="font-medium text-sm">
          {hasAiResults
            ? "AI found no matching documents"
            : "No matching documents"}
        </p>
        <p className="text-muted-foreground text-sm">
          Try a filename, field label, or extracted value.
        </p>
      </div>
    )
  }

  const folderCards = folders.map((folder) => (
    <FolderCard
      key={folder.id}
      folder={folder}
      itemCount={folderItemCounts[folder.id] ?? 0}
      viewMode={viewMode}
      onClick={() => onOpenFolder(folder.id)}
    />
  ))

  const documentCards = documents.map((document) => (
    <DocumentCard
      key={document.id}
      document={document}
      viewMode={viewMode}
      onClick={() => onOpenDocument?.(document)}
      selected={selectedIds.includes(document.id)}
      onToggleSelect={onToggleSelect}
      onDelete={onDelete}
      onRename={onRename}
      onMove={onMove}
    />
  ))

  const items = [...folderCards, ...documentCards]

  return viewMode === "grid" ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items}
    </div>
  ) : (
    <div className="flex flex-col gap-2">{items}</div>
  )
}

export { LibraryResults }
