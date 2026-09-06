import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SelectToggleProps = {
  checked: boolean
  onToggle: () => void
  label: string
  className?: string
}

function SelectToggle({
  checked,
  onToggle,
  label,
  className,
}: SelectToggleProps) {
  return (
    <Button
      type="button"
      variant="outline"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      title={label}
      size="icon-xs"
      className={cn(
        "cursor-pointer rounded-md border p-0 backdrop-blur-sm",
        checked
          ? "border-primary bg-primary text-primary-foreground hover:border-primary hover:bg-primary/90 hover:text-primary-foreground"
          : "border-border bg-background/90 text-transparent hover:border-foreground/40 hover:text-foreground/50",
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      <Check className="size-3" />
    </Button>
  )
}

export { SelectToggle }
