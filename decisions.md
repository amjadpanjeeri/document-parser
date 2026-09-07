# Decisions

This document captures the meaningful decisions made while building DocStruct — a tool that turns messy documents (especially invoices & receipts) into clean, structured, and queryable data.

The goal was not to build everything possible in 5 days, but to make strong judgment calls under time pressure and ship something coherent, usable, and trustworthy.

---

## 1. Framework & Core Stack

### Decision
Use **Next.js (App Router) + TypeScript + shadcn/ui + Zustand + react-hook-form + Zod**.

### Alternatives Considered
- Pages Router
- Plain React + Vite
- Redux / React Context for state
- Custom form handling without a library

### Reasoning
- App Router gives clean server/client boundaries and simple API routes, which mattered for the extraction endpoint.
- shadcn/ui provided high-quality, accessible components quickly without locking us into a heavy design system.
- Zustand was chosen over Redux (too much boilerplate for this scope) and Context (painful for frequent updates across upload state, documents, filters, and folders).
- react-hook-form + Zod gave type-safe, performant form handling for editing extracted fields — critical for the human-in-the-loop experience.

### Trade-offs Accepted
- Slightly more setup than a pure client-side Vite app.
- We accepted the learning curve of App Router patterns in exchange for better structure.

---

## 2. Product Scope & Target User

### Decision
Focus primarily on **Finance / Accounts Payable teams** dealing with invoices and receipts.

### Alternatives Considered
- Generic “any document” tool
- Resume parsing
- Contract analysis

### Reasoning
Invoices have clear, high-value fields (vendor, amount, date, invoice number, line items). The pain of manual data entry is concrete and easy to demonstrate. This focus helped avoid spreading effort too thin.

### What We Deliberately Cut
- Full multi-document-type intelligence on day one
- Advanced contract clause extraction
- Multi-tenancy and team workspaces

These are valuable but would have diluted depth on the core extraction + review + query loop.

---

## 3. Page Architecture

### Decision
Move from a tab-based single page (Upload | Documents) to a clearer structure:
- Main page with upload + recent documents + search
- Separate full documents/library view
- Ability to view all documents

### Alternatives Considered
- Pure single-page app with tabs only
- Heavy dashboard with many widgets

### Reasoning
Tabs hid the search/query experience. Putting search on the main page and showing the 3 most recent documents made the product feel immediately useful. “View all” keeps the main page calm while still giving full access.

### Trade-offs Accepted
- Slightly more routing complexity
- Accepted that the main page is not a full analytics dashboard

---

## 4. Human-in-the-Loop Extraction

### Decision
Allow users to add **short comments/context** before extraction runs, and make every extracted field editable afterward.

### Alternatives Considered
- Fully automatic extraction with no user input
- Only post-extraction editing

### Reasoning
Raw AI extraction is never perfect. Letting the user give light context (“this is a utility bill from March”, “ignore the handwritten notes”) significantly improves results. Combined with inline editing and confidence awareness, this creates trust instead of frustration.

### What We Deliberately Cut
- Complex annotation or bounding-box drawing tools (beyond basic support)
- Full review workflow with approvals and assignments

---

## 5. AI Extraction Strategy

### Decision
Use **Gemini** (with available Plus access) for extraction, with structured JSON output.

### Alternatives Considered
- Pure mock data only
- Groq / other free models as primary
- Building a full OCR pipeline first

### Reasoning
Gemini handles both text PDFs and images reasonably well and supports structured output. Real extraction was prioritized over perfect mocks once the UI was stable, because the core value proposition depends on it.

### Trade-offs Accepted
- Rate limits and occasional inconsistency of LLM output
- We still keep graceful failure states and the ability to retry

### How Extraction Failures Are Handled
- Document status moves to a failed/error state
- User can retry
- UI never assumes success
- Original file remains available

---

## 6. Data & Persistence

### Decision
Persist documents and extracted data in a database so users can return later and search across them.

### Alternatives Considered
- localStorage / in-memory only
- File-system only storage

### Reasoning
A tool that forgets everything on refresh fails the “queryable” part of the problem statement. Persistence was required for the product to feel real.

### Trade-offs Accepted
- Added backend complexity
- Skipped advanced features like full-text search indexes or vector search in the first version

---

## 7. Search / Query Experience

### Decision
Add **AI-powered search** with debouncing, placed on the main page, with suggested queries to teach the feature.

### Alternatives Considered
- Simple keyword filter only
- Keeping search buried inside the documents list page

### Reasoning
The problem statement explicitly asks for queryable data. Hiding search made the feature invisible. Moving it to the main page + showing suggestions helped users understand what was possible.

### Trade-offs Accepted
- Search is not yet a full analytical engine
- We prioritized discoverability and speed over advanced query syntax

---

## 8. Document Organization

### Decision
Introduce **folders** (including nesting) and the ability to move documents between folders. Also prevent exact duplicate uploads by reusing an existing copy.

### Alternatives Considered
- Flat list only
- Tags only
- Always allowing duplicate files

### Reasoning
Real users quickly accumulate documents. Folders give them control without requiring a complex tagging system. Avoiding duplicate uploads reduces clutter and confusion.

### Trade-offs Accepted
- Nested folders add UI and state complexity
- We did not build sharing or permissions inside folders

---

## 9. UX Polish Decisions

### Decision
- Allow renaming files
- Add theme switcher (light/dark)
- Support single and bulk delete
- Show recent documents on the main page

### Reasoning
These are small touches that make the product feel considered rather than like a raw demo. Theme switching and renaming are low-cost ways to add a sense of ownership and polish.

---

## 10. What We Deliberately Skipped (and Why)

| Feature | Why it was cut |
|---------|----------------|
| Authentication & multi-tenancy | Out of scope for the core extraction + query loop in the time available |
| Real-time collaboration | High complexity, low return for the primary use case |
| Advanced analytics / dashboards | Would shift focus away from the core job-to-be-done |
| Perfect visual bounding-box editor | Valuable, but secondary to reliable extraction + editing |
| Vector database | Query patterns were still primarily structured + keyword; avoided running two datastores |
| Complex role-based access | Not needed for the current single-user focused experience |

---

## 11. Overall Philosophy

Under time pressure we optimized for:

1. **Trust** — visible original document + editable structured data + user context
2. **Clarity** — simple information architecture and obvious next actions
3. **Usefulness** — persistence, search, folders, and the ability to return later
4. **Honesty** — graceful handling of AI failures instead of pretending the model is perfect

The result is a focused tool that accepts a document, extracts structured data (with optional user context), lets the user correct it, stores it, and makes it searchable — rather than a broad but shallow platform.