"use client"

import { ArrowUpDown, LayoutGrid, List, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type PageHeaderProps = {
  totalCount: number
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

function PageHeader({
  totalCount,
  viewMode,
  onViewModeChange,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Title */}
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Documents</h1>
        <p className="text-muted-foreground text-sm">
          {totalCount} document{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowUpDown className="size-3.5" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Date (newest)</DropdownMenuItem>
            <DropdownMenuItem>Date (oldest)</DropdownMenuItem>
            <DropdownMenuItem>Name (A–Z)</DropdownMenuItem>
            <DropdownMenuItem>Name (Z–A)</DropdownMenuItem>
            <DropdownMenuItem>Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal className="size-3.5" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>All types</DropdownMenuItem>
            <DropdownMenuItem>Invoices</DropdownMenuItem>
            <DropdownMenuItem>Contracts</DropdownMenuItem>
            <DropdownMenuItem>Resumes</DropdownMenuItem>
            <DropdownMenuItem>Reports</DropdownMenuItem>
            <DropdownMenuItem>Receipts</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle */}
        <div className="flex rounded-lg border border-border">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex size-8 items-center justify-center rounded-l-lg transition-colors",
              viewMode === "grid"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "flex size-8 items-center justify-center rounded-r-lg border-l border-border transition-colors",
              viewMode === "list"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export { PageHeader }
