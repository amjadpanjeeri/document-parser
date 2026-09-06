import type { DocStructDocument, DocumentStatus } from "@/lib/types"
import { DocumentCardGrid } from "./document-card-grid"
import { DocumentCardList } from "./document-card-list"

const statusConfig: Record<
  DocumentStatus,
  { label: string; className: string }
> = {
  processing: {
    label: "Processing",
    className:
      "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  },
  needs_review: {
    label: "Needs Review",
    className:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  },
  ready: {
    label: "Ready",
    className:
      "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
  },
}

type DocumentCardProps = {
  document: DocStructDocument
  viewMode: "grid" | "list"
  onClick?: () => void
  selected?: boolean
  onToggleSelect?: (id: string) => void
  onDelete?: (id: string) => void
  onRename?: (id: string) => void
}

function DocumentCard({
  document,
  viewMode,
  onClick,
  selected = false,
  onToggleSelect,
  onDelete,
  onRename,
}: DocumentCardProps) {
  const status = statusConfig[document.status]

  const sharedProps = {
    document,
    selected,
    statusLabel: status.label,
    statusClassName: status.className,
    onClick,
    onToggleSelect: onToggleSelect
      ? () => onToggleSelect(document.id)
      : undefined,
    onDelete: onDelete ? () => onDelete(document.id) : undefined,
    onRename: onRename ? () => onRename(document.id) : undefined,
  }

  if (viewMode === "list") {
    return <DocumentCardList {...sharedProps} />
  }

  return <DocumentCardGrid {...sharedProps} />
}

export type { DocumentCardProps }
export { DocumentCard }
