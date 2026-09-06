import type { DocStructDocument } from "@/lib/types"

function matchesDocumentType(documentType: string, selectedType: string) {
  if (selectedType === "all") return true

  const normalizedDocumentType = documentType.trim().toLowerCase()
  const normalizedSelectedType = selectedType.trim().toLowerCase()

  return (
    normalizedDocumentType === normalizedSelectedType ||
    normalizedDocumentType.startsWith(`${normalizedSelectedType} `)
  )
}

function getFilteredDocuments(
  documents: DocStructDocument[],
  query: string,
  aiResultIds: string[] | null,
  filter: string,
  sort: string
) {
  const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const keywordDocuments = searchTerms.length
    ? documents.filter((document) =>
        searchTerms.every((term) =>
          document.searchText?.toLowerCase().includes(term)
        )
      )
    : documents

  const searchedDocuments = aiResultIds
    ? documents.filter((document) => aiResultIds.includes(document.id))
    : keywordDocuments

  return searchedDocuments
    .filter((document) => matchesDocumentType(document.type, filter))
    .toSorted((first, second) => {
      if (sort === "name-asc") return first.name.localeCompare(second.name)
      if (sort === "name-desc") return second.name.localeCompare(first.name)
      if (sort === "status") return first.status.localeCompare(second.status)

      const firstDate = Date.parse(first.uploadedAt)
      const secondDate = Date.parse(second.uploadedAt)
      return sort === "date-asc"
        ? firstDate - secondDate
        : secondDate - firstDate
    })
}

export { getFilteredDocuments, matchesDocumentType }
