"use client"

import { Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function Navbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex w-full items-center justify-between gap-4 md:gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 64 64" aria-hidden="true" className="size-6">
              <path d="M18 12h20l10 10v30H18z" fill="white" />
              <path d="M38 12v12h12" fill="#bfdbfe" />
              <path
                d="M25 34h16M25 42h12"
                stroke="#2563eb"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="hidden font-semibold text-base sm:inline-block">
            DocStruct
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label={
                  isDark ? "Switch to light theme" : "Switch to dark theme"
                }
                disabled={!mounted}
              >
                {mounted && isDark ? <Sun /> : <Moon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isDark ? "Switch to light theme" : "Switch to dark theme"}
            </TooltipContent>
          </Tooltip>

          <Avatar size="sm">
            <AvatarFallback>DS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

export { Navbar }
