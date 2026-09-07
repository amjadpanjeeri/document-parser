"use client"

import { CommandPalette } from "@/components/command-palette"
import { useDocuments } from "@/hooks/use-documents"
import { DocumentViewer } from "@/modules/documents/components/document-viewer"
import { Navbar } from "@/modules/documents/components/navbar"
import { LandingView } from "@/modules/home/components/landing-view"
import { useDocumentStore } from "@/stores/document-store"

export default function Page() {
  const { viewerOpen, closeViewer } = useDocumentStore()
  const { recentDocuments, recentDocumentsLoading, openDocument } =
    useDocuments()

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute -top-48 -left-48 size-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
        <div className="absolute top-1/3 -right-32 size-[500px] rounded-full bg-violet-500/[0.06] blur-[100px]" />
        <div className="absolute -bottom-48 left-1/3 size-[400px] rounded-full bg-emerald-500/[0.06] blur-[100px]" />
      </div>

      <CommandPalette />
      <Navbar />
      <main className="flex-1 px-4 py-4 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <LandingView
            recentDocuments={recentDocuments}
            recentDocumentsLoading={recentDocumentsLoading}
            onOpenDocument={openDocument}
          />
          <DocumentViewer
            open={viewerOpen}
            onOpenChange={(v) => {
              if (!v) closeViewer()
            }}
          />
        </div>
      </main>
    </div>
  )
}
