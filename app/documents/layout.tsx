import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documents",
  description:
    "Browse, search, filter, and query your extracted documents with DocStruct.",
}

export default function DocumentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
