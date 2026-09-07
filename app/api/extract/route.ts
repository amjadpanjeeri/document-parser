import { NextResponse } from "next/server"

import { extractDocumentData } from "@/lib/extract"
import { uploadDocumentFile } from "@/lib/storage"

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
 * Accepts a FormData with a "file" field and optional "comments" context,
 * containing a PDF, PNG, or JPG/JPEG.
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
    const commentsValue = formData.get("comments")
    const comments = typeof commentsValue === "string" ? commentsValue : ""

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

    const startTime = Date.now()
    const extractedData = await extractDocumentData(file, comments)
    const extractionTimeMs = Date.now() - startTime
    // Keep the original file in storage so saved documents can be previewed
    // later. Best-effort: extraction still succeeds when storage is absent.
    const { path: filePath } = await uploadDocumentFile(file, file.name)

    // Persist only when the user confirms the extracted result in the viewer.
    const documentId: string | null = null
    return NextResponse.json({
      success: true,
      data: {
        ...extractedData,
        documentId,
        filePath,
        fileType: file.type,
        extractionTimeMs,
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
