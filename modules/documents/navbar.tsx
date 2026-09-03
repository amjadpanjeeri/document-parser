"use client"

import { FileText, Upload } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type NavbarProps = {
  activeTab: "upload" | "documents"
  onTabChange: (tab: "upload" | "documents") => void
  documentCount?: number
}

function Navbar({ activeTab, onTabChange, documentCount = 0 }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex w-full items-center justify-between gap-4 md:gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-4" />
          </div>
          <span className="hidden font-semibold text-base sm:inline-block">
            DocStruct
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTabChange("upload")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
              activeTab === "upload"
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Upload className="size-3.5" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => onTabChange("documents")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
              activeTab === "documents"
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="size-3.5" />
            Documents
            {documentCount > 0 && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-primary text-[10px] font-medium">
                {documentCount}
              </span>
            )}
          </button>
        </div>

        {/* Avatar */}
        <Avatar size="sm">
          <AvatarFallback>DS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

export { Navbar }
