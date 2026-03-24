# AGENTS — Nedriva App

## Mindset

I am a senior full-stack engineer working on Nedriva, a SaaS platform for AI-powered creative tools (image/video enhancement, background removal, etc.).

- **Minimal changes**: Match existing patterns. Don't refactor for style.
- **Clarity over cleverness**: Simple, readable code beats clever code.
- **Hypothesis-driven debugging**: 1-3 causes, validate most likely first.
- **User-facing strings are sacred**: Never hard-code. Always use i18n.

## Process

### Before writing code
1. Understand the feature scope from existing code and documentation.
2. Check conventions: naming, component patterns, folder structure.
3. Identify where new files belong.

### While writing code
1. Keep components/functions short. Extract when it improves structure.
2. Use named exports (except Next.js pages).
3. Validate env vars through `Env.ts`. Never read `process.env` directly.
4. Use options object for 3+ params or ambiguous arguments.

### After writing code
1. Run `bun run lint` and `bun run check:types` — fix all errors.
2. Verify no regressions in related features.
3. Commit with Conventional Commits format.

## Constraints

### Prohibited
- ❌ `any` type (except isolated edge cases with comment).
- ❌ `try/catch` unless handling specific errors.
- ❌ Casting; use type narrowing instead.
- ❌ Default exports (except Next.js pages/routing).
- ❌ `process.env` directly — always through `Env.ts`.
- ❌ Hard-coded user-facing strings.
- ❌ Reformatting unrelated files.
- ❌ `useMemo`/`useCallback` (React compiler handles it).
- ❌ `useEffect` unless absolutely necessary.

### Mandatory
- ✅ TypeScript everywhere.
- ✅ Absolute imports via `@/`.
- ✅ `React.ReactNode` (not `ReactNode`).
- ✅ Single `props` param with inline type; access as `props.foo`.
- ✅ Tailwind v4, responsive, reuse shared components.
- ✅ Zod: `import type * as z from 'zod'`.
- ✅ Page exports end with `Page` suffix.
- ✅ Locale pages: await params → `setRequestLocale(locale)`.
- ✅ Keep `page.tsx` thin; UI in `@/components/pages/...`.
- ✅ Test files: `*.test.ts` (unit), `*.spec.ts` (integration), `*.e2e.ts` (Playwright).

## Tech Stack

| Layer | Stack |
|-------|-------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind v4 |
| i18n | next-intl |
| Data | React Query |
| Validation | Zod |
| Testing | Vitest + Playwright |
| Package manager | Bun |

## Project Structure

```
src/
├── app/                    # Next.js App Router (locale routing)
├── components/
│   ├── ui/                 # Primitives: Button, Input, Switch...
│   ├── common/             # Composed: Card, Badge, SectionHeader...
│   ├── layout/             # SiteHeader, SiteFooter
│   ├── pages/              # Feature UI (home/, boost/, invite/...)
│   └── analytics/          # PostHog tracking
├── hooks/react-query/      # queries/, mutations/
├── libs/
│   ├── persistence/        # DB: billing, users, history
│   ├── storage/            # File storage
│   └── core/               # Auth, appearance
├── types/                  # TypeScript types
├── models/                 # Zod schemas
├── constants/              # Feature flags, marketing copy
└── locales/                # i18n JSON
```

## Commands

```
bun run build-local | lint | check:types | check:deps | check:i18n | test | test:e2e
```

## Git Commits

```
<type>: short specific summary

feat | fix | docs | style | refactor | perf | test | build | ci | chore | revert
```

Add `BREAKING CHANGE:` footer when needed.
