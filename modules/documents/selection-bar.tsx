"use client"

import { CheckCheck, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SelectionBarProps = {
  selectedCount: number
  totalCount: number
  onToggleSelectAll: () => void
  onClear: () => void
  onDelete: () => void
  className?: string
}

function SelectionBar({
  selectedCount,
  totalCount,
  onToggleSelectAll,
  onClear,
  onDelete,
  className,
}: SelectionBarProps) {
  const allSelected = selectedCount === totalCount

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2",
        className
      )}
    >
      <p className="mr-auto font-medium text-sm text-foreground">
        {selectedCount} selected
      </p>

      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={onToggleSelectAll}
      >
        <CheckCheck className="size-3.5" />
        {allSelected ? "Deselect all" : "Select all"}
      </Button>

      <Button variant="outline" size="sm" className="gap-1.5" onClick={onClear}>
        <X className="size-3.5" />
        Clear
      </Button>

      <Button
        variant="destructive"
        size="sm"
        className="gap-1.5"
        onClick={onDelete}
      >
        <Trash2 className="size-3.5" />
        Delete selected
      </Button>
    </div>
  )
}

export { SelectionBar }
