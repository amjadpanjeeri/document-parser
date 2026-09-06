"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type LibraryRenameDialogProps = {
  open: boolean
  value: string
  saving: boolean
  onValueChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
}

function LibraryRenameDialog({
  open,
  value,
  saving,
  onValueChange,
  onClose,
  onConfirm,
}: LibraryRenameDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && !saving && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit filename</DialogTitle>
          <DialogDescription>
            Update the name shown in your document library.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onConfirm()
          }}
          maxLength={255}
          autoFocus
          aria-label="Document filename"
        />
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
            onClick={onConfirm}
            disabled={saving || !value.trim()}
          >
            {saving ? "Saving..." : "Save name"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { LibraryRenameDialog }
