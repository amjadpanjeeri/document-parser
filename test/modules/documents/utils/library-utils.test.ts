import { describe, expect, it } from "vitest"

import type { DocStructDocument } from "@/lib/types"
import {
  getFilteredDocuments,
  matchesDocumentFilter,
} from "@/modules/documents/utils/library-utils"

function doc(
  id: string,
  name: string,
  type: DocStructDocument["type"],
  status: DocStructDocument["status"],
  uploadedAt: string,
  searchText = "",
  folderId: string | null = null
): DocStructDocument {
  return { id, name, type, status, uploadedAt, searchText, folderId }
}

describe("matchesDocumentFilter", () => {
  const base = doc("1", "Invoice ABC", "Invoice", "ready", "2026-01-01")

  it("returns true for all filter", () => {
    expect(matchesDocumentFilter(base, "all")).toBe(true)
  })

  it("filters by status ready", () => {
    expect(matchesDocumentFilter(base, "ready")).toBe(true)
    expect(
      matchesDocumentFilter({ ...base, status: "needs_review" }, "ready")
    ).toBe(false)
  })

  it("filters by status needs_review", () => {
    expect(
      matchesDocumentFilter({ ...base, status: "needs_review" }, "needs_review")
    ).toBe(true)
    expect(matchesDocumentFilter(base, "needs_review")).toBe(false)
  })

  it("filters by document type exactly", () => {
    expect(matchesDocumentFilter(base, "Invoice")).toBe(true)
    expect(
      matchesDocumentFilter({ ...base, type: "Contract" }, "Invoice")
    ).toBe(false)
  })

  it("filters by document type with prefix match (case-insensitive)", () => {
    // "Invoice" matches "Invoice Processing" because of startsWith
    const d = {
      ...base,
      type: "Invoice Processing" as DocStructDocument["type"],
    }
    expect(matchesDocumentFilter(d, "Invoice")).toBe(true)
    // Also case-insensitive
    const d2 = {
      ...base,
      type: "INVOICE PROCESSING" as DocStructDocument["type"],
    }
    expect(matchesDocumentFilter(d2, "invoice")).toBe(true)
  })

  it("is case-insensitive for type matching", () => {
    const d = { ...base, type: "INVOICE" as DocStructDocument["type"] }
    expect(matchesDocumentFilter(d, "invoice")).toBe(true)
  })

  it("returns false for unknown filter", () => {
    expect(matchesDocumentFilter(base, "nonexistent")).toBe(false)
  })
})

describe("getFilteredDocuments", () => {
  const docs = [
    doc(
      "1",
      "Alpha Invoice",
      "Invoice",
      "ready",
      "2026-03-01",
      "alpha invoice total"
    ),
    doc(
      "2",
      "Beta Contract",
      "Contract",
      "needs_review",
      "2026-02-01",
      "beta contract terms"
    ),
    doc(
      "3",
      "Gamma Receipt",
      "Receipt",
      "ready",
      "2026-01-01",
      "gamma receipt amount"
    ),
    doc(
      "4",
      "Delta Invoice",
      "Invoice",
      "needs_review",
      "2026-04-01",
      "delta invoice"
    ),
  ]

  it("returns all docs when no query, no filter, default sort", () => {
    const result = getFilteredDocuments(docs, "", null, "all", "date-desc")
    expect(result).toHaveLength(4)
  })

  it("filters by search query", () => {
    const result = getFilteredDocuments(
      docs,
      "invoice",
      null,
      "all",
      "date-desc"
    )
    // doc 1 has "alpha invoice total" and doc 4 has "delta invoice" in searchText
    // doc 2 has "beta contract terms" — no match
    // doc 3 has "gamma receipt amount" — no match
    expect(result).toHaveLength(2)
    expect(result.map((d) => d.id)).toEqual(["4", "1"]) // date-desc: Apr then Mar
  })

  it("searches across multiple terms", () => {
    const result = getFilteredDocuments(
      docs,
      "alpha invoice",
      null,
      "all",
      "date-desc"
    )
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("1")
  })

  it("filters by AI result IDs", () => {
    const result = getFilteredDocuments(
      docs,
      "",
      ["1", "3"],
      "all",
      "date-desc"
    )
    expect(result).toHaveLength(2)
    // date-desc: doc 3 is Jan, doc 1 is Mar — so 1 comes before 3
    expect(result.map((d) => d.id)).toEqual(["1", "3"])
  })

  it("AI results take precedence over keyword search", () => {
    const result = getFilteredDocuments(
      docs,
      "invoice",
      ["2"],
      "all",
      "date-desc"
    )
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("2")
  })

  it("applies status filter", () => {
    const result = getFilteredDocuments(docs, "", null, "ready", "date-desc")
    expect(result).toHaveLength(2)
    expect(result.every((d) => d.status === "ready")).toBe(true)
  })

  it("applies type filter", () => {
    const result = getFilteredDocuments(docs, "", null, "Invoice", "date-desc")
    expect(result).toHaveLength(2)
    expect(result.every((d) => d.type === "Invoice")).toBe(true)
  })

  it("sorts by name ascending", () => {
    const result = getFilteredDocuments(docs, "", null, "all", "name-asc")
    expect(result.map((d) => d.name)).toEqual([
      "Alpha Invoice",
      "Beta Contract",
      "Delta Invoice",
      "Gamma Receipt",
    ])
  })

  it("sorts by name descending", () => {
    const result = getFilteredDocuments(docs, "", null, "all", "name-desc")
    expect(result.map((d) => d.name)).toEqual([
      "Gamma Receipt",
      "Delta Invoice",
      "Beta Contract",
      "Alpha Invoice",
    ])
  })

  it("sorts by date ascending", () => {
    const result = getFilteredDocuments(docs, "", null, "all", "date-asc")
    expect(result.map((d) => d.name)).toEqual([
      "Gamma Receipt", // Jan 1
      "Beta Contract", // Feb 1
      "Alpha Invoice", // Mar 1
      "Delta Invoice", // Apr 1
    ])
  })

  it("sorts by date descending (default)", () => {
    const result = getFilteredDocuments(docs, "", null, "all", "date-desc")
    expect(result.map((d) => d.name)).toEqual([
      "Delta Invoice",
      "Alpha Invoice",
      "Beta Contract",
      "Gamma Receipt",
    ])
  })

  it("sorts by status", () => {
    const result = getFilteredDocuments(docs, "", null, "all", "status")
    // "needs_review" < "ready" alphabetically
    expect(result.map((d) => d.status)).toEqual([
      "needs_review",
      "needs_review",
      "ready",
      "ready",
    ])
  })

  it("combines search + filter + sort", () => {
    const result = getFilteredDocuments(
      docs,
      "invoice",
      null,
      "ready",
      "name-asc"
    )
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("1")
    expect(result[0].type).toBe("Invoice")
    expect(result[0].status).toBe("ready")
  })

  it("returns empty array when search yields no results", () => {
    const result = getFilteredDocuments(
      docs,
      "nonexistent",
      null,
      "all",
      "date-desc"
    )
    expect(result).toHaveLength(0)
  })
})
