import type { EnhancerJobStatusBody } from '@/types/enhancer/jobApi';
import { apiRoutes } from '@/constants/apiRoutes';

/**
 * GET `/api/jobs/[jobId]` — poll job status.
 * Uses plain `fetch` (not `apiFetch`) so transient errors do not trigger global error listeners / toast spam while polling.
 * @param jobId - Server job id
 * @returns Parsed JSON, or `null` if the response is not OK
 */
export async function fetchEnhancerJobStatus(
  jobId: string,
): Promise<EnhancerJobStatusBody | null> {
  const res = await fetch(apiRoutes.job(jobId), { credentials: 'include' });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<EnhancerJobStatusBody>;
}
