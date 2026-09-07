import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { DocStructDocument } from "@/lib/types"
import { DocumentCardGrid } from "@/modules/documents/components/document-card-grid"

function doc(
  id: string,
  name: string,
  type: DocStructDocument["type"],
  status: DocStructDocument["status"],
  uploadedAt: string,
  confidence?: number,
  thumbnailUrl?: string | null
): DocStructDocument {
  return {
    id,
    name,
    type,
    status,
    uploadedAt,
    confidence,
    thumbnailUrl: thumbnailUrl ?? undefined,
  }
}

describe("DocumentCardGrid", () => {
  const baseDoc = doc(
    "1",
    "Invoice ABC",
    "Invoice",
    "ready",
    "2026-03-15T00:00:00Z",
    95
  )

  it("renders the document name", () => {
    render(
      <DocumentCardGrid
        document={baseDoc}
        selected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByText("Invoice ABC")).toBeInTheDocument()
  })

  it("renders the document type badge", () => {
    render(
      <DocumentCardGrid
        document={baseDoc}
        selected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByText("Invoice")).toBeInTheDocument()
  })

  it("renders the formatted date", () => {
    render(
      <DocumentCardGrid
        document={baseDoc}
        selected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByText("Mar 15, 2026")).toBeInTheDocument()
  })

  it("renders the confidence percentage when present", () => {
    render(
      <DocumentCardGrid
        document={baseDoc}
        selected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByText("95%")).toBeInTheDocument()
  })

  it("does not render confidence when undefined", () => {
    const docNoConf = doc("1", "Inv", "Invoice", "ready", "2026-01-01")
    const { container } = render(
      <DocumentCardGrid
        document={docNoConf}
        selected={false}
        onClick={() => {}}
      />
    )
    const text = container.textContent ?? ""
    // The date should be rendered but without a percentage sign
    expect(text).toContain("Jan 1, 2026")
    // No "%" should appear in the text since confidence is undefined
    const withoutDate = text.replace(/Jan 1, 2026/g, "")
    expect(withoutDate).not.toContain("%")
  })

  it("renders the needs review badge when status is needs_review", () => {
    const needsReview = doc(
      "1",
      "Inv",
      "Invoice",
      "needs_review",
      "2026-01-01",
      80
    )
    render(
      <DocumentCardGrid
        document={needsReview}
        selected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByText("Needs review")).toBeInTheDocument()
  })

  it("does not render needs review badge when status is ready", () => {
    render(
      <DocumentCardGrid
        document={baseDoc}
        selected={false}
        onClick={() => {}}
      />
    )
    expect(screen.queryByText("Needs review")).not.toBeInTheDocument()
  })

  it("renders a thumbnail image when thumbnailUrl is provided", () => {
    const docWithThumb = doc(
      "1",
      "Inv",
      "Invoice",
      "ready",
      "2026-01-01",
      95,
      "data:image/png;base64,x"
    )
    render(
      <DocumentCardGrid
        document={docWithThumb}
        selected={false}
        onClick={() => {}}
      />
    )
    expect(screen.getByAltText("Inv")).toBeInTheDocument()
  })

  it("renders the more actions dropdown when actions are provided", () => {
    render(
      <DocumentCardGrid
        document={baseDoc}
        selected={false}
        onClick={() => {}}
        onDelete={() => {}}
        onRename={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /more actions for invoice abc/i })
    ).toBeInTheDocument()
  })

  it("renders the select toggle when onToggleSelect is provided", () => {
    render(
      <DocumentCardGrid
        document={baseDoc}
        selected={true}
        onClick={() => {}}
        onToggleSelect={() => {}}
      />
    )
    expect(
      screen.getByRole("checkbox", { name: /select invoice abc/i })
    ).toHaveAttribute("aria-checked", "true")
  })

  it("does not render the select toggle when onToggleSelect is not provided", () => {
    render(
      <DocumentCardGrid
        document={baseDoc}
        selected={false}
        onClick={() => {}}
      />
    )
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
  })

  it("calls onClick when the card button is clicked", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <DocumentCardGrid document={baseDoc} selected={false} onClick={onClick} />
    )
    const card = screen.getByText("Invoice ABC").closest("button")
    if (card) await user.click(card)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("calls onToggleSelect when the select toggle is clicked", async () => {
    const user = userEvent.setup()
    const onToggleSelect = vi.fn()
    render(
      <DocumentCardGrid
        document={baseDoc}
        selected={true}
        onClick={() => {}}
        onToggleSelect={onToggleSelect}
      />
    )
    const checkbox = screen.getByRole("checkbox", {
      name: /select invoice abc/i,
    })
    await user.click(checkbox)
    expect(onToggleSelect).toHaveBeenCalledTimes(1)
  })

  it("calls onDelete when delete is clicked in dropdown", async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <DocumentCardGrid
        document={baseDoc}
        selected={false}
        onClick={() => {}}
        onDelete={onDelete}
      />
    )
    // Click the more actions button to open the dropdown
    const moreBtn = screen.getByRole("button", {
      name: /more actions for invoice abc/i,
    })
    await user.click(moreBtn)
    // Find and click the delete menu item
    const deleteItem = await screen.findByRole("menuitem", { name: /delete/i })
    await user.click(deleteItem)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it("calls onRename when rename is clicked in dropdown", async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    render(
      <DocumentCardGrid
        document={baseDoc}
        selected={false}
        onClick={() => {}}
        onRename={onRename}
      />
    )
    const moreBtn = screen.getByRole("button", {
      name: /more actions for invoice abc/i,
    })
    await user.click(moreBtn)
    const renameItem = await screen.findByRole("menuitem", {
      name: /edit name/i,
    })
    await user.click(renameItem)
    expect(onRename).toHaveBeenCalledTimes(1)
  })
})
