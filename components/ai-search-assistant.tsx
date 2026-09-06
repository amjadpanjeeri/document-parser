"use client"

import { Bot, History, Loader2, Sparkles, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const suggestions = [
  "Show unpaid invoices",
  "Find documents from Acme",
  "Which invoices are due this month?",
  "Find documents mentioning payment terms",
]

const RECENT_SEARCHES_KEY = "docstruct-recent-ai-searches"
const MAX_RECENT_SEARCHES = 5

type SearchResult = {
  ids: string[]
  matches: Array<{ id: string; filename: string; documentType: string }>
  answer: string
}

function AiSearchAssistant() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<SearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY)
      const parsed: unknown = stored ? JSON.parse(stored) : []
      if (Array.isArray(parsed)) {
        setRecentSearches(
          parsed.filter((item): item is string => typeof item === "string")
        )
      }
    } catch {
      setRecentSearches([])
    }
  }, [])

  const search = async (nextQuery = query) => {
    const normalizedQuery = nextQuery.trim()
    if (!normalizedQuery || searching) return

    setQuery(normalizedQuery)
    setSearching(true)
    setResult(null)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: normalizedQuery }),
      })
      const data = (await response.json()) as {
        success?: boolean
        ids?: string[]
        matches?: Array<{
          id: string
          filename: string
          documentType: string
        }>
        answer?: string
        error?: string
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "AI search failed")
      }

      setResult({
        ids: data.ids ?? [],
        matches: data.matches ?? [],
        answer: data.answer ?? "",
      })
      setRecentSearches((previous) => {
        const updated = [
          normalizedQuery,
          ...previous.filter(
            (item) => item.toLowerCase() !== normalizedQuery.toLowerCase()
          ),
        ].slice(0, MAX_RECENT_SEARCHES)
        window.localStorage.setItem(
          RECENT_SEARCHES_KEY,
          JSON.stringify(updated)
        )
        return updated
      })
    } catch (error) {
      toast.error("AI search failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setSearching(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        size="icon-lg"
        className="fixed right-5 bottom-5 z-40 rounded-full shadow-lg shadow-primary/20"
        onClick={() => setOpen(true)}
        aria-label="Ask AI about your documents"
        title="Ask AI about your documents"
      >
        <Sparkles />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-md"
        >
          <SheetHeader>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Bot className="size-5 text-primary" />
            </div>
            <SheetTitle>Ask your documents</SheetTitle>
            <SheetDescription>
              Ask a question about the data extracted from your saved documents.
            </SheetDescription>
          </SheetHeader>

          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              search()
            }}
          >
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. Show unpaid invoices"
                aria-label="Ask a question about documents"
                autoFocus
              />
              <Button type="submit" disabled={!query.trim() || searching}>
                {searching ? <Loader2 className="animate-spin" /> : "Ask"}
              </Button>
            </div>
          </form>

          {recentSearches.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 font-medium text-sm">
                  <History className="size-3.5 text-muted-foreground" />
                  Recent searches
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground"
                  onClick={() => {
                    setRecentSearches([])
                    window.localStorage.removeItem(RECENT_SEARCHES_KEY)
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Clear
                </Button>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                {recentSearches.map((recentSearch) => (
                  <button
                    key={recentSearch}
                    type="button"
                    className="max-w-full truncate text-left text-muted-foreground text-sm hover:text-foreground"
                    onClick={() => search(recentSearch)}
                    disabled={searching}
                    title={recentSearch}
                  >
                    {recentSearch}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="font-medium text-sm">Try asking</p>
            <div className="flex flex-col items-start gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="text-left text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline"
                  onClick={() => search(suggestion)}
                  disabled={searching}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-primary text-sm">
                <Sparkles className="size-4" />
                <span>
                  {result.ids.length} matching document
                  {result.ids.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                {result.answer || "No matching documents found."}
              </p>
              {result.matches.length > 0 && (
                <div className="flex flex-col gap-1 border-t border-primary/10 pt-3">
                  <p className="font-medium text-xs">Open a result</p>
                  {result.matches.map((match) => (
                    <a
                      key={match.id}
                      href={`/documents?documentId=${encodeURIComponent(match.id)}`}
                      onClick={() => setOpen(false)}
                      className="truncate text-sm text-primary underline-offset-4 hover:underline"
                      title={`${match.filename} · ${match.documentType}`}
                    >
                      {match.filename}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

export { AiSearchAssistant }
