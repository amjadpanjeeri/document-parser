import { ExternalLink, FileText, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DocStructDocument, DocumentStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusConfig: Record<
  DocumentStatus,
  { label: string; className: string }
> = {
  processing: {
    label: "Processing",
    className:
      "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  },
  needs_review: {
    label: "Needs Review",
    className:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  },
  ready: {
    label: "Ready",
    className:
      "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
  },
}

type DocumentCardProps = {
  document: DocStructDocument
  viewMode: "grid" | "list"
}

function DocumentCard({ document, viewMode }: DocumentCardProps) {
  const status = statusConfig[document.status]

  if (viewMode === "list") {
    return (
      <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/50">
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

        {/* Status */}
        <Badge className={cn("shrink-0", status.className)}>
          {status.label}
        </Badge>

        {/* Confidence */}
        {document.confidence !== undefined && (
          <span className="hidden w-12 shrink-0 text-right text-muted-foreground text-xs sm:inline">
            {document.confidence}%
          </span>
        )}

        {/* Actions */}
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon-xs">
            <ExternalLink className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs">
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card transition-colors hover:bg-muted/30">
      {/* Thumbnail */}
      <div className="flex aspect-[4/3] items-center justify-center rounded-t-xl bg-muted/50">
        <FileText className="size-10 text-muted-foreground/50" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="truncate font-medium text-sm">{document.name}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="text-[10px]">
            {document.type}
          </Badge>
          <Badge className={cn("text-[10px]", status.className)}>
            {status.label}
          </Badge>
        </div>

        <div className="mt-auto flex items-center justify-between text-muted-foreground text-xs">
          <span>{document.uploadedAt}</span>
          {document.confidence !== undefined && (
            <span>{document.confidence}%</span>
          )}
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute top-2 right-2 flex gap-1 rounded-lg bg-background/80 p-1 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon-xs">
          <ExternalLink className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon-xs">
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  )
}

export { DocumentCard }
