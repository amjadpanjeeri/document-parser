import { describe, expect, it } from "vitest"

import { computeFileHash } from "@/lib/utils/file-hash"

function makeFile(
  content: string,
  name = "test.txt",
  type = "text/plain"
): File {
  return new File([new TextEncoder().encode(content)], name, { type })
}

describe("computeFileHash", () => {
  it("produces the same hash for identical content", async () => {
    const fileA = makeFile("hello world")
    const fileB = makeFile("hello world")
    const [hashA, hashB] = await Promise.all([
      computeFileHash(fileA),
      computeFileHash(fileB),
    ])
    expect(hashA).toBe(hashB)
  })

  it("produces different hashes for different content", async () => {
    const fileA = makeFile("hello")
    const fileB = makeFile("world")
    const [hashA, hashB] = await Promise.all([
      computeFileHash(fileA),
      computeFileHash(fileB),
    ])
    expect(hashA).not.toBe(hashB)
  })

  it("is deterministic across calls", async () => {
    const file = makeFile("deterministic test")
    const hashes = await Promise.all(
      Array.from({ length: 5 }, () => computeFileHash(file))
    )
    expect(hashes[0]).toBe(hashes[1])
    expect(hashes).toEqual(Array(5).fill(hashes[0]))
  })

  it("returns a 64-character lowercase hex string", async () => {
    const file = makeFile("sha256 test")
    const hash = await computeFileHash(file)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it("is sensitive to content length", async () => {
    const short = makeFile("a")
    const long = makeFile("a".repeat(1000))
    const [hashShort, hashLong] = await Promise.all([
      computeFileHash(short),
      computeFileHash(long),
    ])
    expect(hashShort).not.toBe(hashLong)
  })

  it("uses the file bytes not the filename", async () => {
    const sameContent = "identical bytes"
    const fileA = makeFile(sameContent, "doc1.pdf")
    const fileB = makeFile(sameContent, "doc2.pdf")
    const [hashA, hashB] = await Promise.all([
      computeFileHash(fileA),
      computeFileHash(fileB),
    ])
    expect(hashA).toBe(hashB)
  })
})
