import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { SelectToggle } from "@/modules/documents/components/select-toggle"

describe("SelectToggle", () => {
  it("renders with the label as aria-label", () => {
    render(
      <SelectToggle checked={false} onToggle={() => {}} label="Select doc" />
    )
    expect(
      screen.getByRole("checkbox", { name: /select doc/i })
    ).toBeInTheDocument()
  })

  it("is unchecked by default", () => {
    render(<SelectToggle checked={false} onToggle={() => {}} label="Select" />)
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "false"
    )
  })

  it("is checked when passed checked=true", () => {
    render(<SelectToggle checked={true} onToggle={() => {}} label="Select" />)
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true")
  })

  it("calls onToggle when clicked", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<SelectToggle checked={false} onToggle={onToggle} label="Select" />)
    await user.click(screen.getByRole("checkbox"))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it("calls onToggle with stopPropagation on nested click", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const stopPropagation = vi.fn()
    render(
      <fieldset
        onClick={stopPropagation}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
      >
        <SelectToggle checked={false} onToggle={onToggle} label="Select" />
      </fieldset>
    )
    await user.click(screen.getByRole("checkbox"))
    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(stopPropagation).not.toHaveBeenCalled()
  })

  it("applies the optional className", () => {
    const { container } = render(
      <SelectToggle
        checked={false}
        onToggle={() => {}}
        label="Select"
        className="custom-class"
      />
    )
    expect(container.firstChild).toHaveClass("custom-class")
  })

  it("renders the check icon", () => {
    render(<SelectToggle checked={false} onToggle={() => {}} label="Select" />)
    expect(screen.getByRole("checkbox")).toBeInTheDocument()
  })
})
