"use client"

import { Download, FileText } from "lucide-react"

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
  const { uploadedFile, filePreviewUrl, extractedSections, closeViewer } =
    useDocumentStore()

  const fileName = fileNameProp ?? uploadedFile?.name ?? "document.pdf"
  const fileType = uploadedFile?.type ?? "application/pdf"
  const sections =
    sectionsProp && sectionsProp.length > 0 ? sectionsProp : extractedSections

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
        <SheetHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-5 text-primary" />
            </div>
            <div>
              <SheetTitle>{fileName}</SheetTitle>
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

        <SheetFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="gap-2">
            <Download className="size-3.5" />
            Save Document
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export { DocumentViewer }
