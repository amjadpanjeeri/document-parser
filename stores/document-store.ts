import { create } from "zustand"

import type { ExtractedSection } from "@/lib/types"

type UploadStatus = "idle" | "dragging" | "uploading" | "done"

type DocumentStore = {
  uploadStatus: UploadStatus
  uploadedFile: File | null
  filePreviewUrl: string | null
  viewerOpen: boolean
  extractedSections: ExtractedSection[]

  setUploading: (file: File) => void
  setDragging: (dragging: boolean) => void
  completeUpload: (sections: ExtractedSection[]) => void
  resetUpload: () => void
  openViewer: () => void
  closeViewer: () => void
}

const useDocumentStore = create<DocumentStore>((set) => ({
  uploadStatus: "idle",
  uploadedFile: null,
  filePreviewUrl: null,
  viewerOpen: false,
  extractedSections: [],

  setUploading: (file: File) => {
    const url = URL.createObjectURL(file)
    set({ uploadStatus: "uploading", uploadedFile: file, filePreviewUrl: url })
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
