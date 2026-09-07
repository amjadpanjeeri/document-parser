import { describe, expect, it } from "vitest"
import { mapStoredSections } from "@/hooks/use-documents"

function storedSection(
  title: string,
  fields: Array<{
    key: string
    label: string
    value: string | null
    confidence: number
  }> = []
): {
  title: string
  fields: Array<{
    key: string
    label: string
    value: string | null
    confidence: number
  }>
} {
  return { title, fields }
}

describe("mapStoredSections", () => {
  it("maps stored sections to UI sections", () => {
    const input = [
      storedSection("Invoice Details", [
        {
          key: "invoice_number",
          label: "Invoice Number",
          value: "INV-001",
          confidence: 0.99,
        },
        { key: "total", label: "Total", value: null, confidence: 0.85 },
      ]),
    ]

    const output = mapStoredSections(input)

    expect(output).toEqual([
      {
        title: "Invoice Details",
        fields: [
          {
            key: "invoice_number",
            label: "Invoice Number",
            value: "INV-001",
            confidence: 99,
            isAiCompleted: false,
            isAiFilled: false,
          },
          {
            key: "total",
            label: "Total",
            value: "-",
            confidence: 85,
            isAiCompleted: true,
            isAiFilled: true,
          },
        ],
      },
    ])
  })

  it("returns empty array for null input", () => {
    expect(mapStoredSections(null as never)).toEqual([])
  })

  it("returns empty array for undefined input", () => {
    expect(mapStoredSections(undefined as never)).toEqual([])
  })

  it("handles multiple sections", () => {
    const input = [
      storedSection("A", [
        { key: "x", label: "X", value: "v", confidence: 0.9 },
      ]),
      storedSection("B", [
        { key: "y", label: "Y", value: null, confidence: 0.5 },
      ]),
    ]
    const output = mapStoredSections(input)
    expect(output).toHaveLength(2)
    expect(output[0].title).toBe("A")
    expect(output[1].title).toBe("B")
  })

  it("converts confidence from 0-1 to 0-100", () => {
    const input = [
      storedSection("S", [
        { key: "a", label: "A", value: "v", confidence: 0.5 },
        { key: "b", label: "B", value: "v", confidence: 1.0 },
        { key: "c", label: "C", value: "v", confidence: 0.0 },
      ]),
    ]
    const output = mapStoredSections(input)
    expect(output[0].fields.map((f) => f.confidence)).toEqual([50, 100, 0])
  })

  it("marks low-confidence fields as AI-filled", () => {
    const input = [
      storedSection("S", [
        { key: "a", label: "A", value: "v", confidence: 0.95 },
        { key: "b", label: "B", value: null, confidence: 0.49 },
      ]),
    ]
    const output = mapStoredSections(input)
    expect(output[0].fields[0].isAiCompleted).toBe(false)
    expect(output[0].fields[0].isAiFilled).toBe(false)
    expect(output[0].fields[1].isAiCompleted).toBe(true)
    expect(output[0].fields[1].isAiFilled).toBe(true)
  })
})
