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

        {/* Floating dots */}
        <div className="absolute top-20 left-[15%] size-1 rounded-full bg-primary/20" />
        <div className="absolute top-40 right-[20%] size-1.5 rounded-full bg-violet-500/20" />
        <div className="absolute bottom-32 left-[25%] size-1 rounded-full bg-emerald-500/20" />
        <div className="absolute top-1/2 left-[8%] size-1.5 rounded-full bg-primary/15" />
        <div className="absolute bottom-48 right-[12%] size-1 rounded-full bg-violet-500/15" />
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
