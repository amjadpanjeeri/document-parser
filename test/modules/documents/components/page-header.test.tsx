import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { PageHeader } from "@/modules/documents/components/page-header"

describe("PageHeader", () => {
  it("renders the total count", () => {
    render(
      <PageHeader totalCount={5} viewMode="grid" onViewModeChange={() => {}} />
    )
    expect(screen.getByText("5 items")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /documents/i })
    ).toBeInTheDocument()
  })

  it("renders singular for one item", () => {
    render(
      <PageHeader totalCount={1} viewMode="grid" onViewModeChange={() => {}} />
    )
    expect(screen.getByText("1 item")).toBeInTheDocument()
  })

  it("renders the grid view toggle active when viewMode is grid", () => {
    render(
      <PageHeader totalCount={0} viewMode="grid" onViewModeChange={() => {}} />
    )
    const gridButton = screen.getByRole("button", { name: "grid" })
    expect(gridButton).toBeTruthy()
    expect(gridButton).toHaveAttribute("aria-pressed", "true")
  })

  it("renders the list view toggle active when viewMode is list", () => {
    render(
      <PageHeader totalCount={0} viewMode="list" onViewModeChange={() => {}} />
    )
    const listButton = screen.getByRole("button", { name: "list" })
    expect(listButton).toBeTruthy()
    expect(listButton).toHaveAttribute("aria-pressed", "true")
  })

  it("calls onViewModeChange when grid button is clicked", async () => {
    const user = userEvent.setup()
    const onViewModeChange = vi.fn()
    render(
      <PageHeader
        totalCount={5}
        viewMode="list"
        onViewModeChange={onViewModeChange}
      />
    )
    const gridButton = screen.getByRole("button", { name: "grid" })
    await user.click(gridButton)
    expect(onViewModeChange).toHaveBeenCalledWith("grid")
  })

  it("calls onViewModeChange when list button is clicked", async () => {
    const user = userEvent.setup()
    const onViewModeChange = vi.fn()
    render(
      <PageHeader
        totalCount={5}
        viewMode="grid"
        onViewModeChange={onViewModeChange}
      />
    )
    const listButton = screen.getByRole("button", { name: "list" })
    await user.click(listButton)
    expect(onViewModeChange).toHaveBeenCalledWith("list")
  })

  it("renders the sort dropdown", () => {
    render(
      <PageHeader totalCount={5} viewMode="grid" onViewModeChange={() => {}} />
    )
    expect(screen.getByRole("button", { name: /newest/i })).toBeInTheDocument()
  })

  it("calls onSortChange when sort option is selected", async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    render(
      <PageHeader
        totalCount={5}
        viewMode="grid"
        sort="date-desc"
        onViewModeChange={() => {}}
        onSortChange={onSortChange}
      />
    )
    await user.click(screen.getByRole("button", { name: /Newest/i }))
    const nameAscItem = await screen.findByRole("menuitem", {
      name: /Name \(A-Z\)/i,
    })
    await user.click(nameAscItem)
    expect(onSortChange).toHaveBeenCalledWith("name-asc")
  })

  it("renders the type filter dropdown", () => {
    render(
      <PageHeader totalCount={5} viewMode="grid" onViewModeChange={() => {}} />
    )
    expect(screen.getByRole("button", { name: /type/i })).toBeInTheDocument()
  })

  it("renders all type filter options", async () => {
    const user = userEvent.setup()
    render(
      <PageHeader totalCount={5} viewMode="grid" onViewModeChange={() => {}} />
    )
    await user.click(screen.getByRole("button", { name: /type/i }))
    expect(
      screen.getByRole("menuitem", { name: /all types/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("menuitem", { name: /invoices/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("menuitem", { name: /contracts/i })
    ).toBeInTheDocument()
  })

  it("renders the status filter dropdown", () => {
    render(
      <PageHeader totalCount={5} viewMode="grid" onViewModeChange={() => {}} />
    )
    expect(screen.getByRole("button", { name: /status/i })).toBeInTheDocument()
  })

  it("calls onFilterChange when filter option is selected", async () => {
    const user = userEvent.setup()
    const onFilterChange = vi.fn()
    render(
      <PageHeader
        totalCount={5}
        viewMode="grid"
        filter="all"
        onViewModeChange={() => {}}
        onSortChange={() => {}}
        onFilterChange={onFilterChange}
      />
    )
    await user.click(screen.getByRole("button", { name: /type/i }))
    const invoicesItem = await screen.findByRole("menuitem", {
      name: /invoices/i,
    })
    await user.click(invoicesItem)
    expect(onFilterChange).toHaveBeenCalledWith("Invoice")
  })

  it("renders the new folder button when onCreateFolder is provided", () => {
    render(
      <PageHeader
        totalCount={5}
        viewMode="grid"
        onViewModeChange={() => {}}
        onCreateFolder={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: /new folder/i })
    ).toBeInTheDocument()
  })

  it("does not render new folder button when onCreateFolder is not provided", () => {
    render(
      <PageHeader totalCount={5} viewMode="grid" onViewModeChange={() => {}} />
    )
    expect(
      screen.queryByRole("button", { name: /new folder/i })
    ).not.toBeInTheDocument()
  })

  it("renders the grid/list toggle buttons", () => {
    render(
      <PageHeader totalCount={5} viewMode="grid" onViewModeChange={() => {}} />
    )
    expect(screen.getByRole("button", { name: "grid" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "list" })).toBeInTheDocument()
  })
})
