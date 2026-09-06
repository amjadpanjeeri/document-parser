"use client"

import {
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Pencil,
  Save,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { toUserMessage } from "@/lib/error-message"
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
  /** Name shown when opened from the documents listing */
  savedFileName?: string
}

function DocumentViewer({
  open,
  onOpenChange,
  fileName: fileNameProp,
  sections: sectionsProp,
}: DocumentViewerProps) {
  const {
    uploadedFile,
    fileNameOverride,
    filePreviewUrl,
    extractedSections,
    documentId,
    documentType,
    savedFileName,
    closeViewer,
    setSavedFileName,
  } = useDocumentStore()

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  )
  const [editableFileName, setEditableFileName] = useState("")
  const [renameStatus, setRenameStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  )
  const [isEditingFileName, setIsEditingFileName] = useState(false)

  const fileName =
    fileNameProp ??
    savedFileName ??
    fileNameOverride ??
    uploadedFile?.name ??
    "document.pdf"
  const fileType = uploadedFile?.type ?? "application/pdf"
  const sections =
    sectionsProp && sectionsProp.length > 0 ? sectionsProp : extractedSections

  useEffect(() => {
    setEditableFileName(fileName)
    setRenameStatus("idle")
    setIsEditingFileName(false)
  }, [fileName])

  const renameSavedDocument = useCallback(async () => {
    const nextFileName = editableFileName.trim()
    const state = useDocumentStore.getState()
    if (!nextFileName || nextFileName === fileName || !state.documentId) return

    setRenameStatus("saving")
    try {
      const response = await fetch(`/api/documents/${state.documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: nextFileName }),
      })
      const result = (await response.json()) as {
        success?: boolean
        error?: string
      }
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Rename failed")
      }
      setEditableFileName(nextFileName)
      setSavedFileName(nextFileName)
      setRenameStatus("saved")
      setIsEditingFileName(false)
      toast.success("Filename updated")
      setTimeout(() => setRenameStatus("idle"), 1200)
    } catch (error) {
      setRenameStatus("idle")
      toast.error("Couldn't rename the document", {
        description: toUserMessage(
          error instanceof Error ? error.message : null,
          "The filename wasn't updated. Please try again."
        ),
      })
    }
  }, [editableFileName, fileName, setSavedFileName])

  const handleSave = useCallback(async () => {
    setSaveStatus("saving")
    try {
      // Read directly from store to get the latest edited values
      const currentSections = useDocumentStore.getState().extractedSections

      const mappedData = {
        sections: currentSections.map((s) => ({
          title: s.title,
          fields: s.fields.map((f) => ({
            key: f.key,
            label: f.label,
            value: f.value,
            confidence: f.confidence / 100,
          })),
        })),
        fields: Object.fromEntries(
          currentSections.flatMap((s) => s.fields.map((f) => [f.key, f.value]))
        ),
      }

      const state = useDocumentStore.getState()
      const actions = await import("@/app/actions/documents")
      const nextFileName = editableFileName.trim() || fileName

      let result: { success: boolean; error?: string }
      if (state.documentId) {
        if (nextFileName !== fileName) {
          const renameResponse = await fetch(
            `/api/documents/${state.documentId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filename: nextFileName }),
            }
          )
          const renameResult = (await renameResponse.json()) as {
            success?: boolean
            error?: string
          }
          if (!renameResponse.ok || !renameResult.success) {
            throw new Error(renameResult.error || "Filename update failed")
          }
          setSavedFileName(nextFileName)
        }

        // Update existing document
        result = await actions.updateExtractedDocument(state.documentId, {
          ...mappedData,
          confidence: state.documentConfidence || 0,
        })
      } else {
        // Save new document
        result = await actions.saveExtractedDocument({
          filename: nextFileName,
          documentType: state.documentType || "Other",
          confidence: state.documentConfidence || 0,
          ...mappedData,
        })
      }

      if (result.success) {
        setSaveStatus("saved")
        const isUpdate = Boolean(state.documentId)
        toast.success(isUpdate ? "Document updated" : "Document saved", {
          description: isUpdate
            ? "Your edits have been saved to the document."
            : `${nextFileName} has been added to your library.`,
        })
        setTimeout(() => {
          closeViewer()
          setSaveStatus("idle")
        }, 800)
      } else {
        toast.error("Couldn't save the document", {
          description: toUserMessage(
            result.error,
            "Your changes weren't saved. Please try again."
          ),
        })
        setSaveStatus("idle")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : null
      toast.error("Couldn't save the document", {
        description: toUserMessage(
          message,
          "Something went wrong while saving. Please try again."
        ),
      })
      setSaveStatus("idle")
    }
  }, [editableFileName, closeViewer, fileName, setSavedFileName])

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
            <div className="min-w-0 flex-1">
              <SheetTitle className="sr-only">Document filename</SheetTitle>
              <div className="flex items-center gap-2">
                {isEditingFileName ? (
                  <Input
                    value={editableFileName}
                    onChange={(event) =>
                      setEditableFileName(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        if (documentId) renameSavedDocument()
                        else setIsEditingFileName(false)
                      }
                    }}
                    aria-label="Document filename"
                    className="h-8 w-64 max-w-[60vw] font-heading text-base"
                    autoFocus
                  />
                ) : (
                  <span
                    className="block max-w-[min(60vw,16rem)] truncate font-heading text-base"
                    title={editableFileName}
                  >
                    {editableFileName}
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    if (!isEditingFileName) {
                      setIsEditingFileName(true)
                    } else if (documentId) {
                      renameSavedDocument()
                    } else {
                      setIsEditingFileName(false)
                    }
                  }}
                  disabled={
                    renameStatus === "saving" ||
                    (isEditingFileName && !editableFileName.trim())
                  }
                  aria-label={
                    isEditingFileName ? "Save filename" : "Edit filename"
                  }
                  title={isEditingFileName ? "Save filename" : "Edit filename"}
                >
                  {renameStatus === "saving" ? (
                    <Loader2 className="animate-spin" />
                  ) : renameStatus === "saved" ? (
                    <Check />
                  ) : isEditingFileName ? (
                    <Check />
                  ) : (
                    <Pencil />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <SheetDescription>Parsed document data</SheetDescription>
                {documentType && (
                  <Badge variant="secondary" className="max-w-40 truncate">
                    {documentType}
                  </Badge>
                )}
              </div>
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
