import {
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

type DocumentCardGridProps = {
  document: DocStructDocument
  selected: boolean
  onClick?: () => void
  onToggleSelect?: () => void
  onDelete?: () => void
  onRename?: () => void
  onMove?: () => void
}

function DocumentCardGrid({
  document,
  selected,
  onClick,
  onToggleSelect,
  onDelete,
  onRename,
  onMove,
}: DocumentCardGridProps) {
  const showActions = "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"

  return (
    <div
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors",
        selected && "border-primary/50 ring-1 ring-primary/40",
        onClick && "hover:bg-muted/30"
      )}
    >
      {/* Open card */}
      <button
        type="button"
        onClick={onClick}
        className="flex w-full cursor-pointer flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        {/* Thumbnail — images show the file itself, PDFs keep the icon */}
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted/50">
          {document.thumbnailUrl ? (
            // biome-ignore lint/performance/noImgElement: data URLs can't use next/image
            <img
              src={document.thumbnailUrl}
              alt={document.name}
              className="size-full object-cover"
            />
          ) : (
            <FileText className="size-10 text-muted-foreground/50" />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p
            className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-sm"
            title={document.name}
          >
            {document.name}
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className="min-w-0 text-ellipsis whitespace-nowrap text-xs font-medium capitalize"
              title={document.type}
            >
              {document.type}
            </Badge>
            {document.status === "needs_review" && (
              <Badge className="max-w-28 truncate bg-amber-500/10 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                Needs review
              </Badge>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between text-muted-foreground text-xs">
            <span>{formatDocumentDate(document.uploadedAt)}</span>
            {document.confidence !== undefined && (
              <span>{document.confidence}%</span>
            )}
          </div>
        </div>
      </button>

      {/* Select */}
      {onToggleSelect && (
        <div className={cn("absolute top-2 left-2", showActions)}>
          <SelectToggle
            checked={selected}
            onToggle={onToggleSelect}
            label={`Select ${document.name}`}
          />
        </div>
      )}

      {/* More actions */}
      {(onDelete || onRename || onMove) && (
        <div
          className={cn(
            "absolute top-2 right-2 rounded-lg bg-background/80 p-0.5 shadow-sm backdrop-blur-sm transition-opacity",
            showActions
          )}
        >
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
        </div>
      )}
    </div>
  )
}

export { DocumentCardGrid }
