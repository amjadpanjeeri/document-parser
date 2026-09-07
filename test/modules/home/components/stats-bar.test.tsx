import { render, screen } from "@testing-library/react"

import { StatsBar } from "@/modules/home/components/stats-bar"

describe("StatsBar", () => {
  it("renders all three stats", () => {
    render(<StatsBar />)
    expect(screen.getByText(/99.2% Accuracy/i)).toBeInTheDocument()
    expect(screen.getByText(/<3s Speed/i)).toBeInTheDocument()
    expect(screen.getByText(/50\+ Fields/i)).toBeInTheDocument()
  })

  it("renders the section heading", () => {
    render(<StatsBar />)
    expect(screen.getByText("By the numbers")).toBeInTheDocument()
  })

  it("renders each stat description", () => {
    render(<StatsBar />)
    expect(
      screen.getByText("Field-level extraction precision")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Average processing time per doc")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Data points extracted per document")
    ).toBeInTheDocument()
  })

  it("renders the accuracy value with label", () => {
    render(<StatsBar />)
    const accuracyEl = screen.getByText(/99.2% Accuracy/i)
    expect(accuracyEl).toBeInTheDocument()
  })
})
