import { describe, expect, it } from "vitest"

import type { Folder } from "@/lib/types"
import {
  getDescendantFolderIds,
  getFolderDepthMap,
  getFolderPath,
} from "@/modules/documents/utils/folder-utils"

function folder(
  id: string,
  name: string,
  parentId: string | null = null
): Folder {
  return {
    id,
    name,
    parentId,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  }
}

describe("getDescendantFolderIds", () => {
  it("returns only the root id when no children exist", () => {
    const folders = [folder("root", "Root")]
    expect(getDescendantFolderIds(folders, "root")).toEqual(["root"])
  })

  it("returns root plus immediate children", () => {
    const folders = [
      folder("root", "Root"),
      folder("child1", "Child 1", "root"),
      folder("child2", "Child 2", "root"),
    ]
    expect(getDescendantFolderIds(folders, "root")).toEqual(
      expect.arrayContaining(["root", "child1", "child2"])
    )
    expect(getDescendantFolderIds(folders, "root")).toHaveLength(3)
  })

  it("returns all descendants at any depth", () => {
    const folders = [
      folder("root", "Root"),
      folder("a", "A", "root"),
      folder("b", "B", "root"),
      folder("a1", "A1", "a"),
      folder("a2", "A2", "a"),
      folder("a1x", "A1X", "a1"),
    ]
    const result = getDescendantFolderIds(folders, "root")
    expect(result).toHaveLength(6)
    expect(result).toContain("root")
    expect(result).toContain("a")
    expect(result).toContain("b")
    expect(result).toContain("a1")
    expect(result).toContain("a2")
    expect(result).toContain("a1x")
  })

  it("works for a subfolder as root", () => {
    const folders = [
      folder("root", "Root"),
      folder("a", "A", "root"),
      folder("a1", "A1", "a"),
      folder("a2", "A2", "a"),
    ]
    const result = getDescendantFolderIds(folders, "a")
    expect(result).toEqual(["a", "a1", "a2"])
  })

  it("handles empty folders array gracefully", () => {
    expect(getDescendantFolderIds([], "missing")).toEqual(["missing"])
  })

  it("does not include unrelated branches", () => {
    const folders = [
      folder("root", "Root"),
      folder("a", "A", "root"),
      folder("a1", "A1", "a"),
      folder("b", "B", "root"),
      folder("b1", "B1", "b"),
    ]
    const result = getDescendantFolderIds(folders, "a")
    expect(result).toEqual(["a", "a1"])
    expect(result).not.toContain("b")
    expect(result).not.toContain("b1")
  })
})

describe("getFolderPath", () => {
  it("returns empty array for null folderId", () => {
    expect(getFolderPath([], null)).toEqual([])
  })

  it("returns the folder itself for a root folder with no parent", () => {
    const folders = [folder("root", "Root")]
    // parentId is null, so the while loop finds the folder at the start
    // and the path includes only itself
    expect(getFolderPath(folders, "root")).toEqual([folder("root", "Root")])
  })

  it("returns the path from root to the target folder", () => {
    const folders = [
      folder("root", "Root"),
      folder("a", "A", "root"),
      folder("a1", "A1", "a"),
    ]
    const path = getFolderPath(folders, "a1")
    expect(path).toHaveLength(3)
    expect(path[0].name).toBe("Root")
    expect(path[1].name).toBe("A")
    expect(path[2].name).toBe("A1")
  })

  it("returns full path for deeply nested folder", () => {
    const folders = [
      folder("root", "Root"),
      folder("a", "A", "root"),
      folder("b", "B", "a"),
      folder("c", "C", "b"),
    ]
    const path = getFolderPath(folders, "c")
    expect(path.map((f) => f.name)).toEqual(["Root", "A", "B", "C"])
  })

  it("includes target folder even if parent is missing", () => {
    // When parentId points to a folder not in the list, the while loop
    // can't find the parent, so the path contains just the target.
    const folders = [folder("a", "A", "missingparent")]
    const path = getFolderPath(folders, "a")
    expect(path).toEqual([folder("a", "A", "missingparent")])
  })

  it("handles root folder with explicit null parentId", () => {
    const folders = [folder("root", "Root"), folder("a", "A", "root")]
    expect(getFolderPath(folders, "root")).toEqual([folder("root", "Root")])
    expect(getFolderPath(folders, "a")).toEqual([
      folder("root", "Root"),
      folder("a", "A", "root"),
    ])
  })
})

describe("getFolderDepthMap", () => {
  it("returns depth 0 for root folders", () => {
    const folders = [folder("root", "Root"), folder("other", "Other")]
    const depths = getFolderDepthMap(folders)
    expect(depths.get("root")).toBe(0)
    expect(depths.get("other")).toBe(0)
  })

  it("returns correct depths for nested folders", () => {
    const folders = [
      folder("root", "Root"),
      folder("a", "A", "root"),
      folder("b", "B", "root"),
      folder("a1", "A1", "a"),
      folder("a2", "A2", "a"),
      folder("a1x", "A1X", "a1"),
    ]
    const depths = getFolderDepthMap(folders)
    expect(depths.get("root")).toBe(0)
    expect(depths.get("a")).toBe(1)
    expect(depths.get("b")).toBe(1)
    expect(depths.get("a1")).toBe(2)
    expect(depths.get("a2")).toBe(2)
    expect(depths.get("a1x")).toBe(3)
  })

  it("skips folders whose parent is not in the list", () => {
    // getFolderDepthMap only visits folders reachable from a root
    // (parentId present in the list or null). "orphan" has parentId
    // "nonexistent" which is not in the list, so it is not visited.
    const folders = [folder("orphan", "Orphan", "nonexistent")]
    const depths = getFolderDepthMap(folders)
    expect(depths.has("orphan")).toBe(false)
  })

  it("returns empty map for empty folder list", () => {
    expect(getFolderDepthMap([])).toEqual(new Map())
  })

  it("handles multiple root-level trees", () => {
    const folders = [
      folder("r1", "R1"),
      folder("r1a", "R1A", "r1"),
      folder("r2", "R2"),
      folder("r2a", "R2A", "r2"),
      folder("r2a1", "R2A1", "r2a"),
    ]
    const depths = getFolderDepthMap(folders)
    expect(depths.get("r1")).toBe(0)
    expect(depths.get("r1a")).toBe(1)
    expect(depths.get("r2")).toBe(0)
    expect(depths.get("r2a")).toBe(1)
    expect(depths.get("r2a1")).toBe(2)
  })
})
