# Nedriva Web

Main web app for **Nedriva** — a SaaS for AI image processing (upscale, enhance, sharpen, denoise, restore, face enhance, remove background). Users sign in with **Clerk**, spend **credits** per job; processing is **async** (queue + Python worker).

Source for **Nedriva** lives in this directory (`app/` — Next.js). The Python **worker** is in sibling **`worker/`** (FastAPI + arq) at the monorepo root.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js (App Router), React 19, TypeScript (strict) |
| UI | Tailwind CSS v4, HeroUI |
| Auth & billing | Clerk (including Clerk Billing on `/pricing`) |
| DB | Drizzle ORM + PostgreSQL; local dev: PGlite |
| i18n | next-intl (`en`, `fr`) |
| Security | Arcjet (via `src/proxy.ts` middleware) |
| Observability | Sentry, PostHog, LogTape |
| Tests | Vitest, Playwright |

## Requirements

- **Node.js** ≥ 20  
- **npm** or **yarn** (repo ships `package-lock.json`)

## Install & local dev

```bash
git clone https://github.com/nedriva/nedriva.git
cd nedriva/app
npm install
cp .env.example .env   # fill env vars (Clerk, DB, R2, worker, …)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With default settings, a local DB (PGlite) is used in dev — no Docker required for the minimal path.

### Environment variables

- Declare and validate through **`src/libs/core/Env.ts`** — do not read `process.env` directly in app code.
- Secrets shared with the worker (e.g. `API_SECRET_KEY`, webhooks) must **match** `../worker/.env`.

### Database

```bash
npm run db:generate   # after Drizzle schema changes
npm run db:migrate
npm run db:studio     # Drizzle Studio when needed
```

### Production build

```bash
npm run build         # runs migrate + next build
npm run start
```

For a quick production build with an in-memory DB, see the `build-local` script in `package.json`.

## Python worker (`worker/`)

High-level flow:

1. **Nedriva** (this Next.js app) creates jobs / uploads → calls the **worker** HTTP API in **`worker/`**  
2. The worker processes images (Redis + arq), stores in R2, calls webhooks back to Next.js  

Run Docker / CPU dev details: **`../worker/README.md`**.

## Directory layout (short)

```text
src/
  app/[locale]/       # App Router, (marketing), (auth) groups
  components/         # UI, including pages/<area>/...
  libs/               # Env, DB, persistence, API helpers
  locales/            # en.json, fr.json
docs/                 # Internal docs (affiliate, billing, …)
migrations/           # Drizzle SQL migrations
tests/                # E2E / integration
```

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server + file DB (per `package.json` scripts) |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run format` | Prettier |
| `npm run check:types` | `tsc --noEmit` |
| `npm run test` | Vitest |
| `npm run test:e2e` | Playwright |
| `npm run check:i18n` | Translation checks |

## Architecture notes

- Middleware logic lives in **`src/proxy.ts`** (smaller bundle); `middleware.ts` may only re-export.
- User-visible strings: use **next-intl**, not hard-coded literals in components (except agreed static meta).

## More docs

- **`docs/`** in this repo (affiliate, billing, etc.)
- AI/editor conventions: **`.cursor/rules/`** at the `nedriva/` monorepo root.

---

*Originally based on a Next.js starter; README tailored for Nedriva.*
