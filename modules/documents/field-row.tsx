import { Bot, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { ExtractedField } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ConfidenceBar } from "./confidence-bar"

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
          {field.isAiFilled && (
            <Badge
              variant="secondary"
              className="gap-1 border-amber-500/20 bg-amber-500/10 px-1.5 py-0 text-amber-600 text-[9px] font-medium dark:text-amber-400"
            >
              <Bot className="size-2.5" />
              AI Filled
            </Badge>
          )}
          {field.isAiCompleted && !field.isAiFilled && (
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

export { FieldRow }
