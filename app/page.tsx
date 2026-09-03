"use client"

import { useState } from "react"

import { CommandPalette } from "@/components/command-palette"
import { mockDocuments } from "@/data/documents"
import { DocumentsView } from "@/modules/documents/documents-view"
import { Navbar } from "@/modules/documents/navbar"

export default function Page() {
  const [activeTab, setActiveTab] = useState<"upload" | "documents">(
    mockDocuments.length === 0 ? "upload" : "documents"
  )

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute -top-48 -left-48 size-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute top-1/3 -right-32 size-[500px] rounded-full bg-violet-500/[0.03] blur-[100px]" />
        <div className="absolute -bottom-48 left-1/3 size-[400px] rounded-full bg-emerald-500/[0.03] blur-[100px]" />

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
      <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <DocumentsView documents={mockDocuments} activeTab={activeTab} />
        </div>
      </main>
    </div>
  )
}
