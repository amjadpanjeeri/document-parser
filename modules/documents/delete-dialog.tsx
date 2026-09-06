"use client"

import { Trash2 } from "lucide-react"
import { useCallback } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type DeleteDialogProps = {
  open: boolean
  /** Names of the documents about to be deleted (used for the message). */
  documentNames: string[]
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}

function DeleteDialog({
  open,
  documentNames,
  deleting,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
  const count = documentNames.length
  const isSingle = count === 1

  const message = useCallback(() => {
    if (isSingle) {
      return documentNames[0] || "This document"
    }
    const preview = documentNames.slice(0, 2).join(", ")
    const remaining = count - 2
    return remaining > 0 ? `${preview} and ${remaining} more` : preview
  }, [documentNames, count, isSingle])

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        if (!openState && !deleting) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10">
            <Trash2 className="size-5 text-destructive" />
          </div>
          <DialogTitle>
            {isSingle ? "Delete this document?" : `Delete ${count} documents?`}
          </DialogTitle>
          <DialogDescription>
            {isSingle ? (
              <>
                <span className="font-medium text-foreground">{message()}</span>{" "}
                will be permanently removed from your library. This can&apos;t
                be undone.
              </>
            ) : (
              <>
                {message()} will be permanently removed from your library. This
                can&apos;t be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={onConfirm}
            disabled={deleting}
          >
            <Trash2 className="size-4" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DeleteDialog }
