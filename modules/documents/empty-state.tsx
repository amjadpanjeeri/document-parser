import { FileText, FileUp, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Upload Zone */}
      <div className="flex w-full max-w-lg flex-col items-center rounded-2xl border-2 border-dashed border-border p-12 transition-colors hover:border-primary/40 hover:bg-muted/30">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <FileUp className="size-8 text-primary" />
        </div>

        <h3 className="mb-1 font-semibold text-lg">
          Upload your first document
        </h3>
        <p className="mb-6 max-w-sm text-center text-muted-foreground text-sm">
          Supports PDF, PNG, JPG, and scanned documents
        </p>

        <Button size="lg" className="gap-2">
          <FileText className="size-4" />
          Upload Document
        </Button>
      </div>

      {/* Hint */}
      <div className="mt-6 flex items-center gap-1.5 text-muted-foreground text-sm">
        <Sparkles className="size-3.5" />
        We&apos;ll extract structured data automatically
      </div>
    </div>
  )
}

export { EmptyState }
