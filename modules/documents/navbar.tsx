"use client"

import { FileText, Upload } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <div className="flex w-full items-center justify-between gap-4 md:gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-4" />
          </div>
          <span className="hidden font-semibold text-base sm:inline-block">
            DocStruct
          </span>
        </Link>

        {/* Avatar */}
        <Avatar size="sm">
          <AvatarFallback>DS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

export { Navbar }
