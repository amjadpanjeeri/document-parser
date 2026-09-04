import { ShieldCheck } from "lucide-react"

import { StatsBar } from "./stats-bar"
import { StepsDiagram } from "./steps-diagram"
import { UploadZone } from "./upload-zone"

function UploadHero() {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-background to-muted/30 px-4 py-6 md:px-10 md:py-10">
      {/* Headline centered */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary text-xs font-medium">
          <ShieldCheck className="size-3" />
          SOC 2 compliant · Your data stays private
        </div>

        <h1 className="mb-3 font-semibold text-2xl tracking-tight sm:text-3xl md:text-4xl">
          Stop manually entering{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            invoice data
          </span>
        </h1>

        <p className="mx-auto max-w-lg text-muted-foreground text-sm leading-relaxed">
          Upload any document — DocStruct extracts every field into structured
          data you can query and export.
        </p>
      </div>

      {/* Steps | Stats with center line */}
      <div className="relative mb-6 grid grid-cols-1 gap-6 sm:mb-8 sm:grid-cols-[1fr_auto_1fr] sm:gap-0">
        {/* Left: Steps — right aligned */}
        <div className="flex flex-col items-center sm:items-end sm:pr-8 sm:text-right">
          <StepsDiagram />
        </div>

        {/* Center line */}
        <div className="hidden sm:block">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-border to-transparent" />
        </div>

        {/* Right: Stats — left aligned */}
        <div className="flex flex-col items-center sm:items-start sm:pl-8">
          <StatsBar />
        </div>
      </div>

      {/* Upload full width */}
      <UploadZone />
    </div>
  )
}

export { UploadHero }
