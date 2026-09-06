"use client"

import { FileText, Minus, Plus, RefreshCw, RotateCw } from "lucide-react"
import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"

type DocumentPreviewProps = {
  fileName: string
  fileType: string
  filePreviewUrl: string | null
}

function DocumentPreview({
  fileName,
  fileType,
  filePreviewUrl,
}: DocumentPreviewProps) {
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)

  const isImage = fileType.startsWith("image/")
  const isPdf = fileType === "application/pdf"

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

  return (
    <div className="flex min-h-[28rem] flex-none flex-col border-b border-border bg-muted/30 md:h-full md:min-h-0 md:w-1/2 md:flex-1 md:border-b-0 md:border-r md:flex-none">
      <div className="flex items-center justify-between border-b border-border px-3 py-2 sm:px-4 sm:py-2.5">
        <span className="hidden text-muted-foreground text-xs font-medium uppercase tracking-wider sm:inline">
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
            <Minus className="size-3.5" />
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
            <Plus className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleResetView}
            title="Reset view"
            className="hidden sm:flex"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-auto p-3 sm:p-6">
        <div
          className="flex w-full items-center justify-center transition-transform duration-200"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
          }}
        >
          {filePreviewUrl ? (
            isImage ? (
              // biome-ignore lint/performance/noImgElement: blob URLs can't use next/image
              <img
                src={filePreviewUrl}
                alt={fileName}
                className="max-h-full max-w-full rounded-lg border border-border object-contain"
              />
            ) : isPdf ? (
              <iframe
                src={filePreviewUrl}
                title={fileName}
                className="h-[60vh] min-h-[400px] w-full rounded-lg border border-border bg-background md:h-[calc(100vh-12rem)]"
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
                  <FileText className="size-10 text-primary/60" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{fileName}</p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Preview not available for {fileType.toUpperCase()}.
                    Re-upload the file to view it here.
                  </p>
                </div>
              </div>
            )
          ) : (
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
