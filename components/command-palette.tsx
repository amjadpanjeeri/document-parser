"use client"

import {
  ArrowUpDown,
  FileText,
  FileUp,
  LayoutGrid,
  List,
  Moon,
  Search,
  Sun,
  Tag,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type Command = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  shortcut?: string
  action: () => void
}

type CommandPaletteProps = {
  onUpload?: () => void
  onViewChange?: (mode: "grid" | "list") => void
  onFilterChange?: (filter: string) => void
  onSortChange?: (sort: string) => void
}

function CommandPalette({
  onUpload,
  onViewChange,
  onFilterChange,
  onSortChange,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme, setTheme } = useTheme()

  const commands: Command[] = [
    {
      id: "upload",
      label: "Upload Document",
      icon: FileUp,
      category: "Actions",
      shortcut: "U",
      action: () => {
        onUpload?.()
        setOpen(false)
      },
    },
    {
      id: "search",
      label: "Search Documents",
      icon: Search,
      category: "Navigation",
      shortcut: "/",
      action: () => {
        setOpen(false)
        document.querySelector<HTMLInputElement>("[type='search']")?.focus()
      },
    },
    {
      id: "grid-view",
      label: "Grid View",
      icon: LayoutGrid,
      category: "View",
      action: () => {
        onViewChange?.("grid")
        setOpen(false)
      },
    },
    {
      id: "list-view",
      label: "List View",
      icon: List,
      category: "View",
      action: () => {
        onViewChange?.("list")
        setOpen(false)
      },
    },
    {
      id: "filter-all",
      label: "Show All Documents",
      icon: Tag,
      category: "Filter",
      action: () => {
        onFilterChange?.("all")
        setOpen(false)
      },
    },
    {
      id: "filter-invoices",
      label: "Filter: Invoices",
      icon: FileText,
      category: "Filter",
      action: () => {
        onFilterChange?.("Invoice")
        setOpen(false)
      },
    },
    {
      id: "filter-contracts",
      label: "Filter: Contracts",
      icon: FileText,
      category: "Filter",
      action: () => {
        onFilterChange?.("Contract")
        setOpen(false)
      },
    },
    {
      id: "sort-date",
      label: "Sort by Date (Newest)",
      icon: ArrowUpDown,
      category: "Sort",
      action: () => {
        onSortChange?.("date-desc")
        setOpen(false)
      },
    },
    {
      id: "sort-name",
      label: "Sort by Name (A–Z)",
      icon: ArrowUpDown,
      category: "Sort",
      action: () => {
        onSortChange?.("name-asc")
        setOpen(false)
      },
    },
    {
      id: "theme-toggle",
      label:
        resolvedTheme === "dark"
          ? "Switch to Light Mode"
          : "Switch to Dark Mode",
      icon: resolvedTheme === "dark" ? Sun : Moon,
      category: "Settings",
      shortcut: "D",
      action: () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
        setOpen(false)
      },
    },
  ]

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  )

  // Group by category
  const grouped = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = []
      acc[cmd.category].push(cmd)
      return acc
    },
    {} as Record<string, Command[]>
  )

  const flatList = filtered

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
        setQuery("")
        setSelectedIndex(0)
      }
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    },
    [open]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.children[selectedIndex] as HTMLElement
    item?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  const executeCommand = (cmd: Command) => {
    cmd.action()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-label="Close command palette"
      />

      {/* Palette */}
      <div className="fixed left-1/2 top-[20%] w-full max-w-lg -translate-x-1/2 rounded-xl border border-border bg-background shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault()
                setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1))
              }
              if (e.key === "ArrowUp") {
                e.preventDefault()
                setSelectedIndex((i) => Math.max(i - 1, 0))
              }
              if (e.key === "Enter" && flatList[selectedIndex]) {
                executeCommand(flatList[selectedIndex])
              }
            }}
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {flatList.length === 0 && (
            <p className="py-6 text-center text-muted-foreground text-sm">
              No results found.
            </p>
          )}

          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category} className="mb-1">
              <p className="mb-1 px-2 pt-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {category}
              </p>
              {cmds.map((cmd) => {
                const idx = flatList.indexOf(cmd)
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                      idx === selectedIndex
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-left">{cmd.label}</span>
                    {cmd.shortcut && (
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              ↑
            </kbd>
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              ↓
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              ↵
            </kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              esc
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>
  )
}

export { CommandPalette }
