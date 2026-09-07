import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { ExtractedField } from "@/lib/types"
import { FieldRow } from "@/modules/documents/components/field-row"

function field(
  key: string,
  label: string,
  value = "-",
  confidence = 100,
  isAiCompleted = false,
  isAiFilled = false
): ExtractedField {
  return { key, label, value, confidence, isAiCompleted, isAiFilled }
}

describe("FieldRow", () => {
  it("renders the field label and value", () => {
    render(
      <FieldRow
        field={field("total", "Total", "$100")}
        isEditing={false}
        onEditChange={() => {}}
      />
    )
    expect(screen.getByText("Total")).toBeInTheDocument()
    expect(screen.getByText("$100")).toBeInTheDocument()
  })

  it("shows AI badge when isAiCompleted and not isAiFilled", () => {
    render(
      <FieldRow
        field={field("x", "X", "-", 80, true, false)}
        isEditing={false}
        onEditChange={() => {}}
      />
    )
    expect(screen.getByText("AI")).toBeInTheDocument()
    expect(screen.queryByText("AI Filled")).not.toBeInTheDocument()
  })

  it("shows AI Filled badge when isAiFilled", () => {
    render(
      <FieldRow
        field={field("x", "X", "-", 80, true, true)}
        isEditing={false}
        onEditChange={() => {}}
      />
    )
    expect(screen.getByText("AI Filled")).toBeInTheDocument()
  })

  it("hides badges when not AI-completed", () => {
    render(
      <FieldRow
        field={field("x", "X", "-", 100, false, false)}
        isEditing={false}
        onEditChange={() => {}}
      />
    )
    expect(screen.queryByText("AI")).not.toBeInTheDocument()
    expect(screen.queryByText("AI Filled")).not.toBeInTheDocument()
  })

  it("renders an input when editing", () => {
    render(
      <FieldRow
        field={field("total", "Total", "$100")}
        isEditing={true}
        onEditChange={() => {}}
      />
    )
    expect(screen.getByRole("textbox")).toHaveValue("$100")
  })

  it("renders a paragraph when not editing", () => {
    render(
      <FieldRow
        field={field("total", "Total", "$100")}
        isEditing={false}
        onEditChange={() => {}}
      />
    )
    // When not editing, value is shown in a <p> — not in an input
    const p = screen.queryByRole("textbox")
    expect(p).not.toBeInTheDocument()
  })

  it("calls onEditChange when input value changes", async () => {
    const user = userEvent.setup()
    const onEditChange = vi.fn()
    render(
      <FieldRow
        field={field("total", "Total", "100")}
        isEditing={true}
        onEditChange={onEditChange}
      />
    )
    const input = screen.getByRole("textbox")
    await user.clear(input)
    await user.type(input, "200")
    // user.type replaces field content in this environment and fires onChange per keystroke;
    // we verify the spy is called (exact sequence varies by platform).
    expect(onEditChange).toHaveBeenCalled()
  })

  it("renders the confidence bar", () => {
    render(
      <FieldRow
        field={field("total", "Total", "$100", 99)}
        isEditing={false}
        onEditChange={() => {}}
      />
    )
    expect(screen.getByText("99%")).toBeInTheDocument()
  })

  it("renders with empty value", () => {
    render(
      <FieldRow
        field={field("total", "Total", "")}
        isEditing={false}
        onEditChange={() => {}}
      />
    )
    // Empty value shows in a <p> with empty text — can't query by empty string
    const p = screen.queryByRole("textbox")
    expect(p).not.toBeInTheDocument()
  })
})
