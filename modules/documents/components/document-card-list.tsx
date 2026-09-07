import {
  ExternalLink,
  FileText,
  FolderInput,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DocStructDocument } from "@/lib/types"
import { cn } from "@/lib/utils"
import { formatDocumentDate } from "../utils/format-document-date"
import { SelectToggle } from "./select-toggle"

type DocumentCardListProps = {
  document: DocStructDocument
  selected: boolean
  onClick?: () => void
  onToggleSelect?: () => void
  onDelete?: () => void
  onRename?: () => void
  onMove?: () => void
}

function DocumentCardList({
  document,
  selected,
  onClick,
  onToggleSelect,
  onDelete,
  onRename,
  onMove,
}: DocumentCardListProps) {
  return (
    <div
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors",
        selected && "border-primary/50 ring-1 ring-primary/40",
        onClick && "hover:bg-muted/50"
      )}
    >
      {onToggleSelect && (
        <SelectToggle
          checked={selected}
          onToggle={onToggleSelect}
          label={`Select ${document.name}`}
        />
      )}

      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {/* Thumbnail — images show the file itself, PDFs keep the icon */}
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
          {document.thumbnailUrl ? (
            // biome-ignore lint/performance/noImgElement: data URLs can't use next/image
            <img
              src={document.thumbnailUrl}
              alt={document.name}
              className="size-full rounded-lg object-cover"
            />
          ) : (
            <FileText className="size-5 text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p
            className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-sm"
            title={document.name}
          >
            {document.name}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-muted-foreground text-xs">
            <span
              className="min-w-0 max-w-32 overflow-hidden text-ellipsis whitespace-nowrap capitalize"
              title={document.type}
            >
              {document.type}
            </span>
            <span>·</span>
            <span>{formatDocumentDate(document.uploadedAt)}</span>
          </div>
        </div>
      </button>

      {document.status === "needs_review" && (
        <Badge className="hidden shrink-0 bg-amber-500/10 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 sm:inline-flex">
          Needs review
        </Badge>
      )}

      {/* Confidence */}
      {document.confidence !== undefined && (
        <span className="hidden w-12 shrink-0 text-right text-muted-foreground text-xs md:inline">
          {document.confidence}%
        </span>
      )}

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-xs"
          className="hidden text-muted-foreground lg:inline-flex"
          aria-label={`Open ${document.name}`}
          onClick={onClick}
        >
          <ExternalLink className="size-3.5" />
        </Button>
        {(onDelete || onRename || onMove) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`More actions for ${document.name}`}
                onClick={(event) => event.stopPropagation()}
              >
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRename && (
                <DropdownMenuItem onSelect={onRename}>
                  <Pencil />
                  Edit name
                </DropdownMenuItem>
              )}
              {onMove && (
                <DropdownMenuItem onSelect={onMove}>
                  <FolderInput />
                  Move to folder
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

export { DocumentCardList }
