import { describe, expect, it } from "vitest"

import { formatDocumentDate } from "@/modules/documents/utils/format-document-date"

describe("formatDocumentDate", () => {
  it("formats an ISO date in en-US short format", () => {
    expect(formatDocumentDate("2026-03-15T00:00:00Z")).toBe("Mar 15, 2026")
  })

  it("formats a date with timezone offset", () => {
    expect(formatDocumentDate("2026-01-01T00:00:00+05:00")).toBe("Jan 1, 2026")
  })

  it("returns the original string for invalid dates", () => {
    expect(formatDocumentDate("not-a-date")).toBe("not-a-date")
  })

  it("returns the original string for empty string", () => {
    expect(formatDocumentDate("")).toBe("")
  })

  it("handles dates across different months", () => {
    expect(formatDocumentDate("2026-12-25T00:00:00Z")).toBe("Dec 25, 2026")
    expect(formatDocumentDate("2026-06-15T00:00:00Z")).toBe("Jun 15, 2026")
  })
})
