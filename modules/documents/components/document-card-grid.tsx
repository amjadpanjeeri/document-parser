import { FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

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
import { SelectToggle } from "./select-toggle"

type DocumentCardGridProps = {
  document: DocStructDocument
  selected: boolean
  statusLabel: string
  statusClassName: string
  onClick?: () => void
  onToggleSelect?: () => void
  onDelete?: () => void
  onRename?: () => void
}

function DocumentCardGrid({
  document,
  selected,
  statusLabel,
  statusClassName,
  onClick,
  onToggleSelect,
  onDelete,
  onRename,
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
        {/* Thumbnail */}
        <div className="flex aspect-[4/3] items-center justify-center bg-muted/50">
          <FileText className="size-10 text-muted-foreground/50" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="truncate font-medium text-sm">{document.name}</p>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className="text-xs font-medium capitalize"
            >
              {document.type}
            </Badge>
            <Badge
              className={cn("text-xs font-medium capitalize", statusClassName)}
            >
              {statusLabel}
            </Badge>
          </div>

          <div className="mt-auto flex items-center justify-between text-muted-foreground text-xs">
            <span>{document.uploadedAt}</span>
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
      {(onDelete || onRename) && (
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
