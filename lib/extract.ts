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
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "")
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

const EXTRACTION_PROMPT = `Extract and complete all fields from this document. Return JSON only.

Rules:
- Every field MUST have a non-null string value. Infer from context if not directly visible.
- confidence 0.9-1.0 = clearly visible text. confidence <0.9 = inferred/computed from context.
- Organize into sections. Include flat fields map.

JSON structure:
{"documentType":"...","confidence":0.0-1.0,"sections":[{"title":"...","fields":[{"key":"snake_case","label":"Human Label","value":"string","confidence":0.0-1.0}]}],"fields":{"key":"value"},"summary":"optional"}`

/**
 * Extracts structured data from a document file using a single Gemini call.
 * The prompt instructs Gemini to extract ALL fields with values — no nulls,
 * no separate fill pass needed.
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

  const cleanedJson = stripCodeBlocks(responseText)

  let parsed: unknown
  try {
    parsed = JSON.parse(cleanedJson)
  } catch {
    throw new Error(
      `Failed to parse Gemini response as JSON. Raw response: ${responseText.slice(0, 200)}`
    )
  }

  const validationResult = ExtractedDocumentSchema.safeParse(parsed)
  if (!validationResult.success) {
    const issues = validationResult.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")
    throw new Error(`Extraction schema validation failed: ${issues}`)
  }

  console.log(
    "[Extract] Single-pass extraction done.",
    "Document type:",
    validationResult.data.documentType,
    "Fields:",
    Object.keys(validationResult.data.fields).length
  )

  return validationResult.data
}
