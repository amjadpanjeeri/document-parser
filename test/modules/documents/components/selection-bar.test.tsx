import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { SelectionBar } from "@/modules/documents/components/selection-bar"

describe("SelectionBar", () => {
  it("renders the selected count", () => {
    render(
      <SelectionBar
        selectedCount={3}
        totalCount={10}
        onToggleSelectAll={() => {}}
        onClear={() => {}}
        onDelete={() => {}}
      />
    )
    expect(screen.getByText("3 selected")).toBeInTheDocument()
  })

  it("renders the total count in the select all button text", () => {
    render(
      <SelectionBar
        selectedCount={3}
        totalCount={10}
        onToggleSelectAll={() => {}}
        onClear={() => {}}
        onDelete={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /select all/i })
    ).toBeInTheDocument()
  })

  it("renders deselect all when all are selected", () => {
    render(
      <SelectionBar
        selectedCount={10}
        totalCount={10}
        onToggleSelectAll={() => {}}
        onClear={() => {}}
        onDelete={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /deselect all/i })
    ).toBeInTheDocument()
  })

  it("renders the clear button", () => {
    render(
      <SelectionBar
        selectedCount={3}
        totalCount={10}
        onToggleSelectAll={() => {}}
        onClear={() => {}}
        onDelete={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument()
  })

  it("renders the delete button", () => {
    render(
      <SelectionBar
        selectedCount={3}
        totalCount={10}
        onToggleSelectAll={() => {}}
        onClear={() => {}}
        onDelete={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /delete selected/i })
    ).toBeInTheDocument()
  })

  it("calls onToggleSelectAll when select all is clicked", async () => {
    const user = userEvent.setup()
    const onToggleSelectAll = vi.fn()
    render(
      <SelectionBar
        selectedCount={3}
        totalCount={10}
        onToggleSelectAll={onToggleSelectAll}
        onClear={() => {}}
        onDelete={() => {}}
      />
    )
    await user.click(screen.getByRole("button", { name: /select all/i }))
    expect(onToggleSelectAll).toHaveBeenCalledTimes(1)
  })

  it("calls onClear when clear is clicked", async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(
      <SelectionBar
        selectedCount={3}
        totalCount={10}
        onToggleSelectAll={() => {}}
        onClear={onClear}
        onDelete={() => {}}
      />
    )
    await user.click(screen.getByRole("button", { name: /clear/i }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it("calls onDelete when delete is clicked", async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <SelectionBar
        selectedCount={3}
        totalCount={10}
        onToggleSelectAll={() => {}}
        onClear={() => {}}
        onDelete={onDelete}
      />
    )
    await user.click(screen.getByRole("button", { name: /delete selected/i }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it("renders the move button when onMove is provided", () => {
    render(
      <SelectionBar
        selectedCount={3}
        totalCount={10}
        onToggleSelectAll={() => {}}
        onClear={() => {}}
        onMove={() => {}}
        onDelete={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /move to folder/i })
    ).toBeInTheDocument()
  })

  it("does not render the move button when onMove is not provided", () => {
    render(
      <SelectionBar
        selectedCount={3}
        totalCount={10}
        onToggleSelectAll={() => {}}
        onClear={() => {}}
        onDelete={() => {}}
      />
    )
    expect(
      screen.queryByRole("button", { name: /move to folder/i })
    ).not.toBeInTheDocument()
  })

  it("applies the selection bar styling", () => {
    const { container } = render(
      <SelectionBar
        selectedCount={3}
        totalCount={10}
        onToggleSelectAll={() => {}}
        onClear={() => {}}
        onDelete={() => {}}
      />
    )
    expect(container.firstChild).toHaveClass("border-primary/30")
    expect(container.firstChild).toHaveClass("bg-primary/5")
  })
})
