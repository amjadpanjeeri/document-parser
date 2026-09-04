"use client"

import { useState } from "react"

import { CommandPalette } from "@/components/command-palette"
import { mockDocuments } from "@/data/documents"
import type { ExtractedSection } from "@/lib/types"
import { DocumentViewer } from "@/modules/documents/document-viewer"
import { DocumentsView } from "@/modules/documents/documents-view"
import { Navbar } from "@/modules/documents/navbar"

const mockExtractedSections: ExtractedSection[] = [
  {
    title: "Vendor Information",
    fields: [
      {
        key: "vendor_name",
        label: "Vendor Name",
        value: "Acme Corp",
        confidence: 98,
        isAiCompleted: true,
      },
      {
        key: "vendor_address",
        label: "Address",
        value: "123 Business St, San Francisco, CA 94105",
        confidence: 95,
        isAiCompleted: true,
      },
      {
        key: "vendor_email",
        label: "Email",
        value: "billing@acme.com",
        confidence: 99,
        isAiCompleted: true,
      },
    ],
  },
  {
    title: "Invoice Details",
    fields: [
      {
        key: "invoice_number",
        label: "Invoice Number",
        value: "INV-2024-0847",
        confidence: 100,
        isAiCompleted: false,
      },
      {
        key: "invoice_date",
        label: "Invoice Date",
        value: "2024-09-15",
        confidence: 97,
        isAiCompleted: true,
      },
      {
        key: "due_date",
        label: "Due Date",
        value: "2024-10-15",
        confidence: 92,
        isAiCompleted: true,
      },
      {
        key: "currency",
        label: "Currency",
        value: "USD",
        confidence: 100,
        isAiCompleted: false,
      },
    ],
  },
  {
    title: "Line Items",
    fields: [
      {
        key: "item_1_desc",
        label: "Item 1 — Description",
        value: "Web Development Services",
        confidence: 96,
        isAiCompleted: true,
      },
      {
        key: "item_1_qty",
        label: "Item 1 — Quantity",
        value: "1",
        confidence: 100,
        isAiCompleted: false,
      },
      {
        key: "item_1_price",
        label: "Item 1 — Unit Price",
        value: "$5,000.00",
        confidence: 99,
        isAiCompleted: true,
      },
      {
        key: "item_2_desc",
        label: "Item 2 — Description",
        value: "UI/UX Design",
        confidence: 94,
        isAiCompleted: true,
      },
      {
        key: "item_2_qty",
        label: "Item 2 — Quantity",
        value: "1",
        confidence: 100,
        isAiCompleted: false,
      },
      {
        key: "item_2_price",
        label: "Item 2 — Unit Price",
        value: "$2,500.00",
        confidence: 98,
        isAiCompleted: true,
      },
    ],
  },
  {
    title: "Totals",
    fields: [
      {
        key: "subtotal",
        label: "Subtotal",
        value: "$7,500.00",
        confidence: 100,
        isAiCompleted: false,
      },
      {
        key: "tax",
        label: "Tax",
        value: "$675.00",
        confidence: 88,
        isAiCompleted: true,
      },
      {
        key: "total",
        label: "Total",
        value: "$8,175.00",
        confidence: 91,
        isAiCompleted: true,
      },
    ],
  },
]

export default function Page() {
  const [activeTab, setActiveTab] = useState<"upload" | "documents">(
    mockDocuments.length === 0 ? "upload" : "documents"
  )
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerFile, setViewerFile] = useState({
    name: "",
    type: "application/pdf",
  })

  const handleUploadComplete = (fileName: string, fileType: string) => {
    setViewerFile({ name: fileName, type: fileType })
    setViewerOpen(true)
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute -top-48 -left-48 size-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
        <div className="absolute top-1/3 -right-32 size-[500px] rounded-full bg-violet-500/[0.06] blur-[100px]" />
        <div className="absolute -bottom-48 left-1/3 size-[400px] rounded-full bg-emerald-500/[0.06] blur-[100px]" />

        {/* Floating dots */}
        <div className="absolute top-20 left-[15%] size-1 rounded-full bg-primary/20" />
        <div className="absolute top-40 right-[20%] size-1.5 rounded-full bg-violet-500/20" />
        <div className="absolute bottom-32 left-[25%] size-1 rounded-full bg-emerald-500/20" />
        <div className="absolute top-1/2 left-[8%] size-1.5 rounded-full bg-primary/15" />
        <div className="absolute bottom-48 right-[12%] size-1 rounded-full bg-violet-500/15" />
      </div>

      <CommandPalette />
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        documentCount={mockDocuments.length}
      />
      <main className="flex-1 px-4 py-4 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <DocumentsView
            documents={mockDocuments}
            activeTab={activeTab}
            onUploadComplete={handleUploadComplete}
          />
          <DocumentViewer
            open={viewerOpen}
            onOpenChange={setViewerOpen}
            fileName={viewerFile.name}
            fileType={viewerFile.type}
            sections={mockExtractedSections}
          />
        </div>
      </main>
    </div>
  )
}
