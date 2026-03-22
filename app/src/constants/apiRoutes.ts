/**
 * Central Next.js App Router API paths (same-origin). Use in `fetch` / `apiFetch` instead of string literals.
 */
export const API_BASE_PATH = '/api' as const;

export const apiRoutes = {
  process: `${API_BASE_PATH}/process`,
  enhancerHistory: `${API_BASE_PATH}/enhancer/history`,
  enhancerRuns: `${API_BASE_PATH}/enhancer/runs`,
  enhancerRun: (runId: string) =>
    `${API_BASE_PATH}/enhancer/runs/${encodeURIComponent(runId)}`,
  /** Same-origin proxy download for R2 public URLs (Clerk session required). */
  enhancerStorageDownload: `${API_BASE_PATH}/enhancer/storage-download`,
  job: (jobId: string) => `${API_BASE_PATH}/jobs/${encodeURIComponent(jobId)}`,
  webhooks: {
    clerk: `${API_BASE_PATH}/webhooks/clerk`,
    process: `${API_BASE_PATH}/webhooks/process`,
  },
  upload: `${API_BASE_PATH}/upload`,
  credits: `${API_BASE_PATH}/credits`,
  referralsMe: `${API_BASE_PATH}/referrals/me`,
  /** Public: body `{ code }` — +1 click for referrer (sign-up with `?ref=`). */
  referralsTrackClick: `${API_BASE_PATH}/referrals/track-click`,
  /** Bearer `BILLING_PLAN_SYNC_SECRET` — sync Clerk plans → `plans`. */
  billingSyncPlansFromClerk: `${API_BASE_PATH}/billing/sync-plans-from-clerk`,
} as const;

/** Arcjet / middleware: paths under this prefix are webhook endpoints. */
export const API_WEBHOOKS_PREFIX = `${API_BASE_PATH}/webhooks/` as const;
