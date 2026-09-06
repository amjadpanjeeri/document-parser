import { NextResponse } from "next/server"

import { renameDocument } from "@/lib/models/document"

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/documents/:id
 * Renames a saved document without changing its extracted contents.
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as { filename?: unknown }

    if (typeof body.filename !== "string" || !body.filename.trim()) {
      return NextResponse.json(
        { success: false, error: "A non-empty filename is required." },
        { status: 400 }
      )
    }

    const result = await renameDocument(id, body.filename)
    return NextResponse.json(result, { status: result.success ? 200 : 404 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rename failed"
    console.error("[Documents API] Rename error:", message)
    return NextResponse.json(
      { success: false, error: "Unable to rename document." },
      { status: 500 }
    )
  }
}
