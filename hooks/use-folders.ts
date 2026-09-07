"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { toUserMessage } from "@/lib/error-message"
import type { Folder } from "@/lib/types"

type UseFoldersReturn = {
  folders: Folder[]
  foldersLoading: boolean
  loadFolders: () => Promise<void>
  createFolder: (name: string, parentId: string | null) => Promise<boolean>
  renameFolder: (id: string, name: string) => Promise<boolean>
  /** Delete a folder subtree — true when it was deleted. */
  deleteFolder: (id: string, deleteContents: boolean) => Promise<boolean>
}

/**
 * Owns the folder state for the library: the folder tree, plus the create /
 * rename / delete flows backed by the server actions.
 */
function useFolders(): UseFoldersReturn {
  const [folders, setFolders] = useState<Folder[]>([])
  const [foldersLoading, setFoldersLoading] = useState(false)

  const loadFolders = useCallback(async () => {
    setFoldersLoading(true)
    try {
      const { listFoldersAction } = await import("@/app/actions/folders")
      const result = await listFoldersAction()
      setFolders(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : null
      toast.error("Couldn't load your folders", {
        description: toUserMessage(
          message,
          "We couldn't fetch your folders from the database. Please try again."
        ),
      })
    } finally {
      setFoldersLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  const createFolder = useCallback(
    async (name: string, parentId: string | null): Promise<boolean> => {
      try {
        const { createFolderAction } = await import("@/app/actions/folders")
        const result = await createFolderAction(name, parentId)
        if (!result.success) {
          toast.error("Couldn't create the folder", {
            description: toUserMessage(
              result.error,
              "The folder wasn't created. Please try again."
            ),
          })
          return false
        }
        toast.success("Folder created")
        await loadFolders()
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : null
        toast.error("Couldn't create the folder", {
          description: toUserMessage(
            message,
            "Something went wrong while creating the folder. Please try again."
          ),
        })
        return false
      }
    },
    [loadFolders]
  )

  const renameFolder = useCallback(
    async (id: string, name: string): Promise<boolean> => {
      try {
        const { renameFolderAction } = await import("@/app/actions/folders")
        const result = await renameFolderAction(id, name)
        if (!result.success) {
          toast.error("Couldn't rename the folder", {
            description: toUserMessage(
              result.error,
              "The folder wasn't renamed. Please try again."
            ),
          })
          return false
        }
        toast.success("Folder renamed")
        await loadFolders()
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : null
        toast.error("Couldn't rename the folder", {
          description: toUserMessage(
            message,
            "Something went wrong while renaming the folder. Please try again."
          ),
        })
        return false
      }
    },
    [loadFolders]
  )

  const deleteFolder = useCallback(
    async (id: string, deleteContents: boolean): Promise<boolean> => {
      try {
        const { deleteFolderAction } = await import("@/app/actions/folders")
        const result = await deleteFolderAction(id, deleteContents)
        if (!result.success) {
          toast.error("Couldn't delete the folder", {
            description: toUserMessage(
              result.error,
              "The folder wasn't deleted. Please try again."
            ),
          })
          return false
        }

        const affected = result.affectedDocuments ?? 0
        toast.success("Folder deleted", {
          description:
            deleteContents && affected > 0
              ? `${affected} document${affected !== 1 ? "s" : ""} were deleted too.`
              : affected > 0
                ? `${affected} document${affected !== 1 ? "s" : ""} moved to your library.`
                : "The folder was removed from your library.",
        })
        await loadFolders()
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : null
        toast.error("Couldn't delete the folder", {
          description: toUserMessage(
            message,
            "Something went wrong while deleting the folder. Please try again."
          ),
        })
        return false
      }
    },
    [loadFolders]
  )

  return {
    folders,
    foldersLoading,
    loadFolders,
    createFolder,
    renameFolder,
    deleteFolder,
  }
}

export { useFolders }
