"use client"

import {
  FileText,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCw,
  Upload,
} from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useDocumentStore } from "@/stores/document-store"

function DocumentPreview() {
  const { uploadedFile, filePreviewUrl } = useDocumentStore()
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)

  const fileName = uploadedFile?.name ?? "document.pdf"
  const fileType = uploadedFile?.type ?? "application/pdf"
  const isImage = fileType.startsWith("image/")

  const handleRotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360)
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.25, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.25, 0.5))
  }, [])

  const handleResetView = useCallback(() => {
    setRotation(0)
    setZoom(1)
  }, [])

  const filePreview = useMemo(() => {
    if (!filePreviewUrl) return null
    if (isImage) {
      return (
        // biome-ignore lint/performance/noImgElement: blob URLs can't use next/image
        <img
          src={filePreviewUrl}
          alt={fileName}
          className="max-h-full max-w-full rounded-lg border border-border object-contain"
        />
      )
    }
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
          <FileText className="size-10 text-primary/60" />
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">{fileName}</p>
          <p className="mt-1 text-muted-foreground text-xs">
            {fileType.toUpperCase()} document
          </p>
        </div>
      </div>
    )
  }, [filePreviewUrl, isImage, fileName, fileType])

  return (
    <div className="flex min-h-0 flex-col border-b border-border bg-muted/30 md:w-1/2 md:border-b-0 md:border-r md:flex-none">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Document Preview
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRotate}
            title="Rotate"
          >
            <RotateCw className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            title="Zoom out"
          >
            <Minimize2 className="size-3.5" />
          </Button>
          <span className="min-w-[2.5rem] text-center text-muted-foreground text-xs tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            title="Zoom in"
          >
            <Maximize2 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleResetView}
            title="Reset view"
          >
            <RefreshCw className="size-3.5" />
          </Button>
          <div className="mx-0.5 h-3 w-px bg-border" />
          <Button variant="ghost" size="icon-sm" title="Re-upload">
            <Upload className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-auto p-6">
        <div
          className="flex items-center justify-center transition-transform duration-200"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
          }}
        >
          {filePreview ?? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="size-10 text-primary/60" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{fileName}</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {fileType.toUpperCase()} document
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { DocumentPreview }
