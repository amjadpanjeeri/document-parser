"use client"

import { ChevronRight } from "lucide-react"

import type { Folder } from "@/lib/types"
import { cn } from "@/lib/utils"

type FolderBreadcrumbProps = {
  /** Ancestors from the library root down to the current folder's parent. */
  path: Folder[]
  currentFolderName: string
  onNavigate: (folderId: string | null) => void
}

function FolderBreadcrumb({
  path,
  currentFolderName,
  onNavigate,
}: FolderBreadcrumbProps) {
  return (
    <nav
      aria-label="Folder breadcrumb"
      className="flex min-w-0 items-center gap-1 text-sm"
    >
      <button
        type="button"
        onClick={() => onNavigate(null)}
        className="shrink-0 rounded-md px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        All documents
      </button>

      {path.map((folder) => (
        <span key={folder.id} className="flex min-w-0 items-center gap-1">
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
          <button
            type="button"
            onClick={() => onNavigate(folder.id)}
            className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-md px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {folder.name}
          </button>
        </span>
      ))}

      <span className="flex min-w-0 items-center gap-1">
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
        <span
          className={cn(
            "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium px-1.5 py-0.5"
          )}
        >
          {currentFolderName}
        </span>
      </span>
    </nav>
  )
}

export { FolderBreadcrumb }
