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
}
