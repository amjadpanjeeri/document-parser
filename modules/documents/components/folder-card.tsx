import { ChevronRight, Folder } from "lucide-react"

import type { Folder as FolderType } from "@/lib/types"
import { cn } from "@/lib/utils"

type FolderCardProps = {
  folder: FolderType
  itemCount: number
  viewMode: "grid" | "list"
  onClick: () => void
}

function FolderCard({ folder, itemCount, viewMode, onClick }: FolderCardProps) {
  const itemLabel = `${itemCount} item${itemCount !== 1 ? "s" : ""}`

  if (viewMode === "list") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50"
        aria-label={`Open folder ${folder.name}`}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Folder className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-sm">
            {folder.name}
          </p>
          <p className="mt-0.5 text-muted-foreground text-xs">{itemLabel}</p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-colors",
        "hover:border-primary/40 hover:bg-muted/30"
      )}
      aria-label={`Open folder ${folder.name}`}
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-muted/40 transition-colors group-hover:bg-primary/5">
        <Folder className="size-12 text-primary/70 transition-transform group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p
          className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-sm"
          title={folder.name}
        >
          {folder.name}
        </p>
        <p className="text-muted-foreground text-xs">{itemLabel}</p>
      </div>
      <ChevronRight className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

export { FolderCard }
