import { render, screen } from "@testing-library/react"

import { StepsDiagram } from "@/modules/home/components/steps-diagram"

describe("StepsDiagram", () => {
  it("renders the section heading", () => {
    render(<StepsDiagram />)
    expect(screen.getByText("How it works")).toBeInTheDocument()
  })

  it("renders all three steps", () => {
    render(<StepsDiagram />)
    expect(screen.getByText("Upload")).toBeInTheDocument()
    expect(screen.getByText("Extract")).toBeInTheDocument()
    expect(screen.getByText("Use")).toBeInTheDocument()
  })

  it("renders each step description", () => {
    render(<StepsDiagram />)
    expect(
      screen.getByText("Drop any invoice, receipt, or contract")
    ).toBeInTheDocument()
    expect(
      screen.getByText("AI pulls every field automatically")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Search, filter, and export structured data")
    ).toBeInTheDocument()
  })

  it("renders exactly 3 steps", () => {
    render(<StepsDiagram />)
    const stepTitles = screen.getAllByText(/^(Upload|Extract|Use)$/)
    expect(stepTitles).toHaveLength(3)
  })
})
