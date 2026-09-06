import { FileUp, ScanLine, Sparkles } from "lucide-react"

const steps = [
  {
    icon: FileUp,
    title: "Upload",
    description: "Drop any invoice, receipt, or contract",
  },
  {
    icon: ScanLine,
    title: "Extract",
    description: "AI pulls every field automatically",
  },
  {
    icon: Sparkles,
    title: "Use",
    description: "Search, filter, and export structured data",
  },
]

function StepsDiagram() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        How it works
      </p>
      {steps.map((step) => {
        const Icon = step.icon
        return (
          <div
            key={step.title}
            className="group flex items-center gap-3 sm:flex-row-reverse"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/10">
              <Icon className="size-4 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="sm:text-right">
              <p className="font-medium text-sm">{step.title}</p>
              <p className="text-muted-foreground text-xs">
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { StepsDiagram }
