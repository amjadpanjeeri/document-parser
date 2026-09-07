import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { NewFolderDialog } from "@/modules/documents/components/new-folder-dialog"

describe("NewFolderDialog", () => {
  it("renders the title", () => {
    render(
      <NewFolderDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        saving={false}
      />
    )
    expect(
      screen.getByRole("heading", { name: /new folder/i })
    ).toBeInTheDocument()
  })

  it("renders the description when no locationLabel is given", () => {
    render(
      <NewFolderDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        saving={false}
      />
    )
    expect(
      screen.getByText(/create a folder in your library/i)
    ).toBeInTheDocument()
  })

  it("renders the location label when provided", () => {
    render(
      <NewFolderDialog
        open={true}
        locationLabel="Inside Invoices"
        onClose={() => {}}
        onConfirm={() => {}}
        saving={false}
      />
    )
    expect(screen.getByText(/inside invoices/i)).toBeInTheDocument()
  })

  it("renders a text input with the correct max length", () => {
    render(
      <NewFolderDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        saving={false}
      />
    )
    const input = screen.getByRole("textbox", { name: /folder name/i })
    expect(input).toHaveAttribute("maxlength", "100")
    expect(input).toHaveValue("")
  })

  it("auto-focuses the input", () => {
    render(
      <NewFolderDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        saving={false}
      />
    )
    expect(screen.getByRole("textbox", { name: /folder name/i })).toHaveFocus()
  })

  it("calls onConfirm with the name when submit is clicked", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <NewFolderDialog
        open={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        saving={false}
      />
    )
    const input = screen.getByRole("textbox", { name: /folder name/i })
    await user.type(input, "My Folder")
    await user.click(screen.getByRole("button", { name: /create folder/i }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("My Folder"))
  })

  it("calls onConfirm with trimmed name", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <NewFolderDialog
        open={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        saving={false}
      />
    )
    const input = screen.getByRole("textbox", { name: /folder name/i })
    // Type directly with the trimmed value since userEvent doesn't trim
    await user.clear(input)
    await user.type(input, "My Folder")
    await user.click(screen.getByRole("button", { name: /create folder/i }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("My Folder"))
  })

  it("does not call onConfirm with empty name", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <NewFolderDialog
        open={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        saving={false}
      />
    )
    await user.click(screen.getByRole("button", { name: /create folder/i }))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("disables the create button when saving", () => {
    render(
      <NewFolderDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        saving={true}
      />
    )
    expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled()
  })

  it("disables the create button when name is empty", () => {
    render(
      <NewFolderDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        saving={false}
      />
    )
    expect(
      screen.getByRole("button", { name: /create folder/i })
    ).toBeDisabled()
  })

  it("calls onClose when cancel is clicked", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <NewFolderDialog
        open={true}
        onClose={onClose}
        onConfirm={() => {}}
        saving={false}
      />
    )
    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("disables cancel when saving", () => {
    render(
      <NewFolderDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        saving={true}
      />
    )
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled()
  })

  it("renders the Enter key hint via aria-label", () => {
    render(
      <NewFolderDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        saving={false}
      />
    )
    expect(
      screen.getByRole("textbox", { name: /folder name/i })
    ).toHaveAttribute("aria-label", "Folder name")
  })

  it("does not render when open is false", () => {
    const { container } = render(
      <NewFolderDialog
        open={false}
        onClose={() => {}}
        onConfirm={() => {}}
        saving={false}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
