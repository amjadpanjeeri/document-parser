export type DocumentType =
  | "Invoice"
  | "Contract"
  | "Resume"
  | "Report"
  | "Receipt"
  | "ID Document"
  | "Other"

export type DocumentStatus = "processing" | "needs_review" | "ready"

export interface DocStructDocument {
  id: string
  name: string
  type: DocumentType
  status: DocumentStatus
  uploadedAt: string
  confidence?: number
  thumbnailUrl?: string
  searchText?: string
  /** Parent folder id, or null when the document lives in the library root. */
  folderId?: string | null
}

export type Folder = {
  id: string
  name: string
  /** Parent folder id, or null for folders at the library root. */
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export type ExtractedField = {
  key: string
  label: string
  value: string
  confidence: number
  isAiCompleted: boolean
  isAiFilled?: boolean
  isEditable?: boolean
}

export type ExtractedSection = {
  title: string
  fields: ExtractedField[]
}
