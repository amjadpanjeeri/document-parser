import { create } from "zustand"

import type { ExtractedSection } from "@/lib/types"

type UploadStatus = "idle" | "dragging" | "uploading" | "done"

type DocumentStore = {
  uploadStatus: UploadStatus
  statusMessage: string
  uploadedFile: File | null
  filePreviewUrl: string | null
  viewerOpen: boolean
  extractedSections: ExtractedSection[]
  extractionTimeMs: number | null

  setUploading: (file: File) => void
  setStatusMessage: (message: string) => void
  setDragging: (dragging: boolean) => void
  completeUpload: (sections: ExtractedSection[], timeMs?: number) => void
  resetUpload: () => void
  openViewer: () => void
  closeViewer: () => void
}

const useDocumentStore = create<DocumentStore>((set) => ({
  uploadStatus: "idle",
  statusMessage: "",
  uploadedFile: null,
  filePreviewUrl: null,
  viewerOpen: false,
  extractedSections: [],
  extractionTimeMs: null,

  setUploading: (file: File) => {
    const url = URL.createObjectURL(file)
    set({
      uploadStatus: "uploading",
      statusMessage: "Uploading file...",
      uploadedFile: file,
      filePreviewUrl: url,
      extractionTimeMs: null,
    })
  },

  setStatusMessage: (message: string) => {
    set({ statusMessage: message })
  },

  setDragging: (dragging: boolean) => {
    set({ uploadStatus: dragging ? "dragging" : "idle" })
  },

  completeUpload: (sections: ExtractedSection[], timeMs?: number) => {
    set({
      uploadStatus: "done",
      extractedSections: sections,
      extractionTimeMs: timeMs ?? null,
    })
  },

  resetUpload: () => {
    set((state) => {
      if (state.filePreviewUrl) URL.revokeObjectURL(state.filePreviewUrl)
      return {
        uploadStatus: "idle",
        statusMessage: "",
        uploadedFile: null,
        filePreviewUrl: null,
        extractedSections: [],
        extractionTimeMs: null,
      }
    })
  },

  openViewer: () => set({ viewerOpen: true }),
  closeViewer: () => set({ viewerOpen: false }),
}))

export { useDocumentStore }
