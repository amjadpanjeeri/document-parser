import { model } from "./gemini"
import {
  type ExtractedDocument,
  ExtractedDocumentSchema,
} from "./schemas/extraction"

/**
 * Allowed MIME types for document extraction.
 */
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
] as const

/**
 * Converts a File (server-side Blob) to a base64-encoded string.
 * Uses ArrayBuffer + Buffer which work in Node.js — no FileReader needed.
 */
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return buffer.toString("base64")
}

/**
 * Strips markdown code block wrappers from a JSON string.
 * Gemini sometimes wraps JSON in ```json ... ``` blocks.
 */
function stripCodeBlocks(text: string): string {
  let cleaned = text.trim()
  // Remove opening code block: ```json or ```
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "")
  // Remove closing code block
  cleaned = cleaned.replace(/\n?```\s*$/i, "")
  return cleaned.trim()
}

/**
 * Validates that the file type is allowed.
 */
function validateFileType(file: File): void {
  if (
    !ALLOWED_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_MIME_TYPES)[number]
    )
  ) {
    throw new Error(
      `Unsupported file type: ${file.type}. Allowed: PDF, PNG, JPG/JPEG`
    )
  }
}

const EXTRACTION_PROMPT = `You are a document data extraction expert. Analyze this document and extract all important fields.

Instructions:
1. Identify the document type (Invoice, Contract, Receipt, Resume, Report, ID Document, or Other)
2. Extract ALL visible fields — names, dates, amounts, addresses, IDs, line items, etc.
3. Organize fields into logical sections (e.g. "Vendor Information", "Invoice Details", "Line Items", "Totals")
4. For each field, provide a machine-readable key, a human-readable label, the extracted value, and a confidence score (0 to 1)
5. Use null for fields that are missing or not applicable
6. Also return a flat "fields" map with all key-value pairs for convenience
7. Include an overall confidence score for the extraction
8. Optionally include a brief summary of the document

Return ONLY valid JSON matching this exact structure — no markdown, no explanation:
{
  "documentType": "string",
  "confidence": 0.0-1.0,
  "sections": [
    {
      "title": "Section Title",
      "fields": [
        {
          "key": "machine_key",
          "label": "Human Label",
          "value": "extracted value or null",
          "confidence": 0.0-1.0
        }
      ]
    }
  ],
  "fields": {
    "key": "value or null"
  },
  "summary": "optional brief summary"
}`

/**
 * Extracts structured data from a document file using Gemini.
 *
 * @param file - The document file to extract data from (PDF, PNG, JPG, JPEG)
 * @returns Parsed and validated extraction result
 * @throws If the file type is unsupported, Gemini fails, or parsing fails
 */
export async function extractDocumentData(
  file: File
): Promise<ExtractedDocument> {
  validateFileType(file)

  const base64Data = await fileToBase64(file)
  const mimeType = file.type

  const result = await model.generateContent([
    EXTRACTION_PROMPT,
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
  ])

  const responseText = result.response.text()
  if (!responseText) {
    throw new Error("Empty response from Gemini")
  }

  // Clean the response — remove any markdown code block wrappers
  const cleanedJson = stripCodeBlocks(responseText)

  // Parse JSON
  let parsed: unknown
  try {
    parsed = JSON.parse(cleanedJson)
  } catch {
    throw new Error(
      `Failed to parse Gemini response as JSON. Raw response: ${responseText.slice(0, 200)}`
    )
  }

  // Validate against our schema
  const validationResult = ExtractedDocumentSchema.safeParse(parsed)
  if (!validationResult.success) {
    const issues = validationResult.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")
    throw new Error(`Extraction schema validation failed: ${issues}`)
  }

  return validationResult.data
}
