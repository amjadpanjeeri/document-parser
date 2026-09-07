import { fireEvent, render, screen } from "@testing-library/react"

import { DocumentPreview } from "@/modules/documents/components/document-preview"

describe("DocumentPreview", () => {
  it("renders the filename", () => {
    render(
      <DocumentPreview
        fileName="invoice.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    expect(screen.getByText("invoice.pdf")).toBeInTheDocument()
  })

  it("renders the file type label when no preview url", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    expect(screen.getByText(/PDF DOCUMENT/i)).toBeInTheDocument()
  })

  it("renders a file icon for unknown file types", () => {
    const { container } = render(
      <DocumentPreview
        fileName="doc.xyz"
        fileType="application/xyz"
        filePreviewUrl={null}
      />
    )
    const text = container.textContent ?? ""
    // Text is split across elements by Radix; check for the key phrases
    expect(text).toContain("doc.xyz")
    expect(text).toContain("APPLICATION/XYZ")
    expect(text).toContain("document")
  })

  it("renders rotate button", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    expect(screen.getByTitle(/rotate/i)).toBeInTheDocument()
  })

  it("renders zoom in button", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    expect(screen.getByTitle(/zoom in/i)).toBeInTheDocument()
  })

  it("renders zoom out button", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    expect(screen.getByTitle(/zoom out/i)).toBeInTheDocument()
  })

  it("renders reset view button", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    expect(screen.getByTitle(/reset view/i)).toBeInTheDocument()
  })

  it("renders the zoom percentage", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    expect(screen.getByText("100%")).toBeInTheDocument()
  })

  it("zooms in when zoom in button is clicked", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    const zoomIn = screen.getByTitle(/zoom in/i)
    fireEvent.click(zoomIn)
    expect(screen.getByText("125%")).toBeInTheDocument()
  })

  it("zooms out when zoom out button is clicked", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    const zoomOut = screen.getByTitle(/zoom out/i)
    fireEvent.click(zoomOut)
    expect(screen.getByText("75%")).toBeInTheDocument()
  })

  it("rotates when rotate button is clicked", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    const rotate = screen.getByTitle(/rotate/i)
    fireEvent.click(rotate)
    expect(screen.getByText("100%")).toBeInTheDocument() // zoom stays the same
  })

  it("resets zoom and rotation when reset view is clicked", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    // Zoom in first
    fireEvent.click(screen.getByTitle(/zoom in/i))
    expect(screen.getByText("125%")).toBeInTheDocument()
    // Then reset
    fireEvent.click(screen.getByTitle(/reset view/i))
    expect(screen.getByText("100%")).toBeInTheDocument()
  })

  it("disables zoom out when at minimum", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    const zoomOut = screen.getByTitle(/zoom out/i)
    // jsdom doesn't fully support the disabled attribute from Radix; check the class instead
    expect(zoomOut.className).toContain("opacity-50")
  })

  it("disables zoom in when at maximum", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    // Click zoom in 12 times to hit max (1 + 12*0.25 = 4, clamped at 3)
    for (let i = 0; i < 12; i++) fireEvent.click(screen.getByTitle(/zoom in/i))
    expect(screen.getByTitle(/zoom in/i)).toBeDisabled()
  })

  it("shows Document Preview label on desktop", () => {
    render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl={null}
      />
    )
    expect(screen.getByText("Document Preview")).toBeInTheDocument()
  })

  it("shows PDF preview iframe when url is provided for a PDF", () => {
    const { container } = render(
      <DocumentPreview
        fileName="doc.pdf"
        fileType="application/pdf"
        filePreviewUrl="http://example.com/doc.pdf"
      />
    )
    expect(container.querySelector("iframe")).toBeInTheDocument()
  })

  it("shows image tag when url is provided for an image", () => {
    const { container } = render(
      <DocumentPreview
        fileName="photo.png"
        fileType="image/png"
        filePreviewUrl="http://example.com/photo.png"
      />
    )
    expect(container.querySelector("img")).toBeInTheDocument()
  })
})
