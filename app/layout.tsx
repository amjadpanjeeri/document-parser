import type { Metadata } from "next"
import { Geist_Mono, Outfit } from "next/font/google"

import "./globals.css"
import { AiSearchAssistant } from "@/components/ai-search-assistant"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DocStruct | Structured document intelligence",
    template: "%s | DocStruct",
  },
  description:
    "Extract clean, structured data from invoices, receipts, contracts, and other documents, then search and query the results with AI.",
  applicationName: "DocStruct",
  generator: "Next.js",
  keywords: [
    "document extraction",
    "structured data",
    "document AI",
    "OCR",
    "document search",
  ],
  authors: [{ name: "DocStruct" }],
  creator: "DocStruct",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "DocStruct",
    title: "DocStruct | Structured document intelligence",
    description:
      "Turn messy documents into clean, searchable, structured data.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "DocStruct | Structured document intelligence",
    description:
      "Turn messy documents into clean, searchable, structured data.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        outfit.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <AiSearchAssistant />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
