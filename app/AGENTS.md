# AGENTS — Nedriva App (Next.js)

## Project Structure

```
src/
├── app/                       # Next.js App Router pages
│   ├── [locale]/              # i18n routing group
│   │   ├── (auth)/           # Auth pages (sign-in, sign-up)
│   │   ├── (marketing)/      # Marketing pages (home, tools)
│   │   ├── (workspace)/      # Authenticated pages (dashboard)
│   │   └── api/             # Route handlers (webhooks, billing, upload)
│   └── api/                  # Root-level API routes
├── components/
│   ├── ui/                   # Atomic primitives (Button, Input, Switch...)
│   ├── common/               # Composed/page-level components + design tokens
│   ├── layout/               # SiteHeader, SiteFooter, BoostHeader
│   ├── pages/               # Page-level section components (grouped by area)
│   │   ├── home/
│   │   ├── boost/
│   │   │   ├── enhancer-image/
│   │   │   └── enhancer-video/
│   │   ├── bg-remover/
│   │   ├── video-enhancer/
│   │   ├── invite/referral/
│   │   └── affiliate-program/
│   ├── analytics/            # PostHog tracking
│   └── providers/           # React context providers
├── hooks/
│   └── react-query/          # QueryClient hooks (queries/, mutations/)
│       ├── queries/
│       └── mutations/
├── libs/
│   ├── persistence/          # DB access (billing, users, enhancer history)
│   ├── storage/              # File storage helpers
│   └── core/                 # Core utilities (auth, appearance)
├── types/                    # TypeScript type definitions (API, domain)
├── models/                   # Zod validation schemas
├── constants/                # App constants (marketing copy, feature flags)
├── locales/                  # i18n JSON files (en.json, fr.json)
├── styles/
│   └── global.css            # Design tokens, Tailwind base
└── utils/                    # Pure utility functions
```

## Principles

- Clarity and consistency over cleverness. Minimal changes. Match existing patterns.
- Keep components/functions short; break down when it improves structure.
- TypeScript everywhere; no `any` unless isolated and necessary.
- No unnecessary `try/catch`. Avoid casting; use narrowing.
- Named exports only (no default exports, except Next.js pages).
- Absolute imports via `@/` unless same directory.
- Follow existing ESLint setup; don't reformat unrelated code.
- Zod type-only: `import type * as z from 'zod'`.
- Let compiler infer return types unless annotation adds clarity.
- Options object for 3+ params, optional flags, or ambiguous args.
- Hypothesis-driven debugging: 1-3 causes, validate most likely first.

## Commands

Only these `bun run` scripts: `build-local`, `lint`, `check:types`, `check:deps`, `check:i18n`, `test`, `test:e2e`.

## Git Commits

Conventional Commits: `type: summary` without scope. The summary should be a short, specific sentence that explains what changed and where or why, not a vague phrase. Types: `feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert`. `BREAKING CHANGE:` footer when needed.

## Env

All env vars validated in `Env.ts`; never read `process.env` directly.

## Styling

Tailwind v4 utility classes. Reuse shared components. Responsive. No unnecessary classes. See `DESIGN_RULES.md` for design tokens and component patterns.

## React

- No `useMemo`/`useCallback` (React compiler handles it). Avoid `useEffect`.
- Single `props` param with inline type; access as `props.foo` (no destructuring).
- Use `React.ReactNode`, not `ReactNode`.
- Inline short event handlers; extract only when complex.

## Pages

- Default export name ends with `Page`. Props alias (if reused) ends with `PageProps`.
- Locale pages: `props: { params: Promise<{ locale: string }> }` → `await props.params` → `setRequestLocale(locale)`.
- Escape glob chars in shell commands for Next.js paths.
- Dashboard pages (sit behind auth); define meta once in layout, not in each page.
- **`components/pages/<area>/`** — route/feature UI. Keep `page.tsx` thin; import from `@/components/pages/...`.
- **`ui/`** — Atomic primitives (Button, Input, Switch...). No app-specific business logic.
- **`common/`** — Composed/page-level (Card, Badge, SectionHeader...). Has design tokens or business logic specific to this app.
- **`referral/`** — Referral feature components (tables, modals, tracking).
- Under `pages/`, mirror product areas (`pages/boost/...`, `pages/marketing/`). Colocate hooks, constants, and small helpers when only that feature uses them.

## i18n (next-intl)

- Never hard-code user-visible strings. Page namespaces end with `Page`.
- Server: `getTranslations`; Client: `useTranslations`.
- Context-specific keys (`card_title`, `meta_description`). Use `t.rich(...)` for markup.
- Use sentence case for translations.
- Error messages: short, no "try again" variants.

## JSDoc

- Start each block with `/**` directly above the symbol.
- Short, sentence-case, present-tense description of intent.
- Order: description → `@param` → `@returns` → `@throws` (only if it can throw).

## Tests

- `*.test.ts` for unit tests; `*.spec.ts` for integration tests; `*.e2e.ts` for Playwright tests.
- `*.test.ts` co-located with implementation; `*.spec.ts` and `*.e2e.ts` in `tests/` directory.
- Top `describe` = subject; nested `describe` to group scenarios or contexts.
- `it` titles: short, third-person present, `verb + object + context`. Sentence case, no period.
- Omit "should/works/handles/checks/validates". State what, not how.
- Avoid mocking unless necessary.

## Design Reference

See `DESIGN_RULES.md` for component patterns, design tokens, and usage guidelines.
