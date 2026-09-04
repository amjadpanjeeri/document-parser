"use client"

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  FileUp,
} from "lucide-react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

import { Button } from "@/components/ui/button"
import { useExtract } from "@/hooks/use-extract"
import { cn } from "@/lib/utils"
import { useDocumentStore } from "@/stores/document-store"

function UploadZone() {
  const {
    uploadStatus,
    statusMessage,
    setUploading,
    setStatusMessage,
    setDragging,
    resetUpload,
    completeUpload,
    openViewer,
  } = useDocumentStore()
  const { extract } = useExtract()
  const [extractError, setExtractError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return
      setExtractError(null)
      setUploading(file)

      try {
        setStatusMessage("Sending to server...")
        // Small delay so the user sees the phase change
        await new Promise((r) => setTimeout(r, 300))

        setStatusMessage("Extracting with AI...")
        const sections = await extract(file)

        setStatusMessage("Preparing results...")
        await new Promise((r) => setTimeout(r, 200))

        completeUpload(sections)
        openViewer()
      } catch (err) {
        console.error("[UploadZone] Extraction failed:", err)
        const message = err instanceof Error ? err.message : "Extraction failed"
        setExtractError(message)
        resetUpload()
      }
    },
    [
      setUploading,
      setStatusMessage,
      extract,
      completeUpload,
      openViewer,
      resetUpload,
    ]
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
          "border-border bg-muted/10 p-5 hover:border-primary/40 hover:bg-muted/20 hover:scale-[1.02] sm:p-8",
        uploadStatus === "dragging" &&
          "border-primary bg-primary/5 p-5 scale-[1.02] shadow-lg shadow-primary/10 sm:p-8",
        uploadStatus === "uploading" &&
          "border-primary/50 bg-primary/5 p-5 sm:p-8",
        uploadStatus === "done" &&
          "border-green-500/50 bg-green-500/5 p-5 sm:p-8"
      )}
    >
      <input {...getInputProps()} />

      {/* Icon */}
      <div
        className={cn(
          "mb-4 flex size-12 items-center justify-center rounded-2xl transition-all duration-300 sm:mb-5 sm:size-14",
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

      {/* Idle / Error */}
      {uploadStatus === "idle" &&
        (extractError ? (
          <div className="flex flex-col items-center gap-2">
            {" "}
            <AlertCircle className="size-5 text-destructive sm:size-6" />
            <p className="font-medium text-destructive text-sm">
              Extraction failed
            </p>
            <p className="max-w-xs text-center text-muted-foreground text-xs">
              {extractError}
            </p>
            <p className="text-muted-foreground text-xs">
              Drop another file to try again
            </p>
          </div>
        ) : (
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
        ))}

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

      {/* Uploading / Extracting */}
      {uploadStatus === "uploading" && (
        <>
          <p className="mb-1 font-medium text-sm">
            {statusMessage || "Uploading..."}
          </p>
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
