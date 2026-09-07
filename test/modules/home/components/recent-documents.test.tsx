import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { DocStructDocument } from "@/lib/types"
import { RecentDocuments } from "@/modules/home/components/recent-documents"

function doc(
  id: string,
  name: string,
  type: DocStructDocument["type"],
  status: DocStructDocument["status"],
  uploadedAt: string,
  confidence?: number
): DocStructDocument {
  return { id, name, type, status, uploadedAt, confidence }
}

describe("RecentDocuments", () => {
  it("returns null when no documents and not loading", () => {
    const { container } = render(
      <RecentDocuments documents={[]} loading={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders a loading skeleton when loading and empty", () => {
    render(<RecentDocuments documents={[]} loading={true} />)
    expect(screen.getByText("Loading recent documents...")).toBeInTheDocument()
  })

  it("renders the section heading", () => {
    render(
      <RecentDocuments
        documents={[doc("1", "Invoice", "Invoice", "ready", "2026-01-01")]}
        loading={false}
      />
    )
    expect(screen.getByText("Recent documents")).toBeInTheDocument()
    expect(
      screen.getByText("Your latest uploads, ready to view and edit.")
    ).toBeInTheDocument()
  })

  it("renders each document card with name and type", () => {
    const docs = [
      doc("1", "Invoice ABC", "Invoice", "ready", "2026-01-01", 95),
      doc("2", "Contract XYZ", "Contract", "needs_review", "2026-02-01", 88),
    ]
    render(<RecentDocuments documents={docs} loading={false} />)
    expect(screen.getByText("Invoice ABC")).toBeInTheDocument()
    expect(screen.getByText("Contract XYZ")).toBeInTheDocument()
    // Type is displayed inside a span with · prefix; check the full text
    expect(screen.getByText(/Invoice · 95%/)).toBeInTheDocument()
    expect(screen.getByText(/Contract · 88%/)).toBeInTheDocument()
  })

  it("displays confidence percentage when present", () => {
    render(
      <RecentDocuments
        documents={[doc("1", "Inv", "Invoice", "ready", "2026-01-01", 99)]}
        loading={false}
      />
    )
    expect(screen.getByText(/99%/)).toBeInTheDocument()
  })

  it("does not display confidence when undefined", () => {
    render(
      <RecentDocuments
        documents={[doc("1", "Inv", "Invoice", "ready", "2026-01-01")]}
        loading={false}
      />
    )
    expect(screen.queryByText(/·/)).not.toBeInTheDocument()
  })

  it("renders the 'See all documents' button when onViewAll is provided", () => {
    render(
      <RecentDocuments
        documents={[doc("1", "Inv", "Invoice", "ready", "2026-01-01")]}
        loading={false}
        onViewAll={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /see all documents/i })
    ).toBeInTheDocument()
  })

  it("does not render the view-all button when onViewAll is not provided", () => {
    render(
      <RecentDocuments
        documents={[doc("1", "Inv", "Invoice", "ready", "2026-01-01")]}
        loading={false}
      />
    )
    expect(
      screen.queryByRole("button", { name: /see all documents/i })
    ).not.toBeInTheDocument()
  })

  it("calls onOpen when a document card is clicked", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const docItem = doc("1", "MyInvoice", "Invoice", "ready", "2026-01-01")
    render(
      <RecentDocuments documents={[docItem]} loading={false} onOpen={onOpen} />
    )
    // Click on the card button (the name is in a <p> inside a <button>)
    const card = screen.getByText("MyInvoice").closest("button")
    await user.click(card!)
    expect(onOpen).toHaveBeenCalledWith(docItem)
  })

  it("renders document cards with hover styles when onOpen is provided", () => {
    render(
      <RecentDocuments
        documents={[doc("1", "Inv", "Invoice", "ready", "2026-01-01")]}
        loading={false}
        onOpen={() => {}}
      />
    )
    const card = screen.getByText("Inv").closest("button")
    expect(card).toHaveClass("hover:border-primary/40")
  })

  it("renders loading skeleton when loading with no documents", () => {
    const { container } = render(
      <RecentDocuments documents={[]} loading={true} />
    )
    expect(
      within(container).getByText("Loading recent documents...")
    ).toBeInTheDocument()
  })
})
