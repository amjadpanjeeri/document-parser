import type { Folder } from "@/lib/types"

/**
 * Return the folder id plus the ids of every nested descendant folder.
 */
function getDescendantFolderIds(folders: Folder[], rootId: string): string[] {
  const childrenByParent = new Map<string, string[]>()
  for (const folder of folders) {
    if (!folder.parentId) continue
    const siblings = childrenByParent.get(folder.parentId) ?? []
    siblings.push(folder.id)
    childrenByParent.set(folder.parentId, siblings)
  }

  const descendantIds = [rootId]
  const queue = [rootId]
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) continue
    for (const child of childrenByParent.get(current) ?? []) {
      descendantIds.push(child)
      queue.push(child)
    }
  }
  return descendantIds
}

/**
 * The chain of folders from the root down to (but not including) the target,
 * e.g. for breadcrumbs: [Invoices, 2026].
 */
function getFolderPath(folders: Folder[], folderId: string | null): Folder[] {
  if (!folderId) return []
  const folderById = new Map(folders.map((folder) => [folder.id, folder]))

  const path: Folder[] = []
  let current = folderById.get(folderId)
  while (current) {
    path.unshift(current)
    current = current.parentId ? folderById.get(current.parentId) : undefined
  }
  return path
}

/**
 * Depth of every folder (0 = at the library root), for indenting tree rows.
 */
function getFolderDepthMap(folders: Folder[]): Map<string, number> {
  const depths = new Map<string, number>()

  const visit = (folder: Folder, depth: number) => {
    if (depths.has(folder.id)) return
    depths.set(folder.id, depth)
    for (const child of folders.filter((f) => f.parentId === folder.id)) {
      visit(child, depth + 1)
    }
  }

  for (const folder of folders) {
    if (!folder.parentId) visit(folder, 0)
  }
  return depths
}

export { getDescendantFolderIds, getFolderDepthMap, getFolderPath }
