import { render, screen } from "@testing-library/react"

import type { Folder } from "@/lib/types"
import { MoveToFolderDialog } from "@/modules/documents/components/move-to-folder-dialog"

function folder(
  id: string,
  name: string,
  parentId: string | null = null
): Folder {
  return {
    id,
    name,
    parentId,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  }
}

describe("MoveToFolderDialog", () => {
  const folders = [
    folder("f1", "Invoices"),
    folder("f2", "Contracts"),
    folder("f3", "Receipts"),
  ]

  it("renders the title", () => {
    render(
      <MoveToFolderDialog
        open={true}
        documentCount={3}
        folders={folders}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("heading", { name: /move to folder/i })
    ).toBeInTheDocument()
  })

  it("renders the description with document count", () => {
    render(
      <MoveToFolderDialog
        open={true}
        documentCount={3}
        folders={folders}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByText(/move 3 documents to a folder/i)
    ).toBeInTheDocument()
  })

  it("renders the library root option", () => {
    render(
      <MoveToFolderDialog
        open={true}
        documentCount={3}
        folders={folders}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByText(/library root/i)).toBeInTheDocument()
  })

  it("renders each folder as a button", () => {
    render(
      <MoveToFolderDialog
        open={true}
        documentCount={3}
        folders={folders}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByText(/invoices/i)).toBeInTheDocument()
    expect(screen.getByText(/contracts/i)).toBeInTheDocument()
    expect(screen.getByText(/receipts/i)).toBeInTheDocument()
  })

  it("renders the move here button", () => {
    render(
      <MoveToFolderDialog
        open={true}
        documentCount={3}
        folders={folders}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /move here/i })
    ).toBeInTheDocument()
  })

  it("renders the cancel button", () => {
    render(
      <MoveToFolderDialog
        open={true}
        documentCount={3}
        folders={folders}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
  })

  it("disables buttons when saving", () => {
    render(
      <MoveToFolderDialog
        open={true}
        documentCount={3}
        folders={folders}
        saving={true}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled()
  })

  it("renders 'Moving...' on move button when saving", () => {
    render(
      <MoveToFolderDialog
        open={true}
        documentCount={3}
        folders={folders}
        saving={true}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /moving/i })).toBeInTheDocument()
  })

  it("does not render when open is false", () => {
    const { container } = render(
      <MoveToFolderDialog
        open={false}
        documentCount={3}
        folders={folders}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
