"use client"

import { useCallback, useState } from "react"

import type { ExtractedSection } from "@/lib/types"

type ExtractStatus = "idle" | "extracting" | "done" | "error"

type ExtractResult = {
  sections: ExtractedSection[]
  documentId: string | null
  documentType: string | null
  confidence: number | null
}

type UseExtractReturn = {
  /** Current extraction status */
  status: ExtractStatus
  /** Error message if extraction failed */
  error: string | null
  /** Extracted sections ready for display */
  sections: ExtractedSection[]
  /** Upload and extract a file — returns result on success */
  extract: (file: File) => Promise<ExtractResult>
  /** Reset state back to idle */
  reset: () => void
}

/**
 * Hook that uploads a file to the /api/extract endpoint and returns
 * structured extraction results formatted for the existing UI components.
 */
function useExtract(): UseExtractReturn {
  const [status, setStatus] = useState<ExtractStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<ExtractedSection[]>([])

  const extract = useCallback(async (file: File): Promise<ExtractResult> => {
    setStatus("extracting")
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Extraction failed")
      }

      // Map Gemini sections to the existing ExtractedSection UI format
      const mappedSections: ExtractedSection[] = (
        result.data.sections || []
      ).map(
        (section: {
          title: string
          fields: Array<{
            key: string
            label: string
            value: string | null
            confidence: number
          }>
        }) => ({
          title: section.title,
          fields: section.fields.map(
            (field: {
              key: string
              label: string
              value: string | null
              confidence: number
            }) => {
              const isInferred = field.confidence < 0.9
              return {
                key: field.key,
                label: field.label,
                // If value is null/empty, show a placeholder
                value: field.value || "-",
                // Convert 0-1 confidence to 0-100 for display
                confidence: Math.round(field.confidence * 100),
                // Only mark as AI-completed when AI had to infer the value
                isAiCompleted: isInferred,
                isAiFilled: isInferred,
              }
            }
          ),
        })
      )

      const extractResult: ExtractResult = {
        sections: mappedSections,
        documentId: result.data.documentId ?? null,
        documentType: result.data.documentType ?? null,
        confidence: result.data.confidence ?? null,
      }

      setSections(mappedSections)
      setStatus("done")
      return extractResult
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown extraction error"
      setError(message)
      setStatus("error")
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setStatus("idle")
    setError(null)
    setSections([])
  }, [])

  return { status, error, sections, extract, reset }
}

export type { ExtractStatus }
export { useExtract }
