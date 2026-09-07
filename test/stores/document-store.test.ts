import { act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useDocumentStore } from "@/stores/document-store"

// jsdom doesn't implement URL.createObjectURL, so stub it for store tests.
const mockUrls = new Map<string, File>()

beforeEach(() => {
  vi.stubGlobal("URL", {
    createObjectURL: (file: File) => {
      const id = Math.random().toString(36).slice(2)
      mockUrls.set(id, file)
      return `blob:test-${id}`
    },
    revokeObjectURL: (url: string) => {
      const id = url.replace("blob:test-", "")
      mockUrls.delete(id)
    },
  } as never)
})

afterEach(() => {
  mockUrls.clear()
  vi.unstubAllGlobals()
})

type ExtractedSection = {
  title: string
  fields: Array<{
    key: string
    label: string
    value: string
    confidence: number
    isAiCompleted: boolean
    isAiFilled: boolean
  }>
}

function section(
  title: string,
  fields: ExtractedSection["fields"] = []
): ExtractedSection {
  return { title, fields }
}

function field(
  key: string,
  label: string,
  value = "-",
  confidence = 100,
  isAiCompleted = false,
  isAiFilled = false
): ExtractedSection["fields"][0] {
  return { key, label, value, confidence, isAiCompleted, isAiFilled }
}

function s() {
  return useDocumentStore.getState()
}

