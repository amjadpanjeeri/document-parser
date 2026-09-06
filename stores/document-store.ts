import { create } from "zustand"

import type { ExtractedSection } from "@/lib/types"

type UploadStatus = "idle" | "dragging" | "uploading" | "done"

type DocumentStore = {
  uploadStatus: UploadStatus
  statusMessage: string
  uploadedFile: File | null
  fileNameOverride: string | null
  filePreviewUrl: string | null
  viewerOpen: boolean
  extractedSections: ExtractedSection[]
  extractionTimeMs: number | null
  documentId: string | null
  documentType: string | null
  documentConfidence: number | null
  /** When opened from the documents listing (not after extraction) */
  isSavedDocument: boolean
  /** Filename when opened from listing (no uploadedFile available) */
  savedFileName: string | null

  setUploading: (file: File) => void
  setStatusMessage: (message: string) => void
  setFileNameOverride: (fileName: string) => void
  setDragging: (dragging: boolean) => void
  completeUpload: (
    sections: ExtractedSection[],
    timeMs?: number,
    meta?: { documentId?: string; documentType?: string; confidence?: number }
  ) => void
  updateExtractedSections: (sections: ExtractedSection[]) => void
  setSavedFileName: (fileName: string) => void
  /** Update a single field's value across all sections */
  updateFieldValue: (key: string, value: string) => void
  resetUpload: () => void
  openViewer: () => void
  closeViewer: () => void
  /** Open a previously saved document from the DB listing */
  openDocumentFromDb: (doc: {
    documentId: string
    fileName: string
    documentType: string
    confidence: number
    sections: ExtractedSection[]
  }) => void
}

const useDocumentStore = create<DocumentStore>((set) => ({
  uploadStatus: "idle",
  statusMessage: "",
  uploadedFile: null,
  fileNameOverride: null,
  filePreviewUrl: null,
  viewerOpen: false,
  extractedSections: [],
  extractionTimeMs: null,
  documentId: null,
  documentType: null,
  documentConfidence: null,
  isSavedDocument: false,
  savedFileName: null,

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

  setFileNameOverride: (fileName: string) => {
    set({ fileNameOverride: fileName.trim() || null })
  },

  setDragging: (dragging: boolean) => {
    set({ uploadStatus: dragging ? "dragging" : "idle" })
  },

  completeUpload: (
    sections: ExtractedSection[],
    timeMs?: number,
    meta?: { documentId?: string; documentType?: string; confidence?: number }
  ) => {
    set({
      uploadStatus: "done",
      extractedSections: sections,
      extractionTimeMs: timeMs ?? null,
      documentId: meta?.documentId ?? null,
      documentType: meta?.documentType ?? null,
      documentConfidence: meta?.confidence ?? null,
    })
  },

  updateExtractedSections: (sections: ExtractedSection[]) => {
    set({ extractedSections: sections })
  },

  setSavedFileName: (fileName: string) => {
    set({ savedFileName: fileName })
  },

  updateFieldValue: (key: string, value: string) => {
    set((state) => ({
      extractedSections: state.extractedSections.map((section) => ({
        ...section,
        fields: section.fields.map((field) =>
          field.key === key ? { ...field, value } : field
        ),
      })),
    }))
  },

  resetUpload: () => {
    set((state) => {
      if (state.filePreviewUrl) URL.revokeObjectURL(state.filePreviewUrl)
      return {
        uploadStatus: "idle",
        statusMessage: "",
        uploadedFile: null,
        fileNameOverride: null,
        filePreviewUrl: null,
        extractedSections: [],
        extractionTimeMs: null,
        documentId: null,
        documentType: null,
        documentConfidence: null,
        isSavedDocument: false,
        savedFileName: null,
      }
    })
  },

  openDocumentFromDb: (doc) => {
    set({
      documentId: doc.documentId,
      documentType: doc.documentType,
      documentConfidence: doc.confidence,
      extractedSections: doc.sections,
      viewerOpen: true,
      isSavedDocument: true,
      savedFileName: doc.fileName,
    })
  },

  openViewer: () => set({ viewerOpen: true }),
  closeViewer: () => set({ viewerOpen: false }),
}))

export { useDocumentStore }
