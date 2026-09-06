"use client"

import { Search } from "lucide-react"

import type { DocStructDocument } from "@/lib/types"
import { DocumentCard } from "./document-card"

type LibraryResultsProps = {
  documents: DocStructDocument[]
  viewMode: "grid" | "list"
  selectedIds: string[]
  hasAiResults: boolean
  onOpenDocument?: (doc: DocStructDocument) => void
  onToggleSelect: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string) => void
}

function LibraryResults({
  documents,
  viewMode,
  selectedIds,
  hasAiResults,
  onOpenDocument,
  onToggleSelect,
  onDelete,
  onRename,
}: LibraryResultsProps) {
  if (documents.length === 0) {
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

  const cards = documents.map((document) => (
    <DocumentCard
      key={document.id}
      document={document}
      viewMode={viewMode}
      onClick={() => onOpenDocument?.(document)}
      selected={selectedIds.includes(document.id)}
      onToggleSelect={onToggleSelect}
      onDelete={onDelete}
      onRename={onRename}
    />
  ))

  return viewMode === "grid" ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards}
    </div>
  ) : (
    <div className="flex flex-col gap-2">{cards}</div>
  )
}

export { LibraryResults }
