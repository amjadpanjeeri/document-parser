"use client"

import { useCallback, useState } from "react"

import type { ExtractedSection } from "@/lib/types"
import { cn } from "@/lib/utils"
import { FieldRow } from "./field-row"
import { FieldsStatsBar } from "./fields-stats-bar"

type ExtractedFieldsProps = {
  sections: ExtractedSection[]
}

function ExtractedFields({ sections }: ExtractedFieldsProps) {
  const [copied, setCopied] = useState(false)
  const [rightView, setRightView] = useState<"fields" | "json">("fields")
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})
  const [rawJson, setRawJson] = useState("")

  const totalCount = sections.reduce((acc, s) => acc + s.fields.length, 0)
  const aiCount = sections.reduce(
    (acc, s) => acc + s.fields.filter((f) => f.isAiCompleted).length,
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
        json[field.key] = editedValues[field.key] ?? field.value
      }
    }
    return JSON.stringify(json, null, 2)
  }, [sections, editedValues])

  const displayedJson = rawJson || jsonData()

  const handleFieldEdit = useCallback((key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }))
    setRawJson("")
  }, [])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(displayedJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [displayedJson])

  return (
    <div className="flex min-h-0 flex-1 flex-col md:w-1/2 md:flex-none">
      <FieldsStatsBar
        aiCount={aiCount}
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
                      editValue={editedValues[field.key] ?? field.value}
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
            onChange={(e) => setRawJson(e.target.value)}
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
