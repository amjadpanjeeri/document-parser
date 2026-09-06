import { cn } from "@/lib/utils"

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 95 ? "bg-green-500" : value >= 85 ? "bg-amber-500" : "bg-red-500"

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span
        className={cn(
          "text-[10px] font-medium tabular-nums",
          value >= 95
            ? "text-green-600 dark:text-green-400"
            : value >= 85
              ? "text-amber-600 dark:text-amber-400"
              : "text-red-600 dark:text-red-400"
        )}
      >
        {value}%
      </span>
    </div>
  )
}

export { ConfidenceBar }
