import { describe, expect, it } from "vitest"

import { toUserMessage } from "@/lib/error-message"

describe("toUserMessage", () => {
  it("returns fallback for null", () => {
    expect(toUserMessage(null)).toBe("Something went wrong. Please try again.")
  })

  it("returns fallback for undefined", () => {
    expect(toUserMessage(undefined)).toBe(
      "Something went wrong. Please try again."
    )
  })

  it("returns fallback for empty string", () => {
    expect(toUserMessage("")).toBe("Something went wrong. Please try again.")
  })

  it("returns fallback when raw is null and custom fallback is given", () => {
    expect(toUserMessage(null, "Try again")).toBe("Try again")
  })

  it("detects database unavailable errors", () => {
    expect(
      toUserMessage("Database unavailable — please check your connection")
    ).toContain("database isn't reachable")
  })

  it("detects database unavailable in various spellings", () => {
    expect(toUserMessage("Database unavailable")).toContain(
      "database isn't reachable"
    )
    expect(toUserMessage("mongodb connection failed")).toContain(
      "database isn't reachable"
    )
    expect(toUserMessage("MongoDB is unreachable")).toContain(
      "database isn't reachable"
    )
  })

  it("detects ECONNREFUSED", () => {
    expect(toUserMessage("ECONNREFUSED on port 27017")).toContain(
      "database isn't reachable"
    )
  })

  it("detects ENOTFOUND", () => {
    expect(toUserMessage("ENOTFOUND cluster0.mongodb.net")).toContain(
      "database isn't reachable"
    )
  })

  it("detects querySrv errors", () => {
    expect(toUserMessage("querySrv ENOTFOUND db.example.com")).toContain(
      "database isn't reachable"
    )
  })

  it("detects network error", () => {
    expect(toUserMessage("network error: timed out")).toContain(
      "database isn't reachable"
    )
  })

  it("detects failed to fetch", () => {
    expect(toUserMessage("failed to fetch documents")).toContain(
      "database isn't reachable"
    )
  })

  it("passes through already-friendly messages", () => {
    expect(
      toUserMessage("Unsupported file type: txt. Allowed: PDF, PNG, JPG/JPEG.")
    ).toBe("Unsupported file type: txt. Allowed: PDF, PNG, JPG/JPEG.")
  })

  it("passes through non-DB error messages", () => {
    expect(toUserMessage("Connection lost")).toBe("Connection lost")
    expect(toUserMessage("File not found", "default")).toBe("File not found")
  })

  it("is case-insensitive for DB detection", () => {
    expect(toUserMessage("mongoDB connection refused")).toContain(
      "database isn't reachable"
    )
  })
})
