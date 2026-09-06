import { NextResponse } from "next/server"

import { model } from "@/lib/gemini"
import { listDocuments } from "@/lib/models/document"

function stripCodeBlocks(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim()
}

/**
 * POST /api/search
 * Finds saved documents using a natural-language query over extracted data.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: unknown }
    const query = typeof body.query === "string" ? body.query.trim() : ""

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Enter a search question." },
        { status: 400 }
      )
    }

    const documents = await listDocuments(200)
    if (documents.length === 0) {
      return NextResponse.json({ success: true, ids: [], answer: "" })
    }

    const documentContext = documents
      .map((document) =>
        JSON.stringify({
          id: document.id,
          filename: document.filename,
          documentType: document.documentType,
          summary: document.summary ?? "",
          fields: document.fields,
          sections: document.sections.map((section) => ({
            title: section.title,
            fields: section.fields.map((field) => ({
              label: field.label,
              value: field.value,
            })),
          })),
        })
      )
      .join("\n")

    const prompt = `You search a document database. Answer the user's question using only the documents below.

Return JSON only in this exact shape:
{"ids":["document-id"],"answer":"short explanation"}

Rules:
- Include only IDs of documents that directly match the request.
- Use semantic meaning, synonyms, dates, numbers, and comparisons when appropriate.
- For numeric comparisons, parse the values carefully and do not match unrelated numbers.
- If nothing matches, return an empty ids array and say so briefly.
- Never invent document IDs or facts.

User question:
<query>
${query}
</query>

Documents:
${documentContext}`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const parsed = JSON.parse(stripCodeBlocks(responseText)) as {
      ids?: unknown
      answer?: unknown
    }
    const validIds = new Set(documents.map((document) => document.id))
    const ids = Array.isArray(parsed.ids)
      ? parsed.ids.filter(
          (id): id is string => typeof id === "string" && validIds.has(id)
        )
      : []
    const matches = documents
      .filter((document) => ids.includes(document.id))
      .map((document) => ({
        id: document.id,
        filename: document.filename,
        documentType: document.documentType,
      }))

    return NextResponse.json({
      success: true,
      ids,
      matches,
      answer: typeof parsed.answer === "string" ? parsed.answer : "",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI search failed"
    console.error("[Search API]", message)
    return NextResponse.json(
      { success: false, error: "AI search failed. Please try again." },
      { status: 500 }
    )
  }
}
