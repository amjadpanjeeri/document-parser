"use client"

import {
  ArrowUpDown,
  FolderPlus,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  onCreateFolder?: () => void
}

const filterLabels: Record<string, string> = {
  all: "Filter",
  needs_review: "Needs review",
  ready: "Ready",
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
  onCreateFolder,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Title */}
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Documents</h1>
        <p className="text-muted-foreground text-sm">
          {totalCount} item{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Right: Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* New folder */}
        {onCreateFolder && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onCreateFolder}
          >
            <FolderPlus className="size-3.5" />
            New folder
          </Button>
        )}

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

        {/* Type filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal className="size-3.5" />
              {filter === "all" ||
              filter === "needs_review" ||
              filter === "ready"
                ? "Type"
                : (filterLabels[filter] ?? filter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Document type</DropdownMenuLabel>
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

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal className="size-3.5" />
              {filter === "needs_review"
                ? "Needs review"
                : filter === "ready"
                  ? "Ready"
                  : "Status"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Document status</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onFilterChange("all")}>
              All statuses
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onFilterChange("needs_review")}>
              Needs review
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onFilterChange("ready")}>
              Ready
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
            aria-label="grid"
            aria-pressed={viewMode === "grid"}
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
            aria-label="list"
            aria-pressed={viewMode === "list"}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export { PageHeader }