describe("DocumentStore", () => {
  beforeEach(() => {
    act(() => {
      s().resetUpload()
      s().closeViewer()
    })
  })

  describe("initial state", () => {
    it("starts idle with empty sections", () => {
      const state = s()
      expect(state.uploadStatus).toBe("idle")
      expect(state.statusMessage).toBe("")
      expect(state.uploadedFile).toBeNull()
      expect(state.fileNameOverride).toBeNull()
      expect(state.filePreviewUrl).toBeNull()
      expect(state.viewerOpen).toBe(false)
      expect(state.extractedSections).toEqual([])
      expect(state.extractionTimeMs).toBeNull()
      expect(state.documentId).toBeNull()
      expect(state.documentType).toBeNull()
      expect(state.documentConfidence).toBeNull()
      expect(state.fileHash).toBeNull()
      expect(state.thumbnailUrl).toBeNull()
      expect(state.filePath).toBeNull()
      expect(state.fileType).toBeNull()
      expect(state.isSavedDocument).toBe(false)
      expect(state.savedFileName).toBeNull()
    })
  })

  describe("setUploading", () => {
    it("sets uploading status and stores the file", () => {
      const file = new File(["x"], "invoice.pdf", { type: "application/pdf" })
      act(() => s().setUploading(file))

      const state = s()
      expect(state.uploadStatus).toBe("uploading")
      expect(state.statusMessage).toBe("Uploading file...")
      expect(state.uploadedFile).toBe(file)
      expect(state.fileType).toBe("application/pdf")
      expect(state.extractionTimeMs).toBeNull()
    })

    it("creates a preview URL for the file", () => {
      const file = new File(["x"], "img.png", { type: "image/png" })
      act(() => s().setUploading(file))

      expect(s().filePreviewUrl).toMatch(/^blob:/)
    })
  })

  describe("setDragging", () => {
    it("sets status to dragging when true", () => {
      act(() => s().setDragging(true))
      expect(s().uploadStatus).toBe("dragging")
    })

    it("reverts to idle when false", () => {
      act(() => {
        s().setDragging(true)
        s().setDragging(false)
      })
      expect(s().uploadStatus).toBe("idle")
    })
  })

  describe("setFileNameOverride", () => {
    it("stores the trimmed filename", () => {
      act(() => s().setFileNameOverride("  mydoc.pdf  "))
      expect(s().fileNameOverride).toBe("mydoc.pdf")
    })

    it("stores null for whitespace-only input", () => {
      act(() => s().setFileNameOverride("   "))
      expect(s().fileNameOverride).toBeNull()
    })
  })

  describe("setStatusMessage", () => {
    it("updates the status message", () => {
      act(() => s().setStatusMessage("Checking for duplicates..."))
      expect(s().statusMessage).toBe("Checking for duplicates...")
    })
  })

  describe("completeUpload", () => {
    it("sets done status with all metadata", () => {
      act(() =>
        s().completeUpload(
          [section("Invoice", [field("total", "Total", "$100")])],
          3200,
          {
            documentId: "abc123",
            documentType: "Invoice",
            confidence: 0.95,
            fileHash: "deadbeef",
            thumbnailUrl: "data:image/png;base64,x",
            filePath: "documents/xyz.pdf",
            fileType: "application/pdf",
          }
        )
      )

      const state = s()
      expect(state.uploadStatus).toBe("done")
      expect(state.extractedSections).toEqual([
        section("Invoice", [field("total", "Total", "$100")]),
      ])
      expect(state.extractionTimeMs).toBe(3200)
      expect(state.documentId).toBe("abc123")
      expect(state.documentType).toBe("Invoice")
      expect(state.documentConfidence).toBe(0.95)
      expect(state.fileHash).toBe("deadbeef")
      expect(state.thumbnailUrl).toBe("data:image/png;base64,x")
      expect(state.filePath).toBe("documents/xyz.pdf")
      expect(state.fileType).toBe("application/pdf")
    })

    it("uses null for missing optional metadata", () => {
      act(() => s().completeUpload([section("Invoice")], 1500))

      const state = s()
      expect(state.documentId).toBeNull()
      expect(state.documentType).toBeNull()
      expect(state.documentConfidence).toBeNull()
      expect(state.fileHash).toBeNull()
      expect(state.thumbnailUrl).toBeNull()
      expect(state.filePath).toBeNull()
      expect(state.fileType).toBeNull()
      expect(state.extractionTimeMs).toBe(1500)
    })

    it("uses null extraction time when omitted", () => {
      act(() => s().completeUpload([section("Invoice")]))
      expect(s().extractionTimeMs).toBeNull()
    })
  })

  describe("updateExtractedSections", () => {
    it("replaces the sections array", () => {
      act(() => {
        s().completeUpload([section("Old")], 100, { documentId: "x" })
        s().updateExtractedSections([section("New", [field("a", "A")])])
      })

      expect(s().extractedSections).toEqual([section("New", [field("a", "A")])])
    })
  })

  describe("updateFieldValue", () => {
    it("updates the matching field across all sections", () => {
      act(() => {
        s().completeUpload(
          [
            section("Inv", [
              field("total", "Total", "$50"),
              field("tax", "Tax", "$5"),
            ]),
            section("Other", [field("total", "Total", "$50")]),
          ],
          100
        )
        s().updateFieldValue("total", "$200")
      })

      const totals = s().extractedSections.flatMap((sec) =>
        sec.fields.filter((f) => f.key === "total")
      )
      expect(totals).toHaveLength(2)
      expect(totals.every((f) => f.value === "$200")).toBe(true)
    })

    it("does not change non-matching fields", () => {
      act(() => {
        s().completeUpload(
          [
            section("Inv", [
              field("total", "Total", "$50"),
              field("tax", "Tax", "$5"),
            ]),
          ],
          100
        )
        s().updateFieldValue("total", "$200")
      })

      const tax = s().extractedSections[0].fields.find((f) => f.key === "tax")
      expect(tax?.value).toBe("$5")
    })
  })

  describe("setSavedFileName", () => {
    it("stores the filename", () => {
      act(() => s().setSavedFileName("saved.pdf"))
      expect(s().savedFileName).toBe("saved.pdf")
    })
  })

  describe("openDocumentFromDb", () => {
    it("opens viewer and sets saved-document flags", () => {
      act(() =>
        s().openDocumentFromDb({
          documentId: "doc1",
          fileName: "invoice.pdf",
          documentType: "Invoice",
          confidence: 0.92,
          sections: [section("Details", [field("total", "Total", "$100")])],
          fileType: "application/pdf",
          filePath: "documents/abc.pdf",
        })
      )

      const state = s()
      expect(state.viewerOpen).toBe(true)
      expect(state.isSavedDocument).toBe(true)
      expect(state.documentId).toBe("doc1")
      expect(state.documentType).toBe("Invoice")
      expect(state.documentConfidence).toBe(0.92)
      expect(state.savedFileName).toBe("invoice.pdf")
      expect(state.fileType).toBe("application/pdf")
      expect(state.filePath).toBe("documents/abc.pdf")
      expect(state.extractedSections).toEqual([
        section("Details", [field("total", "Total", "$100")]),
      ])
    })

    it("defaults optional file metadata to null", () => {
      act(() =>
        s().openDocumentFromDb({
          documentId: "doc1",
          fileName: "doc.pdf",
          documentType: "Other",
          confidence: 0.8,
          sections: [],
        })
      )

      expect(s().fileType).toBeNull()
      expect(s().filePath).toBeNull()
    })

    it("does not set upload metadata", () => {
      act(() =>
        s().openDocumentFromDb({
          documentId: "doc1",
          fileName: "doc.pdf",
          documentType: "Other",
          confidence: 0.8,
          sections: [],
        })
      )

      expect(s().uploadStatus).toBe("idle")
      expect(s().uploadedFile).toBeNull()
      expect(s().fileHash).toBeNull()
      expect(s().extractionTimeMs).toBeNull()
    })
  })

  describe("openViewer / closeViewer", () => {
    it("toggles viewerOpen", () => {
      act(() => s().openViewer())
      expect(s().viewerOpen).toBe(true)

      act(() => s().closeViewer())
      expect(s().viewerOpen).toBe(false)
    })

    it("preserves all other state", () => {
      act(() => {
        s().completeUpload(
          [section("Inv", [field("total", "Total", "$100")])],
          2000,
          { documentId: "x", fileHash: "h" }
        )
        s().openViewer()
      })

      expect(s().viewerOpen).toBe(true)
      expect(s().extractedSections).toEqual([
        section("Inv", [field("total", "Total", "$100")]),
      ])
      expect(s().documentId).toBe("x")
    })
  })

  describe("resetUpload", () => {
    it("resets everything to initial state except viewerOpen", () => {
      const file = new File(["x"], "f.pdf", { type: "application/pdf" })
      act(() => {
        s().setUploading(file)
        s().completeUpload(
          [section("Inv", [field("total", "Total", "$100")])],
          5000,
          {
            documentId: "abc",
            documentType: "Invoice",
            confidence: 0.9,
            fileHash: "hash",
            thumbnailUrl: "data:...",
            filePath: "path",
            fileType: "application/pdf",
          }
        )
        s().setSavedFileName("saved.pdf")
        s().openViewer()
        s().resetUpload()
      })

      const state = s()
      expect(state.uploadStatus).toBe("idle")
      expect(state.statusMessage).toBe("")
      expect(state.uploadedFile).toBeNull()
      expect(state.fileNameOverride).toBeNull()
      expect(state.filePreviewUrl).toBeNull()
      expect(state.extractedSections).toEqual([])
      expect(state.extractionTimeMs).toBeNull()
      expect(state.documentId).toBeNull()
      expect(state.documentType).toBeNull()
      expect(state.documentConfidence).toBeNull()
      expect(state.fileHash).toBeNull()
      expect(state.thumbnailUrl).toBeNull()
      expect(state.filePath).toBeNull()
      expect(state.fileType).toBeNull()
      expect(state.isSavedDocument).toBe(false)
      expect(state.savedFileName).toBeNull()
      // resetUpload does not close the viewer — that's closeViewer's job.
      expect(state.viewerOpen).toBe(true)
    })

    it("revokes the preview URL", () => {
      const file = new File(["x"], "f.png", { type: "image/png" })
      act(() => s().setUploading(file))
      expect(s().filePreviewUrl).toMatch(/^blob:/)

      act(() => s().resetUpload())
      expect(s().filePreviewUrl).toBeNull()
    })
  })
})
