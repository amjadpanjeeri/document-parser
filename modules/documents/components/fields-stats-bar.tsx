"use client"

import { Bot, Braces, CheckCircle2, Copy, ListTree, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type FieldsStatsBarProps = {
  aiCount: number
  aiFilledCount: number
  totalCount: number
  avgConfidence: number
  rightView: "fields" | "json"
  onRightViewChange: (view: "fields" | "json") => void
  isEditMode: boolean
  onToggleEdit: () => void
  copied: boolean
  onCopy: () => void
}

function FieldsStatsBar({
  aiCount,
  aiFilledCount,
  totalCount,
  avgConfidence,
  rightView,
  onRightViewChange,
  isEditMode,
  onToggleEdit,
  copied,
  onCopy,
}: FieldsStatsBarProps) {
  return (
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
      {aiFilledCount > 0 && (
        <>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-xs">
            <Bot className="size-3.5 text-amber-500" />
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {aiFilledCount}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help border-b border-dashed border-muted-foreground/50 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                  AI Filled
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                Missing fields inferred by AI based on document context
              </TooltipContent>
            </Tooltip>
          </div>
        </>
      )}
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
        <span className="font-medium text-primary">{avgConfidence}%</span>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <div className="flex rounded-lg border border-border">
          <button
            type="button"
            onClick={() => onRightViewChange("fields")}
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
            onClick={() => onRightViewChange("json")}
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
          onClick={onToggleEdit}
          title={isEditMode ? "Done editing" : "Edit fields"}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onCopy}
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
  )
}

export { FieldsStatsBar }
