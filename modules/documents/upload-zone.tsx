"use client"

import { ArrowRight, CheckCircle2, FileText, FileUp } from "lucide-react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDocumentStore } from "@/stores/document-store"

const mockExtractedSections = [
  {
    title: "Vendor Information",
    fields: [
      {
        key: "vendor_name",
        label: "Vendor Name",
        value: "Acme Corp",
        confidence: 98,
        isAiCompleted: true,
      },
      {
        key: "vendor_address",
        label: "Address",
        value: "123 Business St, San Francisco, CA 94105",
        confidence: 95,
        isAiCompleted: true,
      },
      {
        key: "vendor_email",
        label: "Email",
        value: "billing@acme.com",
        confidence: 99,
        isAiCompleted: true,
      },
    ],
  },
  {
    title: "Invoice Details",
    fields: [
      {
        key: "invoice_number",
        label: "Invoice Number",
        value: "INV-2024-0847",
        confidence: 100,
        isAiCompleted: false,
      },
      {
        key: "invoice_date",
        label: "Invoice Date",
        value: "2024-09-15",
        confidence: 97,
        isAiCompleted: true,
      },
      {
        key: "due_date",
        label: "Due Date",
        value: "2024-10-15",
        confidence: 92,
        isAiCompleted: true,
      },
      {
        key: "currency",
        label: "Currency",
        value: "USD",
        confidence: 100,
        isAiCompleted: false,
      },
    ],
  },
  {
    title: "Line Items",
    fields: [
      {
        key: "item_1_desc",
        label: "Item 1 — Description",
        value: "Web Development Services",
        confidence: 96,
        isAiCompleted: true,
      },
      {
        key: "item_1_qty",
        label: "Item 1 — Quantity",
        value: "1",
        confidence: 100,
        isAiCompleted: false,
      },
      {
        key: "item_1_price",
        label: "Item 1 — Unit Price",
        value: "$5,000.00",
        confidence: 99,
        isAiCompleted: true,
      },
      {
        key: "item_2_desc",
        label: "Item 2 — Description",
        value: "UI/UX Design",
        confidence: 94,
        isAiCompleted: true,
      },
      {
        key: "item_2_qty",
        label: "Item 2 — Quantity",
        value: "1",
        confidence: 100,
        isAiCompleted: false,
      },
      {
        key: "item_2_price",
        label: "Item 2 — Unit Price",
        value: "$2,500.00",
        confidence: 98,
        isAiCompleted: true,
      },
    ],
  },
  {
    title: "Totals",
    fields: [
      {
        key: "subtotal",
        label: "Subtotal",
        value: "$7,500.00",
        confidence: 100,
        isAiCompleted: false,
      },
      {
        key: "tax",
        label: "Tax",
        value: "$675.00",
        confidence: 88,
        isAiCompleted: true,
      },
      {
        key: "total",
        label: "Total",
        value: "$8,175.00",
        confidence: 91,
        isAiCompleted: true,
      },
    ],
  },
]

function UploadZone() {
  const {
    uploadStatus,
    setUploading,
    setDragging,
    completeUpload,
    openViewer,
  } = useDocumentStore()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return
      setUploading(file)

      setTimeout(() => {
        completeUpload(mockExtractedSections)
        openViewer()
      }, 2000)
    },
    [setUploading, completeUpload, openViewer]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setDragging(true),
    onDragLeave: () => setDragging(false),
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 sm:h-48",
        uploadStatus === "idle" &&
          "border-border bg-muted/10 p-8 hover:border-primary/40 hover:bg-muted/20 hover:scale-[1.02]",
        uploadStatus === "dragging" &&
          "border-primary bg-primary/5 p-8 scale-[1.02] shadow-lg shadow-primary/10",
        uploadStatus === "uploading" && "border-primary/50 bg-primary/5 p-8",
        uploadStatus === "done" && "border-green-500/50 bg-green-500/5 p-8"
      )}
    >
      <input {...getInputProps()} />

      {/* Icon */}
      <div
        className={cn(
          "mb-5 flex size-14 items-center justify-center rounded-2xl transition-all duration-300",
          uploadStatus === "idle" &&
            "bg-primary/10 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20",
          uploadStatus === "dragging" && "bg-primary/20 scale-110",
          uploadStatus === "uploading" && "bg-primary/20 animate-pulse",
          uploadStatus === "done" && "bg-green-500/20"
        )}
      >
        {uploadStatus === "done" ? (
          <CheckCircle2 className="size-7 text-green-500 animate-in zoom-in" />
        ) : uploadStatus === "uploading" ? (
          <div className="size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <FileUp
            className={cn(
              "size-7 text-primary transition-all duration-300",
              uploadStatus === "idle" &&
                "animate-[float_3s_ease-in-out_infinite] group-hover:animate-none group-hover:scale-110",
              uploadStatus === "dragging" && "scale-110 animate-bounce"
            )}
          />
        )}
      </div>

      {/* Idle */}
      {uploadStatus === "idle" && (
        <>
          <p className="mb-1 font-medium text-sm">
            Drop your first document here
          </p>
          <p className="mb-5 text-center text-muted-foreground text-xs">
            or click to browse · PDF, PNG, JPG up to 10MB
          </p>
          <Button size="lg" className="gap-2" tabIndex={-1}>
            <FileText className="size-4" />
            Choose File
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </>
      )}

      {/* Dragging */}
      {uploadStatus === "dragging" && (
        <>
          <p className="mb-1 font-medium text-primary text-sm">
            Release to upload
          </p>
          <p className="text-muted-foreground text-xs">
            Drop your file anywhere
          </p>
        </>
      )}

      {/* Uploading */}
      {uploadStatus === "uploading" && (
        <>
          <p className="mb-1 font-medium text-sm">Uploading...</p>
          <p className="text-muted-foreground text-xs">
            {useDocumentStore.getState().uploadedFile?.name}
          </p>
          <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary animate-[slide_2s_ease-in-out]" />
          </div>
        </>
      )}

      {/* Done */}
      {uploadStatus === "done" && (
        <>
          <p className="mb-1 font-medium text-green-600 text-sm dark:text-green-400">
            Upload complete!
          </p>
          <p className="text-muted-foreground text-xs">
            {useDocumentStore.getState().uploadedFile?.name}
          </p>
        </>
      )}
    </div>
  )
}

export { UploadZone }
