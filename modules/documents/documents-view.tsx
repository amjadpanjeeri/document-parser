"use client"

import { useState } from "react"

import type { DocStructDocument } from "@/lib/types"
import { DocumentCard } from "./document-card"
import { EmptyState } from "./empty-state"
import { PageHeader } from "./page-header"
import { UploadHero } from "./upload-hero"

type DocumentsViewProps = {
  documents?: DocStructDocument[]
  activeTab?: "upload" | "documents"
}

function DocumentsView({
  documents = [],
  activeTab = "upload",
}: DocumentsViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  if (activeTab === "upload") {
    return <UploadHero />
  }

  if (documents.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        totalCount={documents.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} viewMode="grid" />
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  )
}

export { DocumentsView }
