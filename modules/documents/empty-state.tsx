import { FileUp } from "lucide-react"

import { UploadZone } from "./upload-zone"

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-8 py-8 md:py-12">
      {/* Heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <FileUp className="size-7 text-primary" />
        </div>
        <h3 className="font-semibold text-xl">No documents yet</h3>
        <p className="max-w-sm text-muted-foreground text-sm">
          Upload a PDF, PNG, or JPG — DocStruct extracts every field and turns
          messy documents into structured, queryable data.
        </p>
      </div>

      {/* Real, functional uploader */}
      <div className="w-full max-w-2xl">
        <UploadZone />
      </div>
    </div>
  )
}

export { EmptyState }
