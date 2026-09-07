import { render, screen } from "@testing-library/react"

import { RenameFolderDialog } from "@/modules/documents/components/rename-folder-dialog"

describe("RenameFolderDialog", () => {
  it("renders the title", () => {
    render(
      <RenameFolderDialog
        open={true}
        value="Old Name"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("heading", { name: /edit folder name/i })
    ).toBeInTheDocument()
  })

  it("renders the description", () => {
    render(
      <RenameFolderDialog
        open={true}
        value="Old Name"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByText(/update the name shown in your library/i)
    ).toBeInTheDocument()
  })

  it("renders the input with the current value", () => {
    render(
      <RenameFolderDialog
        open={true}
        value="My Folder"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("textbox", { name: /folder name/i })).toHaveValue(
      "My Folder"
    )
  })

  it("auto-focuses the input", () => {
    render(
      <RenameFolderDialog
        open={true}
        value="Old Name"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("textbox", { name: /folder name/i })).toHaveFocus()
  })

  it("renders an input that accepts user input", () => {
    render(
      <RenameFolderDialog
        open={true}
        value="Old"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    const input = screen.getByRole("textbox", { name: /folder name/i })
    expect(input).toHaveValue("Old")
  })

  it("has a save button that is enabled when value is not empty", () => {
    render(
      <RenameFolderDialog
        open={true}
        value="My Folder"
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
      <RenameFolderDialog
        open={true}
        value="Old"
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
      <RenameFolderDialog
        open={true}
        value="Old"
        saving={true}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled()
  })

  it("disables save button when value is empty", () => {
    render(
      <RenameFolderDialog
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
      <RenameFolderDialog
        open={true}
        value="Old"
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
      <RenameFolderDialog
        open={false}
        value="Old"
        saving={false}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it("does not render when open is false and saving", () => {
    const { container } = render(
      <RenameFolderDialog
        open={false}
        value="Old"
        saving={true}
        onValueChange={() => {}}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
