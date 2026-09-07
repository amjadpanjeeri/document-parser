import { describe, expect, it } from "vitest"

import {
  ExtractedDocumentSchema,
  ExtractedFieldSchema,
  ExtractedSectionSchema,
  InvoiceSchema,
} from "@/lib/schemas/extraction"

describe("ExtractedFieldSchema", () => {
  it("validates a complete field", () => {
    const result = ExtractedFieldSchema.safeParse({
      key: "vendor_name",
      label: "Vendor Name",
      value: "Acme Corp",
      confidence: 0.97,
    })
    expect(result.success).toBe(true)
  })

  it("accepts null value", () => {
    const result = ExtractedFieldSchema.safeParse({
      key: "tax_id",
      label: "Tax ID",
      value: null,
      confidence: 0.8,
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing key", () => {
    const result = ExtractedFieldSchema.safeParse({
      label: "Vendor Name",
      value: "Acme",
      confidence: 1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects confidence below 0", () => {
    const result = ExtractedFieldSchema.safeParse({
      key: "x",
      label: "X",
      value: "v",
      confidence: -0.1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects confidence above 1", () => {
    const result = ExtractedFieldSchema.safeParse({
      key: "x",
      label: "X",
      value: "v",
      confidence: 1.5,
    })
    expect(result.success).toBe(false)
  })
})

describe("ExtractedSectionSchema", () => {
  it("validates a section with fields", () => {
    const result = ExtractedSectionSchema.safeParse({
      title: "Invoice Details",
      fields: [
        {
          key: "invoice_number",
          label: "Invoice Number",
          value: "INV-001",
          confidence: 0.99,
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty field array", () => {
    const result = ExtractedSectionSchema.safeParse({
      title: "Empty",
      fields: [],
    })
    expect(result.success).toBe(true) // empty array is valid
  })

  it("rejects missing title", () => {
    const result = ExtractedSectionSchema.safeParse({
      fields: [
        {
          key: "x",
          label: "X",
          value: "v",
          confidence: 1,
        },
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe("ExtractedDocumentSchema", () => {
  it("validates a complete document", () => {
    const result = ExtractedDocumentSchema.safeParse({
      documentType: "Invoice",
      confidence: 0.95,
      sections: [
        {
          title: "Invoice Details",
          fields: [
            {
              key: "invoice_number",
              label: "Invoice Number",
              value: "INV-001",
              confidence: 0.99,
            },
          ],
        },
      ],
      fields: {
        invoice_number: "INV-001",
        total: "100.00",
      },
      summary: "Invoice from Acme Corp for $100",
    })
    expect(result.success).toBe(true)
  })

  it("accepts missing summary", () => {
    const result = ExtractedDocumentSchema.safeParse({
      documentType: "Receipt",
      confidence: 0.9,
      sections: [],
      fields: {},
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing documentType", () => {
    const result = ExtractedDocumentSchema.safeParse({
      confidence: 0.9,
      sections: [],
      fields: {},
    })
    expect(result.success).toBe(false)
  })

  it("rejects confidence above 1", () => {
    const result = ExtractedDocumentSchema.safeParse({
      documentType: "Invoice",
      confidence: 1.2,
      sections: [],
      fields: {},
    })
    expect(result.success).toBe(false)
  })

  it("rejects negative confidence", () => {
    const result = ExtractedDocumentSchema.safeParse({
      documentType: "Invoice",
      confidence: -0.1,
      sections: [],
      fields: {},
    })
    expect(result.success).toBe(false)
  })

  it("rejects fields with non-string values", () => {
    const result = ExtractedDocumentSchema.safeParse({
      documentType: "Invoice",
      confidence: 0.9,
      sections: [],
      fields: { total: 100 },
    })
    expect(result.success).toBe(false)
  })
})

describe("InvoiceSchema", () => {
  it("validates a complete invoice", () => {
    const result = InvoiceSchema.safeParse({
      documentType: "Invoice",
      confidence: 0.95,
      vendorName: "Acme Corp",
      vendorAddress: "123 Main St",
      vendorEmail: "billing@acme.com",
      invoiceNumber: "INV-001",
      invoiceDate: "2026-01-15",
      dueDate: "2026-02-15",
      currency: "USD",
      subtotal: "100.00",
      tax: "10.00",
      total: "110.00",
      lineItems: [
        {
          description: "Services",
          quantity: "1",
          unitPrice: "100.00",
          amount: "100.00",
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("rejects wrong documentType literal", () => {
    const result = InvoiceSchema.safeParse({
      documentType: "Receipt",
      confidence: 0.9,
      vendorName: "Acme",
      vendorAddress: "123 St",
      vendorEmail: "a@b.com",
      invoiceNumber: "INV-1",
      invoiceDate: "2026-01-01",
      dueDate: "2026-02-01",
      currency: "USD",
      subtotal: "0",
      tax: "0",
      total: "0",
    })
    expect(result.success).toBe(false)
  })

  it("accepts nullable fields", () => {
    const result = InvoiceSchema.safeParse({
      documentType: "Invoice",
      confidence: 0.8,
      vendorName: null,
      vendorAddress: null,
      vendorEmail: null,
      invoiceNumber: null,
      invoiceDate: null,
      dueDate: null,
      currency: null,
      subtotal: null,
      tax: null,
      total: null,
    })
    expect(result.success).toBe(true)
  })
})
