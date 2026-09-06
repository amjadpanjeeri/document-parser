import { ExternalLink, FileText, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DocStructDocument } from "@/lib/types"
import { cn } from "@/lib/utils"
import { SelectToggle } from "./select-toggle"

type DocumentCardListProps = {
  document: DocStructDocument
  selected: boolean
  statusLabel: string
  statusClassName: string
  onClick?: () => void
  onToggleSelect?: () => void
  onDelete?: () => void
}

function DocumentCardList({
  document,
  selected,
  statusLabel,
  statusClassName,
  onClick,
  onToggleSelect,
  onDelete,
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
        {/* Thumbnail */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileText className="size-5 text-muted-foreground" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-sm">{document.name}</p>
          <div className="mt-0.5 flex items-center gap-2 text-muted-foreground text-xs">
            <span>{document.type}</span>
            <span>·</span>
            <span>{document.uploadedAt}</span>
          </div>
        </div>
      </button>

      {/* Status */}
      <Badge className={cn("hidden shrink-0 sm:inline-flex", statusClassName)}>
        {statusLabel}
      </Badge>

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
        {onDelete && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${document.name}`}
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

export { DocumentCardList }
