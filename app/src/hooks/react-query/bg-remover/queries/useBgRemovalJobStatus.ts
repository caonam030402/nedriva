/**
 * useBgRemovalJobStatus — React Query hook for GET /api/bg-remover/status/[id]
 *
 * Polls every `pollIntervalMs` milliseconds when the job is still processing.
 * Uses plain `fetch` (not `apiFetch`) so transient errors don't trigger
 * global error listeners / toast spam while polling.
 *
 * Stops polling automatically when status is terminal (done / failed).
 */
'use client';

import type { BgRemovalJobStatusResponse } from '@/types/bg-remover/api';
import { useQuery } from '@tanstack/react-query';
import { JOB_POLL_INTERVAL_MS } from '@/constants/pipeline';

type Options = {
  /** Poll interval in ms. Pass undefined to disable polling. Defaults to JOB_POLL_INTERVAL_MS. */
  pollIntervalMs?: number;
};

export function useBgRemovalJobStatus(
  jobId: string | null,
  { pollIntervalMs = JOB_POLL_INTERVAL_MS }: Options = {},
) {
  const enabled = Boolean(jobId);

  return useQuery({
    queryKey: ['bg-removal-job-status', jobId],
    queryFn: async (): Promise<BgRemovalJobStatusResponse> => {
      const res = await fetch(`/api/bg-remover/status/${encodeURIComponent(jobId!)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `Status fetch failed: ${res.status}`);
      }
      return res.json();
    },
    enabled,
    refetchInterval: pollIntervalMs,
    refetchIntervalInBackground: false,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}
