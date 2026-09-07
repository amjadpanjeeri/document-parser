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
        {/* Top-left gradient */}
        <div
          className="fixed inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 80% 60% at 12% 8%,
                oklch(0.55 0.22 264 / 0.35),
                transparent 60%
              ),
              radial-gradient(
                ellipse 60% 50% at 8% 12%,
                oklch(0.7 0.18 282 / 0.3),
                transparent 55%
              )
            `,
          }}
        />

        {/* Bottom-right gradient */}
        <div
          className="fixed inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 90% 70% at 92% 92%,
                oklch(0.55 0.24 27.3 / 0.28),
                transparent 65%
              ),
              radial-gradient(
                ellipse 60% 50% at 96% 96%,
                oklch(0.65 0.18 264 / 0.22),
                transparent 55%
              )
            `,
          }}
        />
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
