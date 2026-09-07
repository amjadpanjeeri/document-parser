import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { DeleteDialog } from "@/modules/documents/components/delete-dialog"

describe("DeleteDialog", () => {
  it("renders the title for a single document", () => {
    render(
      <DeleteDialog
        open={true}
        documentNames={["invoice.pdf"]}
        deleting={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("heading", { name: /delete this document\?/i })
    ).toBeInTheDocument()
  })

  it("renders the title for multiple documents", () => {
    render(
      <DeleteDialog
        open={true}
        documentNames={["a.pdf", "b.pdf", "c.pdf"]}
        deleting={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("heading", { name: /delete 3 documents\?/i })
    ).toBeInTheDocument()
  })

  it("renders the document name in the description for a single doc", () => {
    render(
      <DeleteDialog
        open={true}
        documentNames={["invoice.pdf"]}
        deleting={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    // Radix DialogDescription renders content within a <p> — query by text
    expect(screen.getByText("invoice.pdf")).toBeInTheDocument()
    expect(
      screen.getByText(/permanently removed from your library/i)
    ).toBeInTheDocument()
  })

  it("renders 'and N more' for multiple documents", () => {
    render(
      <DeleteDialog
        open={true}
        documentNames={["a.pdf", "b.pdf", "c.pdf", "d.pdf"]}
        deleting={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByText(/a\.pdf, b\.pdf and 2 more will be permanently removed/i)
    ).toBeInTheDocument()
  })

  it("renders just two names without 'and more'", () => {
    render(
      <DeleteDialog
        open={true}
        documentNames={["a.pdf", "b.pdf"]}
        deleting={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByText(/a\.pdf, b\.pdf will be permanently removed/i)
    ).toBeInTheDocument()
  })

  it("renders cancel and delete buttons", () => {
    render(
      <DeleteDialog
        open={true}
        documentNames={["a.pdf"]}
        deleting={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument()
  })

  it("disables both buttons when deleting", () => {
    render(
      <DeleteDialog
        open={true}
        documentNames={["a.pdf"]}
        deleting={true}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled()
  })

  it("shows 'Deleting...' when deleting", () => {
    render(
      <DeleteDialog
        open={true}
        documentNames={["a.pdf"]}
        deleting={true}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /deleting/i })
    ).toBeInTheDocument()
  })

  it("calls onConfirm when delete button is clicked", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <DeleteDialog
        open={true}
        documentNames={["a.pdf"]}
        deleting={false}
        onClose={() => {}}
        onConfirm={onConfirm}
      />
    )
    await user.click(screen.getByRole("button", { name: /delete/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <DeleteDialog
        open={true}
        documentNames={["a.pdf"]}
        deleting={false}
        onClose={onClose}
        onConfirm={() => {}}
      />
    )
    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("renders the warning icon", () => {
    render(
      <DeleteDialog
        open={true}
        documentNames={["a.pdf"]}
        deleting={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    // The Trash2 icon is an SVG inside the dialog header (icon-only button)
    const header = screen.getByRole("heading", {
      name: /delete this document\?/i,
    })
    const svg = header.closest("div")!
    expect(svg.querySelector("svg")).toBeInTheDocument()
  })

  it("does not render when open is false", () => {
    const { container } = render(
      <DeleteDialog
        open={false}
        documentNames={["a.pdf"]}
        deleting={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
