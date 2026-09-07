"use client"

import { useEffect } from "react"

import { useDocuments } from "@/hooks/use-documents"
import { useFolders } from "@/hooks/use-folders"
import { DocumentViewer } from "@/modules/documents/components/document-viewer"
import { LibraryView } from "@/modules/documents/components/library-view"
import { Navbar } from "@/modules/documents/components/navbar"
import { useDocumentStore } from "@/stores/document-store"

export default function DocumentsPage() {
  const { viewerOpen, closeViewer } = useDocumentStore()
  const {
    documents,
    documentsLoading,
    openDocument,
    deleteDocuments,
    renameDocument,
    moveDocuments,
    loadDocuments,
  } = useDocuments()
  const { folders, foldersLoading, createFolder, renameFolder, deleteFolder } =
    useFolders()

  const handleDeleteFolder = async (id: string, deleteContents: boolean) => {
    const deleted = await deleteFolder(id, deleteContents)
    // Folder deletion can move or remove documents, so refresh the library.
    if (deleted) await loadDocuments()
    return deleted
  }

  useEffect(() => {
    const documentId = new URLSearchParams(window.location.search).get(
      "documentId"
    )
    if (!documentId) return

    const document = documents.find((item) => item.id === documentId)
    if (!document) return

    openDocument(document)
    window.history.replaceState({}, "", "/documents")
  }, [documents, openDocument])

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

      <Navbar />
      <main className="flex-1 px-4 py-4 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <LibraryView
            documents={documents}
            documentsLoading={documentsLoading}
            folders={folders}
            foldersLoading={foldersLoading}
            onOpenDocument={openDocument}
            onDeleteDocuments={deleteDocuments}
            onRenameDocument={renameDocument}
            onMoveDocuments={moveDocuments}
            onCreateFolder={createFolder}
            onRenameFolder={renameFolder}
            onDeleteFolder={handleDeleteFolder}
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
