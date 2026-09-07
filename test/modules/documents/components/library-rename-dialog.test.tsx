import { render, screen } from "@testing-library/react"

import { LibraryRenameDialog } from "@/modules/documents/components/library-rename-dialog"

describe("LibraryRenameDialog", () => {
  it("renders the title", () => {
    render(
      <LibraryRenameDialog
        open={true}
        value="old.pdf"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("heading", { name: /edit filename/i })
    ).toBeInTheDocument()
  })

  it("renders the description", () => {
    render(
      <LibraryRenameDialog
        open={true}
        value="old.pdf"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByText(/update the name shown in your document library/i)
    ).toBeInTheDocument()
  })

  it("renders the input with the current value", () => {
    render(
      <LibraryRenameDialog
        open={true}
        value="mydoc.pdf"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("textbox", { name: /document filename/i })
    ).toHaveValue("mydoc.pdf")
  })

  it("auto-focuses the input", () => {
    render(
      <LibraryRenameDialog
        open={true}
        value="mydoc.pdf"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("textbox", { name: /document filename/i })
    ).toHaveFocus()
  })

  it("has a max length of 255", () => {
    render(
      <LibraryRenameDialog
        open={true}
        value="mydoc.pdf"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("textbox", { name: /document filename/i })
    ).toHaveAttribute("maxlength", "255")
  })

  it("renders an input that accepts user input", () => {
    render(
      <LibraryRenameDialog
        open={true}
        value="old"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    const input = screen.getByRole("textbox", { name: /document filename/i })
    expect(input).toHaveValue("old")
  })

  it("has a save button that is enabled when value is not empty", () => {
    render(
      <LibraryRenameDialog
        open={true}
        value="mydoc.pdf"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /save name/i })
    ).not.toBeDisabled()
  })

  it("has a cancel button that is enabled", () => {
    render(
      <LibraryRenameDialog
        open={true}
        value="mydoc.pdf"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /cancel/i })).not.toBeDisabled()
  })

  it("disables save button when saving", () => {
    render(
      <LibraryRenameDialog
        open={true}
        value="mydoc.pdf"
        saving={true}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled()
  })

  it("disables save when saving", () => {
    render(
      <LibraryRenameDialog
        open={true}
        value="mydoc.pdf"
        saving={true}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled()
  })

  it("disables save when value is empty", () => {
    render(
      <LibraryRenameDialog
        open={true}
        value=""
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /save name/i })).toBeDisabled()
  })

  it("renders save button as 'Saving...' when saving", () => {
    render(
      <LibraryRenameDialog
        open={true}
        value="mydoc.pdf"
        saving={true}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /saving/i })).toBeInTheDocument()
  })

  it("does not render when open is false", () => {
    const { container } = render(
      <LibraryRenameDialog
        open={false}
        value="mydoc.pdf"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
