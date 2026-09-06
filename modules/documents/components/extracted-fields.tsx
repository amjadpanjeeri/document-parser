"use client"

import { useCallback, useState } from "react"

import type { ExtractedSection } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useDocumentStore } from "@/stores/document-store"
import { FieldRow } from "./field-row"
import { FieldsStatsBar } from "./fields-stats-bar"

type ExtractedFieldsProps = {
  sections: ExtractedSection[]
}

function ExtractedFields({ sections }: ExtractedFieldsProps) {
  const [copied, setCopied] = useState(false)
  const [rightView, setRightView] = useState<"fields" | "json">("fields")
  const [isEditMode, setIsEditMode] = useState(false)
  const [rawJson, setRawJson] = useState("")
  const { updateFieldValue } = useDocumentStore()

  const totalCount = sections.reduce((acc, s) => acc + s.fields.length, 0)
  const aiCount = sections.reduce(
    (acc, s) =>
      acc + s.fields.filter((f) => f.isAiCompleted && !f.isAiFilled).length,
    0
  )
  const aiFilledCount = sections.reduce(
    (acc, s) => acc + s.fields.filter((f) => f.isAiFilled).length,
    0
  )
  const avgConfidence = Math.round(
    sections.reduce(
      (acc, s) =>
        acc + s.fields.reduce((a, f) => a + f.confidence, 0) / s.fields.length,
      0
    ) / sections.length
  )

  const jsonData = useCallback(() => {
    const json: Record<string, unknown> = {}
    for (const section of sections) {
      for (const field of section.fields) {
        json[field.key] = field.value
      }
    }
    return JSON.stringify(json, null, 2)
  }, [sections])

  const displayedJson = rawJson || jsonData()

  const handleFieldEdit = useCallback(
    (key: string, value: string) => {
      updateFieldValue(key, value)
      setRawJson("")
    },
    [updateFieldValue]
  )

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(displayedJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [displayedJson])

  return (
    <div className="flex min-h-0 flex-1 flex-col md:w-1/2 md:flex-none">
      <FieldsStatsBar
        aiCount={aiCount}
        aiFilledCount={aiFilledCount}
        totalCount={totalCount}
        avgConfidence={avgConfidence}
        rightView={rightView}
        onRightViewChange={setRightView}
        isEditMode={isEditMode}
        onToggleEdit={() => setIsEditMode(!isEditMode)}
        copied={copied}
        onCopy={handleCopy}
      />

      <div className="flex-1 overflow-auto p-4">
        {rightView === "fields" ? (
          <div className="flex flex-col gap-5">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="flex flex-col gap-1.5">
                  {section.fields.map((field) => (
                    <FieldRow
                      key={field.key}
                      field={field}
                      isEditing={isEditMode}
                      onEditChange={(v) => handleFieldEdit(field.key, v)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <textarea
            value={displayedJson}
            onChange={(e) => {
              const newValue = e.target.value
              setRawJson(newValue)
              // Sync JSON edits back to the store so save picks them up
              try {
                const parsed = JSON.parse(newValue)
                if (typeof parsed === "object" && parsed !== null) {
                  for (const [key, val] of Object.entries(parsed)) {
                    if (typeof val === "string" || typeof val === "number") {
                      updateFieldValue(key, String(val))
                    }
                  }
                }
              } catch {
                // Invalid JSON — don't sync yet, wait for valid JSON
              }
            }}
            readOnly={!isEditMode}
            spellCheck={false}
            className={cn(
              "h-full w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-foreground outline-none",
              isEditMode
                ? "cursor-text"
                : "cursor-default text-muted-foreground"
            )}
          />
        )}
      </div>
    </div>
  )
}

export { ExtractedFields }
