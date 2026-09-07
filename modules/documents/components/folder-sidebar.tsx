"use client"

import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  Library,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Folder as FolderType } from "@/lib/types"
import { cn } from "@/lib/utils"

type FolderSidebarProps = {
  folders: FolderType[]
  /** Direct document count per folder id. */
  folderCounts: Record<string, number>
  totalDocumentCount: number
  currentFolderId: string | null
  onNavigate: (folderId: string | null) => void
  onCreateFolder: () => void
  onRenameFolder: (folder: FolderType) => void
  onDeleteFolder: (folder: FolderType) => void
}

type FolderNodeProps = {
  folder: FolderType
  depth: number
  childrenByParent: Map<string, FolderType[]>
  folderCounts: Record<string, number>
  currentFolderId: string | null
  onNavigate: (folderId: string | null) => void
  onRenameFolder: (folder: FolderType) => void
  onDeleteFolder: (folder: FolderType) => void
}

function FolderNode({
  folder,
  depth,
  childrenByParent,
  folderCounts,
  currentFolderId,
  onNavigate,
  onRenameFolder,
  onDeleteFolder,
}: FolderNodeProps) {
  const children = childrenByParent.get(folder.id) ?? []
  const [expanded, setExpanded] = useState(true)
  const active = currentFolderId === folder.id

  return (
    <div>
      <div
        className={cn(
          "group flex w-full items-center rounded-lg pr-1 transition-colors",
          active ? "bg-muted" : "hover:bg-muted/50"
        )}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground",
            children.length === 0 && "invisible"
          )}
          aria-label={
            expanded ? `Collapse ${folder.name}` : `Expand ${folder.name}`
          }
        >
          {expanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onNavigate(folder.id)}
          className={cn(
            "flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg py-1.5 text-left focus-visible:outline-none",
            active ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <Folder className="size-4 shrink-0 text-primary/70" />
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
            {folder.name}
          </span>
          {(folderCounts[folder.id] ?? 0) > 0 && (
            <span className="shrink-0 rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground tabular-nums">
              {folderCounts[folder.id]}
            </span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              aria-label={`More actions for ${folder.name}`}
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => onRenameFolder(folder)}>
              <Pencil />
              Edit name
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDeleteFolder(folder)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded &&
        children.map((child) => (
          <FolderNode
            key={child.id}
            folder={child}
            depth={depth + 1}
            childrenByParent={childrenByParent}
            folderCounts={folderCounts}
            currentFolderId={currentFolderId}
            onNavigate={onNavigate}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
          />
        ))}
    </div>
  )
}

function FolderSidebar({
  folders,
  folderCounts,
  totalDocumentCount,
  currentFolderId,
  onNavigate,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderSidebarProps) {
  const childrenByParent = new Map<string, FolderType[]>()
  for (const folder of folders) {
    if (!folder.parentId) continue
    const siblings = childrenByParent.get(folder.parentId) ?? []
    siblings.push(folder)
    childrenByParent.set(folder.parentId, siblings)
  }

  const rootFolders = folders.filter((folder) => folder.parentId === null)

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 lg:w-60">
      <div className="px-1 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Library
      </div>

      <button
        type="button"
        onClick={() => onNavigate(null)}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
          currentFolderId === null
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/50"
        )}
      >
        <Library className="size-4 shrink-0" />
        <span className="flex-1">All documents</span>
        {totalDocumentCount > 0 && (
          <span className="rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground tabular-nums">
            {totalDocumentCount}
          </span>
        )}
      </button>

      <div className="flex flex-col">
        {rootFolders.map((folder) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            depth={0}
            childrenByParent={childrenByParent}
            folderCounts={folderCounts}
            currentFolderId={currentFolderId}
            onNavigate={onNavigate}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 justify-start gap-2"
        onClick={onCreateFolder}
      >
        <FolderPlus className="size-4" />
        New folder
      </Button>
    </aside>
  )
}

export { FolderSidebar }
