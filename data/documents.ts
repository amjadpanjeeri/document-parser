import type { DocStructDocument } from "@/lib/types"

export const mockDocuments: DocStructDocument[] = [
  {
    id: "1",
    name: "Q4 Financial Report.pdf",
    type: "Report",
    status: "ready",
    uploadedAt: "Sep 2, 2026",
    confidence: 98,
  },
  {
    id: "2",
    name: "Client Agreement - Acme Corp.pdf",
    type: "Contract",
    status: "ready",
    uploadedAt: "Sep 1, 2026",
    confidence: 95,
  },
  {
    id: "3",
    name: "Invoice #1234.pdf",
    type: "Invoice",
    status: "processing",
    uploadedAt: "Aug 30, 2026",
  },
  {
    id: "4",
    name: "Sarah Johnson - Resume.pdf",
    type: "Resume",
    status: "needs_review",
    uploadedAt: "Aug 28, 2026",
    confidence: 82,
  },
  {
    id: "5",
    name: "Expense Receipt - Travel.pdf",
    type: "Receipt",
    status: "ready",
    uploadedAt: "Aug 25, 2026",
    confidence: 99,
  },
  {
    id: "6",
    name: "NDA - TechStart Inc.pdf",
    type: "Contract",
    status: "processing",
    uploadedAt: "Aug 24, 2026",
  },
]
