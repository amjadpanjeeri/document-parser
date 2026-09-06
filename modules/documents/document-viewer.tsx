"use client"

import { CheckCircle2, FileText, Loader2, Save } from "lucide-react"
import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ExtractedSection } from "@/lib/types"
import { useDocumentStore } from "@/stores/document-store"
import { DocumentPreview } from "./document-preview"
import { ExtractedFields } from "./extracted-fields"

type DocumentViewerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName?: string
  fileType?: string
  sections?: ExtractedSection[]
}

function DocumentViewer({
  open,
  onOpenChange,
  fileName: fileNameProp,
  sections: sectionsProp,
}: DocumentViewerProps) {
  const {
    uploadedFile,
    filePreviewUrl,
    extractedSections,
    documentId,
    documentType,
    documentConfidence,
    closeViewer,
  } = useDocumentStore()

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  )

  const fileName = fileNameProp ?? uploadedFile?.name ?? "document.pdf"
  const fileType = uploadedFile?.type ?? "application/pdf"
  const sections =
    sectionsProp && sectionsProp.length > 0 ? sectionsProp : extractedSections

  const handleSave = useCallback(async () => {
    setSaveStatus("saving")
    try {
      const mappedData = {
        sections: sections.map((s) => ({
          title: s.title,
          fields: s.fields.map((f) => ({
            key: f.key,
            label: f.label,
            value: f.value,
            confidence: f.confidence / 100,
          })),
        })),
        fields: Object.fromEntries(
          sections.flatMap((s) => s.fields.map((f) => [f.key, f.value]))
        ),
      }

      const actions = await import("@/app/actions/documents")

      let result: { success: boolean; error?: string }
      if (documentId) {
        // Update existing document
        result = await actions.updateExtractedDocument(documentId, {
          ...mappedData,
          confidence: documentConfidence || 0,
        })
      } else {
        // Save new document
        result = await actions.saveExtractedDocument({
          filename: fileName,
          documentType: documentType || "Other",
          confidence: documentConfidence || 0,
          ...mappedData,
        })
      }

      if (result.success) {
        setSaveStatus("saved")
      } else {
        console.error("Save failed:", result.error)
        setSaveStatus("idle")
      }
    } catch (err) {
      console.error("Save error:", err)
      setSaveStatus("idle")
    }
  }, [fileName, documentId, documentType, documentConfidence, sections])

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) closeViewer()
      }}
    >
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="truncate">{fileName}</SheetTitle>
              <SheetDescription>Parsed document data</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden md:flex-row">
          <DocumentPreview
            fileName={fileName}
            fileType={fileType}
            filePreviewUrl={filePreviewUrl}
          />
          <ExtractedFields sections={sections} />
        </div>

        <SheetFooter className="border-t border-border px-4 py-3 sm:px-6 sm:py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="gap-2"
            onClick={handleSave}
            disabled={saveStatus !== "idle"}
          >
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving...
              </>
            ) : saveStatus === "saved" ? (
              <>
                <CheckCircle2 className="size-3.5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                Save Document
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export { DocumentViewer }
