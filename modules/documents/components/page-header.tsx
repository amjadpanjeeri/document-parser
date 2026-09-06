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
  sort?: string
  filter?: string
  onSortChange?: (sort: string) => void
  onFilterChange?: (filter: string) => void
}

const filterLabels: Record<string, string> = {
  all: "Filter",
  Invoice: "Invoices",
  Contract: "Contracts",
  Resume: "Resumes",
  Report: "Reports",
  Receipt: "Receipts",
}

function PageHeader({
  totalCount,
  viewMode,
  onViewModeChange,
  sort = "date-desc",
  filter = "all",
  onSortChange = () => {},
  onFilterChange = () => {},
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
              {sort === "date-desc"
                ? "Newest"
                : sort === "date-asc"
                  ? "Oldest"
                  : sort === "name-asc"
                    ? "Name A-Z"
                    : sort === "name-desc"
                      ? "Name Z-A"
                      : "Sort"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onSortChange("date-desc")}>
              Date (newest)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onSortChange("date-asc")}>
              Date (oldest)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onSortChange("name-asc")}>
              Name (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onSortChange("name-desc")}>
              Name (Z-A)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onSortChange("status")}>
              Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal className="size-3.5" />
              {filterLabels[filter] ?? filter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onFilterChange("all")}>
              All types
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onFilterChange("Invoice")}>
              Invoices
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onFilterChange("Contract")}>
              Contracts
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onFilterChange("Resume")}>
              Resumes
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onFilterChange("Report")}>
              Reports
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onFilterChange("Receipt")}>
              Receipts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle */}
        <div className="flex rounded-lg border border-border">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex size-7 items-center justify-center rounded-l-lg transition-colors",
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
              "flex size-7 items-center justify-center rounded-r-lg border-l border-border transition-colors",
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
