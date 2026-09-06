"use client"

import { ArrowRight, FileText, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { DocStructDocument } from "@/lib/types"
import { cn } from "@/lib/utils"

type RecentDocumentsProps = {
  /** Up to 3 most recent documents for the landing page. */
  documents?: DocStructDocument[]
  loading?: boolean
  /** Open a document in the viewer. */
  onOpen?: (doc: DocStructDocument) => void
  /** Show the link to the documents page. */
  onViewAll?: () => void
}

function RecentDocuments({
  documents = [],
  loading = false,
  onOpen,
  onViewAll,
}: RecentDocumentsProps) {
  if (!loading && documents.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-lg tracking-tight">
            Recent documents
          </h2>
          <p className="text-muted-foreground text-sm">
            Your latest uploads, ready to view and edit.
          </p>
        </div>
        {onViewAll && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onViewAll}
          >
            See all documents
            <ArrowRight className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Items */}
      {loading && documents.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border py-8 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading recent documents...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {documents.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onOpen?.(doc)}
              className={cn(
                "group flex w-full cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors",
                onOpen && "hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileText className="size-4.5 text-muted-foreground" />
                </div>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">
                  {doc.name}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 text-muted-foreground text-xs">
                <span className="truncate">
                  {doc.type}
                  {doc.confidence !== undefined && ` · ${doc.confidence}%`}
                </span>
                {onOpen && (
                  <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export { RecentDocuments }
