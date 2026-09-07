"use server"

import {
  countDocumentsInFolders,
  deleteDocumentsInFolders,
  moveDocumentsOutOfFolders,
} from "@/lib/models/document"
import {
  createFolder,
  deleteFolders,
  getDescendantFolderIds,
  getFolder,
  listFolders,
  renameFolder,
} from "@/lib/models/folder"
import type { Folder } from "@/lib/types"

/**
 * Create a folder, optionally inside a parent folder.
 */
async function createFolderAction(
  name: string,
  parentId: string | null
): Promise<{ id?: string; success: boolean; error?: string }> {
  return createFolder(name, parentId)
}

/**
 * List all folders, newest-first within same names is sorted by name.
 */
async function listFoldersAction(): Promise<Folder[]> {
  return listFolders()
}

/**
 * Rename a folder.
 */
async function renameFolderAction(
  id: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  return renameFolder(id, name)
}

/**
 * Delete a folder and all of its nested subfolders. When `deleteContents` is
 * true the documents inside are permanently deleted; otherwise they are moved
 * back to the library root.
 */
async function deleteFolderAction(
  id: string,
  deleteContents: boolean
): Promise<{
  success: boolean
  deletedFolders?: number
  affectedDocuments?: number
  deleteContents?: boolean
  error?: string
}> {
  const folder = await getFolder(id)
  if (!folder) {
    return { success: false, error: "Folder not found" }
  }

  const descendantIds = await getDescendantFolderIds(id)
  const affectedDocuments = await countDocumentsInFolders(descendantIds)

  if (deleteContents) {
    await deleteDocumentsInFolders(descendantIds)
  } else {
    await moveDocumentsOutOfFolders(descendantIds)
  }

  await deleteFolders(descendantIds)

  console.log(
    "[DB] Folder deleted:",
    id,
    deleteContents ? "with contents" : "contents moved to root"
  )

  return {
    success: true,
    deletedFolders: descendantIds.length,
    affectedDocuments,
    deleteContents,
  }
}

export {
  createFolderAction,
  deleteFolderAction,
  listFoldersAction,
  renameFolderAction,
}
