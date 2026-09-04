"use client"

import { ArrowRight, CheckCircle2, FileText, FileUp } from "lucide-react"
import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type UploadState = "idle" | "dragging" | "uploading" | "done"

type UploadZoneProps = {
  onUploadComplete?: (fileName: string, fileType: string) => void
}

function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [fileName, setFileName] = useState("")

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState("dragging")
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState("idle")
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) {
        setFileName(file.name)
        setUploadState("uploading")
        setTimeout(() => {
          setUploadState("done")
          onUploadComplete?.(file.name, file.type)
        }, 2000)
        setTimeout(() => {
          setUploadState("idle")
          setFileName("")
        }, 4000)
      }
    },
    [onUploadComplete]
  )

  const handleClick = useCallback(() => {
    if (uploadState !== "idle") return
    setFileName("invoice-sample.pdf")
    setUploadState("uploading")
    setTimeout(() => {
      setUploadState("done")
      onUploadComplete?.("invoice-sample.pdf", "application/pdf")
    }, 2000)
    setTimeout(() => {
      setUploadState("idle")
      setFileName("")
    }, 4000)
  }, [uploadState, onUploadComplete])

  return (
    <button
      type="button"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 sm:h-48",
        uploadState === "idle" &&
          "border-border bg-muted/10 p-8 hover:border-primary/40 hover:bg-muted/20 hover:scale-[1.02]",
        uploadState === "dragging" &&
          "border-primary bg-primary/5 p-8 scale-[1.02] shadow-lg shadow-primary/10",
        uploadState === "uploading" && "border-primary/50 bg-primary/5 p-8",
        uploadState === "done" && "border-green-500/50 bg-green-500/5 p-8"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mb-5 flex size-14 items-center justify-center rounded-2xl transition-all duration-300",
          uploadState === "idle" &&
            "bg-primary/10 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20",
          uploadState === "dragging" && "bg-primary/20 scale-110",
          uploadState === "uploading" && "bg-primary/20 animate-pulse",
          uploadState === "done" && "bg-green-500/20"
        )}
      >
        {uploadState === "done" ? (
          <CheckCircle2 className="size-7 text-green-500 animate-in zoom-in" />
        ) : uploadState === "uploading" ? (
          <div className="size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <FileUp
            className={cn(
              "size-7 text-primary transition-all duration-300",
              uploadState === "idle" &&
                "animate-[float_3s_ease-in-out_infinite] group-hover:animate-none group-hover:scale-110",
              uploadState === "dragging" && "scale-110 animate-bounce"
            )}
          />
        )}
      </div>

      {/* Idle */}
      {uploadState === "idle" && (
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
      {uploadState === "dragging" && (
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
      {uploadState === "uploading" && (
        <>
          <p className="mb-1 font-medium text-sm">Uploading...</p>
          <p className="text-muted-foreground text-xs">{fileName}</p>
          <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary animate-[slide_2s_ease-in-out]" />
          </div>
        </>
      )}

      {/* Done */}
      {uploadState === "done" && (
        <>
          <p className="mb-1 font-medium text-green-600 text-sm dark:text-green-400">
            Upload complete!
          </p>
          <p className="text-muted-foreground text-xs">{fileName}</p>
        </>
      )}
    </button>
  )
}

export { UploadZone }
