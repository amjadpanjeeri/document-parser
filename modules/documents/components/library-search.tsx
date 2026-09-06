"use client"

import { Loader2, Search, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type LibrarySearchProps = {
  query: string
  aiSearching: boolean
  onQueryChange: (query: string) => void
  onSearchWithAi: () => void
  onClear: () => void
}

function LibrarySearch({
  query,
  aiSearching,
  onQueryChange,
  onSearchWithAi,
  onClear,
}: LibrarySearchProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSearchWithAi()
        }}
        placeholder="Search or ask about your documents..."
        className="h-10 pl-9 pr-24"
        aria-label="Search documents and extracted fields"
      />
      <div className="absolute top-1/2 right-1 flex -translate-y-1/2 gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onSearchWithAi}
          disabled={!query.trim() || aiSearching}
          aria-label="Search with AI"
          title="Search with AI"
        >
          {aiSearching ? <Loader2 className="animate-spin" /> : <Sparkles />}
        </Button>
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            aria-label="Clear document search"
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  )
}

export { LibrarySearch }
