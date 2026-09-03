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
│   ├── page.tsx          # Home page
│   └── globals.css       # Tailwind CSS + theme variables
├── components/
│   ├── ui/               # shadcn/ui components (reusable primitives)
│   └── theme-provider.tsx # next-themes wrapper
├── hooks/                # Custom React hooks
├── lib/
│   └── utils.ts          # cn() utility (clsx + tailwind-merge)
├── public/               # Static assets
└── biome.json            # Linter + formatter config
```

## Path Aliases

```typescript
@/components   // → components/
@/lib          // → lib/
@/hooks        // → hooks/
@/components/ui // → components/ui/
```

Always use `@/` imports, never relative paths for project code.

## Component Patterns

### shadcn/ui Components

Use the shadcn CLI to add components:

```bash
npx shadcn@latest add <component-name>
```

Components go in `components/ui/`. They follow this pattern:

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

### Server vs Client Components

- Default to **Server Components** (no `"use client"`)
- Only add `"use client"` when you need browser APIs, event handlers, or hooks like `useState`/`useEffect`
- Keep client components small and at the leaves of the tree

### File Naming

- **Components:** `PascalCase.tsx` (e.g., `Button.tsx`, `ThemeProvider.tsx`)
- **Hooks:** `camelCase.ts` with `use` prefix (e.g., `useDebounce.ts`)
- **Utilities:** `camelCase.ts` (e.g., `formatDate.ts`)
- **Pages:** `page.tsx` (Next.js convention)

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

- Use `interface` for object shapes, `type` for unions/intersections
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
