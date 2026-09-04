import { z } from "zod"

/**
 * A single extracted key-value field from a document.
 */
const ExtractedFieldSchema = z.object({
  key: z.string().describe("Machine-readable field key, e.g. 'vendor_name'"),
  label: z.string().describe("Human-readable label, e.g. 'Vendor Name'"),
  value: z
    .string()
    .nullable()
    .describe("Extracted value as a string, or null if not found"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score between 0 and 1"),
})

/**
 * A group of related extracted fields (e.g. "Invoice Details", "Line Items").
 */
const ExtractedSectionSchema = z.object({
  title: z.string().describe("Section title, e.g. 'Invoice Details'"),
  fields: z.array(ExtractedFieldSchema),
})

/**
 * Generic extracted document data returned by Gemini.
 * This is the flexible schema — works for any document type.
 */
const ExtractedDocumentSchema = z.object({
  documentType: z
    .string()
    .describe(
      "Detected document type, e.g. 'Invoice', 'Contract', 'Receipt', 'Resume'"
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Overall extraction confidence between 0 and 1"),
  sections: z
    .array(ExtractedSectionSchema)
    .describe("Grouped fields organized by logical section"),
  fields: z
    .record(z.string(), z.string().nullable())
    .describe("Flat key-value map of all extracted fields"),
  summary: z
    .string()
    .optional()
    .describe("Brief summary of the document contents"),
})

type ExtractedDocument = z.infer<typeof ExtractedDocumentSchema>
type ExtractedField = z.infer<typeof ExtractedFieldSchema>
type ExtractedSection = z.infer<typeof ExtractedSectionSchema>

/**
 * Invoice-specific schema as a stricter example.
 * Validates common invoice fields with more specific types.
 */
const InvoiceSchema = z.object({
  documentType: z.literal("Invoice"),
  confidence: z.number().min(0).max(1),
  vendorName: z.string().nullable(),
  vendorAddress: z.string().nullable(),
  vendorEmail: z.string().nullable(),
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  currency: z.string().nullable(),
  subtotal: z.string().nullable(),
  tax: z.string().nullable(),
  total: z.string().nullable(),
  lineItems: z
    .array(
      z.object({
        description: z.string().nullable(),
        quantity: z.string().nullable(),
        unitPrice: z.string().nullable(),
        amount: z.string().nullable(),
      })
    )
    .optional(),
})

type InvoiceData = z.infer<typeof InvoiceSchema>

export {
  type ExtractedDocument,
  ExtractedDocumentSchema,
  type ExtractedField,
  ExtractedFieldSchema,
  type ExtractedSection,
  ExtractedSectionSchema,
  type InvoiceData,
  InvoiceSchema,
}
