"use client"

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FileUp,
  MessageSquareText,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { mapStoredSections } from "@/hooks/use-documents"
import { useExtract } from "@/hooks/use-extract"
import { toUserMessage } from "@/lib/error-message"
import { cn } from "@/lib/utils"
import { computeFileHash } from "@/lib/utils/file-hash"
import { generateImageThumbnail } from "@/lib/utils/image-thumbnail"
import { useDocumentStore } from "@/stores/document-store"

const DEFAULT_ESTIMATE_MS = 5_000
const MIN_ESTIMATE_MS = 5_000
const MAX_ESTIMATE_MS = 45_000

async function getAverageExtractionTimeMs(): Promise<number | null> {
  try {
    const { getAverageExtractionTime } = await import("@/app/actions/documents")
    return await getAverageExtractionTime(50)
  } catch {
    return null
  }
}

function estimateExtractionDuration(avgMs: number | null): number {
  if (avgMs == null) return DEFAULT_ESTIMATE_MS
  // Use the average but clamp to a reasonable range so the UI never
  // looks broken when actual times are unusually fast or slow.
  return Math.max(MIN_ESTIMATE_MS, Math.min(MAX_ESTIMATE_MS, avgMs))
}

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
  const setFileNameOverride = useDocumentStore(
    (state) => state.setFileNameOverride
  )
  const { extract } = useExtract()
  const [elapsed, setElapsed] = useState(0)
  const [progressPct, setProgressPct] = useState(0)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingFileName, setPendingFileName] = useState("")
  const [comments, setComments] = useState("")
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Live ticking timer during extraction, with a progress estimate.
  useEffect(() => {
    if (uploadStatus === "uploading") {
      setElapsed(0)
      const start = Date.now()

      // Best-effort average extraction time for progress sizing.
      let estimatedDuration = DEFAULT_ESTIMATE_MS
      getAverageExtractionTimeMs().then((avgMs) => {
        estimatedDuration = estimateExtractionDuration(avgMs)
        setProgressPct(0)
      })

      timerRef.current = setInterval(() => {
        const elapsedMs = Date.now() - start
        setElapsed((elapsedMs / 1000).toFixed(1) as unknown as number)
        const pct = Math.min(100, (elapsedMs / estimatedDuration) * 100)
        setProgressPct(pct)
      }, 100)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [uploadStatus])

  const startExtraction = useCallback(
    async (file: File, userComments: string) => {
      setPendingFile(null)
      setComments("")
      setFileNameOverride(pendingFileName)
      setUploading(file)

      // Best-effort content hash — identical file bytes always match,
      // regardless of the filename.
      let fileHash: string | null = null
      try {
        fileHash = await computeFileHash(file)
      } catch {
        fileHash = null
      }

      // Skip extraction entirely when this exact file is already saved.
      if (fileHash) {
        setStatusMessage("Checking for duplicates...")
        try {
          const { findDuplicateDocument } = await import(
            "@/app/actions/documents"
          )
          const existing = await findDuplicateDocument(fileHash)
          if (existing) {
            resetUpload()
            useDocumentStore.getState().openDocumentFromDb({
              documentId: existing.id,
              fileName: existing.filename,
              documentType: existing.documentType,
              confidence: existing.confidence,
              sections: mapStoredSections(existing.sections),
              fileType: existing.fileType ?? undefined,
              filePath: existing.filePath ?? undefined,
            })
            toast.info("Already in your library", {
              description: `“${existing.filename}” was uploaded before — opening the saved copy.`,
            })
            return
          }
        } catch {
          // Duplicate check failed — proceed with extraction anyway.
        }
      }

      const startTime = Date.now()
      try {
        setStatusMessage("Extracting with AI...")
        // Generate the card thumbnail while extraction runs in parallel.
        const [result, thumbnailUrl] = await Promise.all([
          extract(file, userComments, fileHash),
          generateImageThumbnail(file).catch(() => null),
        ])

        // Real extraction time from the API (server-side measurement).
        const extractionTimeMs =
          result.extractionTimeMs ?? Date.now() - startTime

        completeUpload(result.sections, extractionTimeMs, {
          documentId: result.documentId ?? undefined,
          documentType: result.documentType ?? undefined,
          confidence: result.confidence ?? undefined,
          fileHash: result.fileHash ?? undefined,
          thumbnailUrl: thumbnailUrl ?? undefined,
          filePath: result.filePath ?? undefined,
          fileType: result.fileType ?? undefined,
        })
        toast.success("Extraction complete", {
          description: `${file.name} parsed successfully. Review the fields, then save the document to your library.`,
        })
        openViewer()
      } catch (err) {
        const message = err instanceof Error ? err.message : null
        toast.error("Couldn't extract this document", {
          description: toUserMessage(
            message,
            "We couldn't read this file. Try another file or check that it isn't corrupted."
          ),
        })
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
      setFileNameOverride,
      pendingFileName,
    ]
  )

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setPendingFile(file)
    setPendingFileName(file.name)
  }, [])

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
    <>
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

        {/* Uploading / Extracting */}
        {uploadStatus === "uploading" && (
          <>
            <p className="mb-1 font-medium text-sm">
              {statusMessage || "Extracting..."}
            </p>
            <p className="text-muted-foreground text-xs">
              {useDocumentStore.getState().uploadedFile?.name}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted sm:w-48">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    animationDuration: `${Math.max(2, progressPct / 100)}s`,
                    width: `${progressPct}%`,
                  }}
                />
              </div>
              <span className="font-mono text-muted-foreground text-xs tabular-nums">
                {elapsed}s
              </span>
            </div>
          </>
        )}

        {/* Done */}
        {uploadStatus === "done" && (
          <>
            <p className="mb-1 font-medium text-green-600 text-sm dark:text-green-400">
              Extracted in{" "}
              {(
                (useDocumentStore.getState().extractionTimeMs ?? 0) / 1000
              ).toFixed(1)}
              s
            </p>
            <p className="text-muted-foreground text-xs">
              {useDocumentStore.getState().uploadedFile?.name}
            </p>
          </>
        )}
      </div>

      <Dialog
        open={pendingFile !== null}
        onOpenChange={(open) => {
          if (!open && uploadStatus !== "uploading") {
            setPendingFile(null)
            setComments("")
            setPendingFileName("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareText className="size-4 text-primary" />
              Add extraction guidance
            </DialogTitle>
            <DialogDescription>
              Tell the AI about anything unclear, missing, or important in this
              document. It will use your notes when inferring values.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm" htmlFor="document-filename">
              Filename
            </label>
            <input
              id="document-filename"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={pendingFileName}
              onChange={(event) => setPendingFileName(event.target.value)}
              maxLength={255}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="font-medium text-sm"
              htmlFor="extraction-comments"
            >
              Comments{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <textarea
              id="extraction-comments"
              className="min-h-24 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              placeholder="Example: The invoice total includes tax; vendor ID is near the footer."
              maxLength={2000}
            />
            <p className="text-muted-foreground text-xs">
              {comments.length}/2000
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPendingFile(null)
                setComments("")
                setPendingFileName("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (pendingFile) startExtraction(pendingFile, comments)
              }}
              disabled={!pendingFile}
            >
              <FileUp className="size-4" />
              Extract document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { UploadZone }
