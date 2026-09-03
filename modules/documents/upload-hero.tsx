import { ShieldCheck } from "lucide-react"

import { StatsBar } from "./stats-bar"
import { StepsDiagram } from "./steps-diagram"
import { UploadZone } from "./upload-zone"

function UploadHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-background to-muted/30 px-6 py-8 md:px-10 md:py-10">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute -top-24 left-1/4 size-64 rounded-full bg-primary/[0.07] blur-[80px]" />
        <div className="absolute top-1/3 -right-16 size-80 rounded-full bg-violet-500/[0.05] blur-[80px]" />
        <div className="absolute -bottom-20 left-1/3 size-72 rounded-full bg-emerald-500/[0.04] blur-[80px]" />

        {/* Floating shapes */}
        <div className="absolute top-12 left-8 size-2 rotate-45 rounded-sm bg-primary/20" />
        <div className="absolute top-24 right-12 size-1.5 rotate-12 rounded-full bg-primary/30" />
        <div className="absolute bottom-16 left-16 size-1.5 rounded-full bg-violet-500/30" />
        <div className="absolute bottom-24 right-24 size-2 rotate-45 rounded-sm bg-emerald-500/20" />
      </div>

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
      <div className="relative mb-8 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr]">
        {/* Left: Steps — right aligned */}
        <div className="sm:pr-8 sm:text-right">
          <StepsDiagram />
        </div>

        {/* Center line */}
        <div className="hidden sm:block">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-border to-transparent" />
        </div>

        {/* Right: Stats — left aligned */}
        <div className="sm:pl-8">
          <StatsBar />
        </div>
      </div>

      {/* Upload full width */}
      <UploadZone />
    </div>
  )
}

export { UploadHero }
