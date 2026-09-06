import { NextResponse } from "next/server"

import { extractDocumentData } from "@/lib/extract"
import { saveDocument } from "@/lib/models/document"

/**
 * Allowed MIME types for upload validation.
 */
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]

/**
 * POST /api/extract
 *
 * Accepts a FormData with a "file" field containing a PDF, PNG, or JPG/JPEG.
 * Extracts structured data using a single Gemini call and returns it as JSON.
 *
 * Response format:
 * { success: true, data: ExtractedDocument }
 * { success: false, error: string }
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided. Include a 'file' field in FormData.",
        },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${file.type}. Allowed: PDF, PNG, JPG/JPEG.`,
        },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      )
    }

    console.log("[Extract API] Processing:", file.name, file.type, file.size)

    const extractedData = await extractDocumentData(file)

    console.log(
      "[Extract API] Done.",
      "Type:",
      extractedData.documentType,
      "Fields:",
      Object.keys(extractedData.fields).length
    )

    // Return immediately — save to DB in background
    const documentId: string | null = null
    saveDocument({
      filename: file.name,
      documentType: extractedData.documentType,
      confidence: extractedData.confidence,
      sections: extractedData.sections,
      fields: extractedData.fields,
      summary: extractedData.summary,
    })
      .then((result) => {
        if (result.success) {
          console.log("[Extract API] Saved to DB:", result.id)
        } else {
          console.error("[Extract API] Save failed:", result.error)
        }
      })
      .catch((err) => console.error("[Extract API] Save error:", err))

    return NextResponse.json({
      success: true,
      data: {
        ...extractedData,
        documentId,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown extraction error"

    console.error("[Extract API]", message)

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
