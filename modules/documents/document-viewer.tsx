"use client"

import {
  Bot,
  Braces,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  ListTree,
  Maximize2,
  Minimize2,
  Pencil,
  RefreshCw,
  RotateCw,
  Sparkles,
  Upload,
} from "lucide-react"
import { useCallback, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ExtractedField, ExtractedSection } from "@/lib/types"
import { cn } from "@/lib/utils"

type DocumentViewerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  fileType: string
  sections: ExtractedSection[]
}

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 95 ? "bg-green-500" : value >= 85 ? "bg-amber-500" : "bg-red-500"

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span
        className={cn(
          "text-[10px] font-medium tabular-nums",
          value >= 95
            ? "text-green-600 dark:text-green-400"
            : value >= 85
              ? "text-amber-600 dark:text-amber-400"
              : "text-red-600 dark:text-red-400"
        )}
      >
        {value}%
      </span>
    </div>
  )
}

type FieldRowProps = {
  field: ExtractedField
  isEditing: boolean
  editValue: string
  onEditChange: (value: string) => void
}

function FieldRow({
  field,
  isEditing,
  editValue,
  onEditChange,
}: FieldRowProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        field.isAiCompleted
          ? "border-primary/20 bg-primary/[0.03] hover:bg-primary/[0.06]"
          : "border-border bg-background hover:bg-muted/30"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-muted-foreground text-xs">{field.label}</span>
          {field.isAiCompleted && (
            <Badge
              variant="secondary"
              className="gap-1 border-primary/20 bg-primary/10 px-1.5 py-0 text-primary text-[9px] font-medium"
            >
              <Sparkles className="size-2.5" />
              AI
            </Badge>
          )}
        </div>
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            className="w-full rounded-md border border-primary/30 bg-background px-2 py-0.5 font-medium text-sm outline-none ring-primary/20 focus:ring-1"
          />
        ) : (
          <p className="font-medium text-sm leading-snug">{field.value}</p>
        )}
      </div>
      <div className="shrink-0 pt-0.5">
        <ConfidenceBar value={field.confidence} />
      </div>
    </div>
  )
}

function DocumentViewer({
  open,
  onOpenChange,
  fileName,
  fileType,
  sections,
}: DocumentViewerProps) {
  const [copied, setCopied] = useState(false)
  const [rightView, setRightView] = useState<"fields" | "json">("fields")
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})
  const [rawJson, setRawJson] = useState("")
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)

  const totalCount = sections.reduce((acc, s) => acc + s.fields.length, 0)
  const aiCount = sections.reduce(
    (acc, s) => acc + s.fields.filter((f) => f.isAiCompleted).length,
    0
  )
  const avgConfidence = Math.round(
    sections.reduce(
      (acc, s) =>
        acc + s.fields.reduce((a, f) => a + f.confidence, 0) / s.fields.length,
      0
    ) / sections.length
  )

  const jsonData = useCallback(() => {
    const json: Record<string, unknown> = {}
    for (const section of sections) {
      for (const field of section.fields) {
        json[field.key] = editedValues[field.key] ?? field.value
      }
    }
    return JSON.stringify(json, null, 2)
  }, [sections, editedValues])

  const displayedJson = rawJson || jsonData()

  const handleFieldEdit = useCallback((key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }))
    setRawJson("")
  }, [])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(displayedJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [displayedJson])

  const handleJsonEdit = useCallback((value: string) => {
    setRawJson(value)
  }, [])

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

  const isImage = fileType.startsWith("image/")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 overflow-hidden p-0"
      >
        {/* Header */}
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

        {/* Body */}
        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden md:flex-row">
          {/* Left: File Preview */}
          <div className="flex min-h-0 flex-col border-b border-border bg-muted/30 md:w-1/2 md:border-b-0 md:border-r md:flex-none">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
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
                {isImage ? (
                  <div className="flex size-full items-center justify-center rounded-lg border border-border bg-background">
                    <FileText className="size-16 text-muted-foreground/30" />
                  </div>
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

          {/* Right: Extracted Fields */}
          <div className="flex min-h-0 flex-1 flex-col md:w-1/2 md:flex-none">
            {/* Stats bar */}{" "}
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5 sm:gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                <Bot className="size-3.5 text-primary" />
                <span className="font-medium">{aiCount}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dashed border-muted-foreground/50 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                      AI
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    Fields automatically extracted by the AI model
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-medium">{totalCount}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dashed border-muted-foreground/50 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                      fields
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    Total data points identified in the document
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1.5 text-xs">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dashed border-muted-foreground/50 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                      Avg
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    Mean extraction confidence across all fields (higher = more
                    reliable)
                  </TooltipContent>
                </Tooltip>
                <span className="font-medium text-primary">
                  {avgConfidence}%
                </span>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="flex rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setRightView("fields")}
                    className={cn(
                      "flex items-center gap-1 rounded-l-lg px-2 py-1 text-xs transition-colors",
                      rightView === "fields"
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ListTree className="size-3" />
                    Fields
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightView("json")}
                    className={cn(
                      "flex items-center gap-1 rounded-r-lg border-l border-border px-2 py-1 text-xs transition-colors",
                      rightView === "json"
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Braces className="size-3" />
                    JSON
                  </button>
                </div>
                <Button
                  variant={isEditMode ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  title={isEditMode ? "Done editing" : "Edit fields"}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCopy}
                  title="Copy JSON"
                >
                  {copied ? (
                    <CheckCircle2 className="size-3.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {rightView === "fields" ? (
                <div className="flex flex-col gap-5">
                  {sections.map((section) => (
                    <div key={section.title}>
                      <h3 className="mb-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                        {section.title}
                      </h3>
                      <div className="flex flex-col gap-1.5">
                        {section.fields.map((field) => (
                          <FieldRow
                            key={field.key}
                            field={field}
                            isEditing={isEditMode}
                            editValue={editedValues[field.key] ?? field.value}
                            onEditChange={(v) => handleFieldEdit(field.key, v)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  value={displayedJson}
                  onChange={(e) => handleJsonEdit(e.target.value)}
                  readOnly={!isEditMode}
                  spellCheck={false}
                  className={cn(
                    "h-full w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-foreground outline-none",
                    isEditMode
                      ? "cursor-text"
                      : "cursor-default text-muted-foreground"
                  )}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
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
