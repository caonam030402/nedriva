/**
 * Unified API client for all processing pipelines.
 * Browser-side fetch wrappers — no business logic here.
 */
import type { JobStatusResult, Pipeline } from '@/libs/types/processing';

/**
 * Get job status from the unified status endpoint.
 * All pipelines use the same pattern: GET /api/{pipeline}/status/{jobId}
 *
 * Uses plain `fetch` (not apiFetch) to avoid global error listeners
 * triggering toast spam during polling.
 * @param pipeline - The pipeline identifier (image-enhancer, video, bg-remover)
 * @param jobId - The job ID to fetch status for
 */
export async function fetchJobStatus(pipeline: Pipeline, jobId: string): Promise<JobStatusResult> {
  const res = await fetch(`/api/${pipeline}/status/${encodeURIComponent(jobId)}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Status fetch failed: ${res.status}`);
  }

  return res.json() as Promise<JobStatusResult>;
}

/**
 * Pipeline → status route URL (for React Query key factory).
 * @param pipeline - The pipeline identifier
 * @param jobId - The job ID
 */
export function statusRoute(pipeline: Pipeline, jobId: string): string {
  return `/api/${pipeline}/status/${encodeURIComponent(jobId)}`;
}
