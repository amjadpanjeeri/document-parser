"use client"

import { FolderOpen, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type DeleteFolderDialogProps = {
  open: boolean
  folderName: string
  /** Documents inside the folder and all of its subfolders. */
  affectedDocumentCount: number
  saving: boolean
  onClose: () => void
  onConfirm: (deleteContents: boolean) => void
}

type ContentsOption = "move" | "delete"

function DeleteFolderDialog({
  open,
  folderName,
  affectedDocumentCount,
  saving,
  onClose,
  onConfirm,
}: DeleteFolderDialogProps) {
  const [option, setOption] = useState<ContentsOption>("move")

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && !saving && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete “{folderName}”?</DialogTitle>
          <DialogDescription>
            This deletes the folder
            {affectedDocumentCount > 0
              ? " and everything inside it. What should happen to its documents?"
              : ". There are no documents inside it."}
          </DialogDescription>
        </DialogHeader>

        {affectedDocumentCount > 0 && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setOption("move")}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                option === "move"
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <FolderOpen
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  option === "move" ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span>
                <span className="block text-sm font-medium">
                  Move documents to the library
                </span>
                <span className="block text-muted-foreground text-xs">
                  {affectedDocumentCount} document
                  {affectedDocumentCount !== 1 ? "s" : ""} in this folder and
                  its subfolders will be moved back to “All documents”.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOption("delete")}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                option === "delete"
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <Trash2
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  option === "delete"
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              />
              <span>
                <span className="block text-sm font-medium">
                  Delete documents too
                </span>
                <span className="block text-muted-foreground text-xs">
                  Permanently delete the {affectedDocumentCount} document
                  {affectedDocumentCount !== 1 ? "s" : ""} inside this folder
                  and its subfolders.
                </span>
              </span>
            </button>
          </div>
        )}

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
            variant="destructive"
            onClick={() => onConfirm(option === "delete")}
            disabled={saving}
          >
            {saving ? "Deleting..." : "Delete folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DeleteFolderDialog }
