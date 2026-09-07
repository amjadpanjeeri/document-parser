import { render, screen } from "@testing-library/react"

import { DeleteFolderDialog } from "@/modules/documents/components/delete-folder-dialog"

describe("DeleteFolderDialog", () => {
  it("renders the title", () => {
    render(
      <DeleteFolderDialog
        open={true}
        folderName="Invoices"
        affectedDocumentCount={0}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    const heading = screen.getByRole("heading")
    expect(heading).toBeInTheDocument()
    expect(heading.textContent).toContain("Invoices")
  })

  it("renders description when no documents inside", () => {
    render(
      <DeleteFolderDialog
        open={true}
        folderName="EmptyFolder"
        affectedDocumentCount={0}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByText(/there are no documents inside it/i)
    ).toBeInTheDocument()
  })

  it("renders description when documents inside", () => {
    render(
      <DeleteFolderDialog
        open={true}
        folderName="Invoices"
        affectedDocumentCount={5}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByText(/what should happen to its documents/i)
    ).toBeInTheDocument()
  })

  it("renders move and delete options", () => {
    render(
      <DeleteFolderDialog
        open={true}
        folderName="Invoices"
        affectedDocumentCount={5}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByText(/move documents to the library/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/delete documents too/i)).toBeInTheDocument()
  })

  it("renders the move option document count", () => {
    render(
      <DeleteFolderDialog
        open={true}
        folderName="Invoices"
        affectedDocumentCount={5}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByText(/5 documents in this folder/i)).toBeInTheDocument()
  })

  it("renders the delete option document count", () => {
    render(
      <DeleteFolderDialog
        open={true}
        folderName="Invoices"
        affectedDocumentCount={5}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByText(/permanently delete the 5 documents/i)
    ).toBeInTheDocument()
  })

  it("renders the delete folder button", () => {
    render(
      <DeleteFolderDialog
        open={true}
        folderName="Invoices"
        affectedDocumentCount={5}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /delete folder/i })
    ).toBeInTheDocument()
  })

  it("renders cancel button", () => {
    render(
      <DeleteFolderDialog
        open={true}
        folderName="Invoices"
        affectedDocumentCount={5}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
  })

  it("disables buttons when saving", () => {
    render(
      <DeleteFolderDialog
        open={true}
        folderName="Invoices"
        affectedDocumentCount={5}
        saving={true}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled()
  })

  it("shows 'Deleting...' on delete button when saving", () => {
    render(
      <DeleteFolderDialog
        open={true}
        folderName="Invoices"
        affectedDocumentCount={5}
        saving={true}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /deleting/i })
    ).toBeInTheDocument()
  })

  it("does not render when open is false", () => {
    const { container } = render(
      <DeleteFolderDialog
        open={false}
        folderName="Invoices"
        affectedDocumentCount={5}
        saving={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
