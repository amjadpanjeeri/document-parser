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

  setUploading: (file: File) => void
  setStatusMessage: (message: string) => void
  setDragging: (dragging: boolean) => void
  completeUpload: (sections: ExtractedSection[]) => void
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

  setUploading: (file: File) => {
    const url = URL.createObjectURL(file)
    set({
      uploadStatus: "uploading",
      statusMessage: "Uploading file...",
      uploadedFile: file,
      filePreviewUrl: url,
    })
  },

  setStatusMessage: (message: string) => {
    set({ statusMessage: message })
  },

  setDragging: (dragging: boolean) => {
    set({ uploadStatus: dragging ? "dragging" : "idle" })
  },

  completeUpload: (sections: ExtractedSection[]) => {
    set({ uploadStatus: "done", extractedSections: sections })
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
      }
    })
  },

  openViewer: () => set({ viewerOpen: true }),
  closeViewer: () => set({ viewerOpen: false }),
}))

export { useDocumentStore }
