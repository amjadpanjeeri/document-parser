import { render, screen } from "@testing-library/react"

import { ConfidenceBar } from "@/modules/documents/components/confidence-bar"

describe("ConfidenceBar", () => {
  it("renders the percentage label", () => {
    render(<ConfidenceBar value={90} />)
    expect(screen.getByText("90%")).toBeInTheDocument()
  })

  it("renders at 0", () => {
    render(<ConfidenceBar value={0} />)
    expect(screen.getByText("0%")).toBeInTheDocument()
  })

  it("renders at 100", () => {
    render(<ConfidenceBar value={100} />)
    expect(screen.getByText("100%")).toBeInTheDocument()
  })

  it("renders a bar element with width style", () => {
    const { container } = render(<ConfidenceBar value={75} />)
    const bar = container.querySelector("div[style]")
    expect(bar).toBeInTheDocument()
    expect(bar?.getAttribute("style") ?? "").toContain("width: 75%")
  })

  it("renders the track element", () => {
    const { container } = render(<ConfidenceBar value={50} />)
    const track = container.querySelector(".overflow-hidden")
    expect(track).toBeInTheDocument()
  })
})
