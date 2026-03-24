import type { EnhancerRunsListWithActiveResponse } from '@/types/enhancer-image/runsApi';
import { apiRoutes } from '@/constants/apiRoutes';
import { ENHANCER_RUNS_TABLE_PAGE_SIZE } from '@/constants/enhancer-image/enhancerHistory';
import { apiFetch } from '@/libs/apis/httpClient';

export type FetchEnhancerRunsParams = {
  limit?: number;
  /** 1-based page (default `1`). */
  page?: number;
};

/**
 * GET `/api/enhancer-image/runs` — paged `items` + `activeItems`.
 * @param params - Query params forwarded as search params
 */
export async function fetchEnhancerRuns(
  params: FetchEnhancerRunsParams = {},
): Promise<EnhancerRunsListWithActiveResponse> {
  const limit = params.limit ?? ENHANCER_RUNS_TABLE_PAGE_SIZE;
  const page = Math.max(1, params.page ?? 1);

  const sp = new URLSearchParams();
  sp.set('limit', String(limit));
  sp.set('page', String(page));
  return apiFetch<EnhancerRunsListWithActiveResponse>(`${apiRoutes.enhancerImage.runs}?${sp.toString()}`);
}

export async function deleteEnhancerRun(runId: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(apiRoutes.enhancerImage.run(runId), { method: 'DELETE' });
}
