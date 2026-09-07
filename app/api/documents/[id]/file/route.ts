import { NextResponse } from "next/server"

import { getDocument } from "@/lib/models/document"
import { getDocumentFileUrl } from "@/lib/storage"

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/documents/:id/file
 *
 * Redirects to a short-lived signed URL for the stored original file, so
 * private documents can be previewed without exposing the bucket.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const document = await getDocument(id)

    if (!document?.filePath) {
      return NextResponse.json(
        { success: false, error: "Document file not found" },
        { status: 404 }
      )
    }

    const { url, error } = await getDocumentFileUrl(document.filePath)
    if (error || !url) {
      return NextResponse.json(
        {
          success: false,
          error: error ?? "Couldn't generate a file URL",
        },
        { status: 500 }
      )
    }

    return NextResponse.redirect(url)
  } catch (error) {
    const message = error instanceof Error ? error.message : "File fetch failed"
    console.error("[Documents API] File error:", message)
    return NextResponse.json(
      { success: false, error: "Unable to fetch the document file." },
      { status: 500 }
    )
  }
}
