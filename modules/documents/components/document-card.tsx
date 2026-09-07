import type { DocStructDocument } from "@/lib/types"
import { DocumentCardGrid } from "./document-card-grid"
import { DocumentCardList } from "./document-card-list"

type DocumentCardProps = {
  document: DocStructDocument
  viewMode: "grid" | "list"
  onClick?: () => void
  selected?: boolean
  onToggleSelect?: (id: string) => void
  onDelete?: (id: string) => void
  onRename?: (id: string) => void
  onMove?: (id: string) => void
}

function DocumentCard({
  document,
  viewMode,
  onClick,
  selected = false,
  onToggleSelect,
  onDelete,
  onRename,
  onMove,
}: DocumentCardProps) {
  const sharedProps = {
    document,
    selected,
    onClick,
    onToggleSelect: onToggleSelect
      ? () => onToggleSelect(document.id)
      : undefined,
    onDelete: onDelete ? () => onDelete(document.id) : undefined,
    onRename: onRename ? () => onRename(document.id) : undefined,
    onMove: onMove ? () => onMove(document.id) : undefined,
  }

  if (viewMode === "list") {
    return <DocumentCardList {...sharedProps} />
  }

  return <DocumentCardGrid {...sharedProps} />
}

export type { DocumentCardProps }
export { DocumentCard }
