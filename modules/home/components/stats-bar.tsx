import { Layers, Target, Timer } from "lucide-react"

const stats = [
  {
    icon: Target,
    value: "99.2%",
    label: "Accuracy",
    description: "Field-level extraction precision",
  },
  {
    icon: Timer,
    value: "<3s",
    label: "Speed",
    description: "Average processing time per doc",
  },
  {
    icon: Layers,
    value: "50+",
    label: "Fields",
    description: "Data points extracted per document",
  },
]

function StatsBar() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        By the numbers
      </p>
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="group flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/10">
              <Icon className="size-4 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div>
              <p className="font-medium text-sm">
                {stat.value} {stat.label}
              </p>
              <p className="text-muted-foreground text-xs">
                {stat.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { StatsBar }
