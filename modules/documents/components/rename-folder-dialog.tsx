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

type RenameFolderDialogProps = {
  open: boolean
  value: string
  saving: boolean
  onValueChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
}

function RenameFolderDialog({
  open,
  value,
  saving,
  onValueChange,
  onClose,
  onConfirm,
}: RenameFolderDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && !saving && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit folder name</DialogTitle>
          <DialogDescription>
            Update the name shown in your library.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onConfirm()
          }}
          maxLength={100}
          autoFocus
          aria-label="Folder name"
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

export { RenameFolderDialog }
