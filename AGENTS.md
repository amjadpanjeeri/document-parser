# Agent Instructions

This file helps AI coding agents generate code that fits this project.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix Nova style)
- **Package Manager:** npm
- **Linting/Formatting:** Biome (replaces ESLint + Prettier)
- **Git Hooks:** Husky + lint-staged

## Project Structure

```
├── app/                  # Next.js App Router pages and layouts
│   ├── layout.tsx        # Root layout (fonts, ThemeProvider)
│   ├── page.tsx          # Home page (documents library)
│   └── globals.css       # Tailwind CSS + theme variables
├── components/
│   ├── ui/               # shadcn/ui components (reusable primitives)
│   └── theme-provider.tsx # next-themes wrapper
├── modules/              # Page-specific components (one folder per page)
│   └── documents/        # Documents Library page components
│       ├── navbar.tsx
│       ├── page-header.tsx
│       ├── document-card.tsx
│       ├── documents-view.tsx
│       └── empty-state.tsx
├── data/                 # Mock data, seed data, static datasets
│   └── documents.ts      # Mock documents for development
├── hooks/                # Custom React hooks
├── lib/
│   ├── utils.ts          # cn() utility (clsx + tailwind-merge)
│   └── types.ts          # Shared TypeScript types
├── public/               # Static assets
└── biome.json            # Linter + formatter config
```

## Data Folder

Mock data, seed data, and static datasets live in `data/`.

```typescript
// data/documents.ts
import type { DocStructDocument } from "@/lib/types"

export const mockDocuments: DocStructDocument[] = [...]
```

Import in pages or components:

```tsx
import { mockDocuments } from "@/data/documents"
```

## Modules Convention

Page-specific components live in `modules/<page-name>/`, not in `components/`.

- **`components/ui/`** — Shared, reusable primitives (shadcn/ui)
- **`components/`** — Shared layout components (theme-provider)
- **`modules/<page>/`** — All non-shadcn components for a specific page

When adding a new page:
1. Create `modules/<page-name>/` folder
2. Add all page-specific components inside it
3. Import them in `app/<page>/page.tsx` using `@/modules/<page>/...`

Within the same module, use **relative imports** (`./component`).
Across modules or from app/, use **`@/` imports** (`@/modules/<page>/component`).

```tsx
// ✅ Good — relative import within the same module
import { DocumentCard } from "./document-card"

// ✅ Good — cross-module or from app/
import { DocumentsView } from "@/modules/documents/documents-view"

// ❌ Bad — don't put page components in components/
import { DocumentCard } from "@/components/document-card"
```

## Path Aliases

```typescript
@/components    // → components/
@/components/ui // → components/ui/
@/modules       // → modules/
@/lib           // → lib/
@/hooks         // → hooks/
```

- Use **`@/` imports** for cross-module references
- Use **relative imports** (`./`, `../`) within the same module folder

## Component Patterns

### Reusable Primitives (components/ui/)

Use the shadcn CLI to add components:

```bash
npx shadcn@latest add <component-name>
```

Components in `components/ui/` are reusable primitives. Use `React.ComponentProps` to inherit all native HTML props:

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva("base-classes", {
  variants: {
    variant: { ... },
    size: { ... },
  },
  defaultVariants: { variant: "default", size: "default" },
})

