# Chill and Flow — Project Guidelines

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript 5, Tailwind CSS 4
- Vitest + React Testing Library for tests
- ESLint 9 (flat config) + Prettier

## Architecture

```
src/
  app/          # Next.js App Router pages and layouts
    api/        # Route handlers
  components/
    ui/         # Shared UI primitives
  hooks/        # Custom React hooks
  lib/          # Utility functions, constants
  types/        # Shared TypeScript types
__tests__/      # Mirrors src/ structure
```

## Code Style

- Functional components only. No class components.
- Use `@/*` import alias for src/ paths.
- Prefer named exports. Default exports only for page/layout files.
- Server Components by default; add `"use client"` only when needed.

## Build and Test

```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint check
npm run format:check # Prettier check
npm run test         # Vitest (single run)
npm run test:watch   # Vitest (watch mode)
npm run test:coverage # Vitest with coverage
```

## Conventions

- Every new component or utility must have a corresponding test in `__tests__/`.
- Place API route handlers in `src/app/api/<resource>/route.ts`.
- Use Tailwind utility classes. No CSS modules or styled-components.
- Consult `node_modules/next/dist/docs/` for the latest Next.js API conventions.
