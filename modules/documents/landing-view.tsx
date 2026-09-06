"use client"

import { ArrowRight, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import type { DocStructDocument } from "@/lib/types"
import { RecentDocuments } from "./recent-documents"
import { UploadHero } from "./upload-hero"

type LandingViewProps = {
  recentDocuments?: DocStructDocument[]
  recentDocumentsLoading?: boolean
  onOpenDocument?: (doc: DocStructDocument) => void
  onViewAll?: () => void
}

export function LandingView({
  recentDocuments = [],
  recentDocumentsLoading = false,
  onOpenDocument,
  onViewAll,
}: LandingViewProps) {
  return (
    <div className="flex flex-col gap-10">
      <UploadHero />

      {/* Recent documents */}
      <RecentDocuments
        documents={recentDocuments}
        loading={recentDocumentsLoading}
        onOpen={onOpenDocument}
        onViewAll={() => {
          window.location.href = "/documents"
        }}
      />

      {/* View all link */}
      {onViewAll && (
        <div className="flex justify-end">
          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm transition-colors hover:bg-muted hover:text-foreground"
          >
            View all documents
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
