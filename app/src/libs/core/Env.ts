import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const Env = createEnv({
  server: {
    ARCJET_KEY: z.string().startsWith('ajkey_').optional(),
    /** R2 (or S3-compatible) public origin for object keys — same as `uploadSourceImage` in `/api/process`. */
    STORAGE_PUBLIC_BASE_URL: z.string().optional(),
    CLERK_SECRET_KEY: z.string().min(1),
    /** Webhook signing secret from Clerk Dashboard (Sync users to DB) */
    CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1).optional(),
    /**
     * Bearer token for `POST /api/billing/sync-plans-from-clerk` (cron / manual catalog refresh).
     * If unset, the route returns 503.
     */
    BILLING_PLAN_SYNC_SECRET: z.string().min(1).optional(),
    /**
     * Set to `1` or `true` to skip `billing.getPlanList` on every `subscription.*` webhook (reduce API calls; rely on cron route instead).
     */
    BILLING_DISABLE_CLERK_PLAN_SYNC_ON_SUBSCRIPTION_WEBHOOK: z
      .string()
      .optional()
      .transform(v => v === '1' || v === 'true'),
    DATABASE_URL: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    /**
     * Set to `1` or `true` when Clerk Dashboard has **organization** billing plans configured.
     * If off, pricing page only shows user plans (avoids endless “Loading plans…” on the org tab).
     */
    NEXT_PUBLIC_CLERK_ORG_BILLING_ENABLED: z
      .string()
      .optional()
      .transform(v => v === '1' || v === 'true'),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_LOGGING_LEVEL: z.enum(['error', 'info', 'debug', 'warning', 'trace', 'fatal']).default('info'),
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string().optional(),
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    ARCJET_KEY: process.env.ARCJET_KEY,
    STORAGE_PUBLIC_BASE_URL: process.env.STORAGE_PUBLIC_BASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
    BILLING_PLAN_SYNC_SECRET: process.env.BILLING_PLAN_SYNC_SECRET,
    BILLING_DISABLE_CLERK_PLAN_SYNC_ON_SUBSCRIPTION_WEBHOOK:
      process.env.BILLING_DISABLE_CLERK_PLAN_SYNC_ON_SUBSCRIPTION_WEBHOOK,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_ORG_BILLING_ENABLED:
      process.env.NEXT_PUBLIC_CLERK_ORG_BILLING_ENABLED,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_LOGGING_LEVEL: process.env.NEXT_PUBLIC_LOGGING_LEVEL,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST: process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NODE_ENV: process.env.NODE_ENV,
  },
});
