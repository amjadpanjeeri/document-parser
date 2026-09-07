"use client"

import { Check, Folder, Library } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Folder as FolderType } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getFolderDepthMap } from "../utils/folder-utils"

type MoveToFolderDialogProps = {
  open: boolean
  documentCount: number
  folders: FolderType[]
  saving: boolean
  onClose: () => void
  onConfirm: (folderId: string | null) => void
}

function MoveToFolderDialog({
  open,
  documentCount,
  folders,
  saving,
  onClose,
  onConfirm,
}: MoveToFolderDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const depths = getFolderDepthMap(folders)
  const sortedFolders = [...folders].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  useEffect(() => {
    if (open) setSelectedId(null)
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && !saving && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to folder</DialogTitle>
          <DialogDescription>
            Move {documentCount} document{documentCount !== 1 ? "s" : ""} to a
            folder.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
              selectedId === null
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Library className="size-4 shrink-0" />
            <span className="flex-1">Library root</span>
            {selectedId === null && <Check className="size-4 shrink-0" />}
          </button>

          {sortedFolders.map((folder) => {
            const depth = depths.get(folder.id) ?? 0
            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => setSelectedId(folder.id)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 text-left text-sm transition-colors",
                  selectedId === folder.id
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
                style={{ paddingLeft: `${12 + depth * 14}px` }}
              >
                <Folder className="size-4 shrink-0 text-primary/70" />
                <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {folder.name}
                </span>
                {selectedId === folder.id && (
                  <Check className="size-4 shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(selectedId)}
            disabled={saving}
          >
            {saving ? "Moving..." : "Move here"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { MoveToFolderDialog }
