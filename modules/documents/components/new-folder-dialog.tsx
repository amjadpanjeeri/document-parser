"use client"

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
import { Input } from "@/components/ui/input"

type NewFolderDialogProps = {
  open: boolean
  /** Where the folder will be created, e.g. "Inside Invoices". */
  locationLabel?: string
  saving: boolean
  onClose: () => void
  onConfirm: (name: string) => void
}

function NewFolderDialog({
  open,
  locationLabel,
  saving,
  onClose,
  onConfirm,
}: NewFolderDialogProps) {
  const [name, setName] = useState("")

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) {
          setName("")
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
          <DialogDescription>
            {locationLabel ??
              "Create a folder in your library to organize your documents."}
          </DialogDescription>
        </DialogHeader>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onConfirm(name)
          }}
          maxLength={100}
          autoFocus
          placeholder="Folder name"
          aria-label="Folder name"
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setName("")
              onClose()
            }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(name)}
            disabled={saving || !name.trim()}
          >
            {saving ? "Creating..." : "Create folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { NewFolderDialog }