// ✅ Use React.ComponentProps for reusable primitives
function Component({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof componentVariants>) {
  return (
    <div className={cn(componentVariants({ variant, size, className }))} {...props} />
  )
}

export { Component, componentVariants }
```

### Page Components (modules/)

Components in `modules/` are page-specific. Use plain `type` for props — no `React.ComponentProps` needed:

```tsx
import type { DocStructDocument } from "@/lib/types"

// ✅ Use type for component props
type DocumentCardProps = {
  document: DocStructDocument
  viewMode: "grid" | "list"
}

function DocumentCard({ document, viewMode }: DocumentCardProps) {
  return <div>...</div>
}

export { DocumentCard }
```

### Server vs Client Components

- Default to **Server Components** (no `"use client"`)
- Only add `"use client"` when you need browser APIs, event handlers, or hooks like `useState`/`useEffect`
- Keep client components small and at the leaves of the tree

### File Naming

- **Components:** `PascalCase.tsx` (e.g., `Button.tsx`, `ThemeProvider.tsx`)
- **Hooks:** `camelCase.ts` with `use` prefix (e.g., `useDebounce.ts`)
- **Utilities:** `camelCase.ts` (e.g., `formatDate.ts`)
- **Pages:** `page.tsx` (Next.js convention)

### Size Limits

Keep components small and focused. Industry standard limits:

| Scope | Max Lines | Action if exceeded |
|---|---|---|
| Component file | 150 | Extract sub-components into separate files |
| Single component function | 100 | Split into smaller components |
| Helper/utility function | 50 | Extract into `lib/` or split into focused functions |
| Hook | 50 | Extract logic into smaller hooks or utilities |

> **Note:** shadcn/ui auto-generated files in `components/ui/` are exempt from size limits — do not manually edit them.

**When a component gets too large:**

1. Extract child components (e.g., `DocumentCard` from `DocumentsView`)
2. Extract logic into custom hooks (e.g., `useDocuments`)
3. Extract helpers into `lib/` (e.g., `lib/format-date.ts`)
4. Move constants/config to separate files

```tsx
// ❌ Bad — 200+ line component doing everything
function Dashboard() {
  // ... 200 lines of logic + JSX
}

// ✅ Good — split into focused components
function Dashboard() {
  return (
    <div>
      <DashboardHeader />
      <DashboardStats />
      <DashboardTable />
    </div>
  )
}
```

## Styling

### Tailwind CSS

- Use utility classes directly, avoid custom CSS
- Use the `cn()` utility to merge class names:

```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", conditional && "conditional-class", className)} />
```

### CSS Variables (Theme Tokens)

Use theme tokens from `globals.css`, not hardcoded colors:

```tsx
// ✅ Good
className="bg-primary text-primary-foreground"

// ❌ Bad
className="bg-blue-500 text-white"
```

### Responsive Design

Use Tailwind responsive prefixes:

```tsx
className="flex flex-col md:flex-row gap-4 p-4 md:p-8"
```

## Import Order

Biome enforces this order (alphabetized within groups):

1. Built-in modules
2. External packages (`react`, `next`, etc.)
3. Internal aliases (`@/...`)
4. Relative imports (`./`, `../`)
5. Type imports

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { User } from "./types"
```

## TypeScript Conventions

- Use `type` for component props and object shapes
- Prefer `type` imports: `import type { ... } from "..."`
- Avoid `any` — use `unknown` and narrow with type guards
- Prefix unused variables/params with `_`
- Use `Readonly<{...}>` for props in layout/page components

## Biome Commands

```bash
npm run lint          # Check lint rules
npm run lint:fix      # Auto-fix lint issues
npm run format        # Format all files
npm run check         # Full check (lint + format + imports)
npm run check:fix     # Auto-fix everything
npm run typecheck     # TypeScript type checking
```

## Pre-commit Hook

Husky runs `lint-staged` on every commit, which auto-fixes:
- `*.ts, *.tsx, *.js, *.jsx` → `biome check --write`
- `*.css, *.json, *.md` → `biome format --write`

## Common Patterns

### Data Fetching

Use `async` Server Components for data fetching:

```tsx
export default async function Page() {
  const data = await fetchData()
  return <div>{data.name}</div>
}
```

### Forms

Use React Server Actions for form submissions:

```tsx
async function submitForm(formData: FormData) {
  "use server"
  // process formData
}

<form action={submitForm}>
  <input name="email" />
  <button type="submit">Submit</button>
</form>
```

### Conditional Rendering

```tsx
{isLoading ? <Skeleton /> : <Content data={data} />}
```

## Anti-patterns to Avoid

- Don't use `className` with string concatenation — use `cn()`
- Don't hardcode colors — use CSS variables
- Don't add `"use client"` to page/layout components
- Don't use `index` as `key` for dynamic lists
- Don't mutate props or state directly
- Don't use `eslint` or `prettier` — this project uses Biome
