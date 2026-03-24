/**
 * 所有 Next.js App Router API 路径 — 集中在此文件，勿在 feature 模块内再写 routes。
 */
export const API_BASE_PATH = '/api' as const;
const BASE = API_BASE_PATH;

export const apiRoutes = {
  enhancerImage: {
    process: `${BASE}/enhancer-image/process`,
    job: (jobId: string) => `${BASE}/enhancer-image/jobs/${encodeURIComponent(jobId)}`,
    runs: `${BASE}/enhancer-image/runs`,
    run: (runId: string) => `${BASE}/enhancer-image/runs/${encodeURIComponent(runId)}`,
    history: `${BASE}/enhancer-image/history`,
    storageDownload: `${BASE}/enhancer-image/storage-download`,
    webhook: `${BASE}/enhancer-image/webhook`,
  },
  bgRemover: {
    uploadUrl: `${BASE}/bg-remover/upload-url`,
    createJob: `${BASE}/bg-remover/create`,
    getJob: (jobId: string) => `${BASE}/bg-remover/status/${encodeURIComponent(jobId)}`,
    webhook: `${BASE}/bg-remover/webhook`,
  },
  enhancerVideo: {
    uploadUrl: `${BASE}/enhancer-video/upload-url`,
    upload: `${BASE}/enhancer-video/upload`,
    enhance: `${BASE}/enhancer-video/enhance`,
    status: (videoId: string) => `${BASE}/enhancer-video/${encodeURIComponent(videoId)}/status`,
    result: (videoId: string) => `${BASE}/enhancer-video/${encodeURIComponent(videoId)}/result`,
  },
  /** Browser uploads directly to R2 via presigned PUT URL from POST /api/shared/upload-url. */
  shared: {
    uploadUrl: `${BASE}/shared/upload-url`,
  },
  credits: `${BASE}/credits`,
  referrals: {
    /** Authenticated: GET /api/referrals/me */
    me: `${BASE}/referrals/me`,
    /** Authenticated: sign-up credit rows + subscription bonus rows for referral dashboard modal. */
    activity: `${BASE}/referrals/me/activity`,
    /** Authenticated: clears `pending_referral_code` (must run from client → Route Handler). */
    clearPendingCookie: `${BASE}/referrals/clear-pending-cookie`,
    /** Public: body `{ code }` — +1 click for referrer (sign-up with `?ref=`). */
    trackClick: `${BASE}/referrals/track-click`,
  },
  billing: {
    /** Bearer `BILLING_PLAN_SYNC_SECRET` — sync Clerk plans → `plans`. */
    syncPlansFromClerk: `${BASE}/billing/sync-plans-from-clerk`,
  },
  webhooks: {
    clerk: `${BASE}/webhooks/clerk`,
  },
} as const;

/** Arcjet / middleware: paths under this prefix are webhook endpoints. */
export const API_WEBHOOKS_PREFIX = `${BASE}/webhooks/` as const;
