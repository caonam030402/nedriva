'use client';

import { ENHANCER_RUNS_TABLE_PAGE_SIZE } from '@/constants/enhancerHistory';
import { reactQueryKeys } from '@/constants/reactQueryKeys';
import { usePageParamInfiniteListQuery } from '@/hooks/react-query/usePageParamInfiniteListQuery';
import { fetchEnhancerRuns } from '@/libs/apis/enhancer';
import type { EnhancerRunItem, EnhancerRunsListWithActiveResponse } from '@/types/enhancer/runsApi';

export type UseEnhancerRunsInfiniteQueryParams = {
  limit?: number;
};

/**
 * Enhancer runs — `useInfiniteQuery` + `GET /api/enhancer/runs` (per-chunk `page`, `activeItems` on each response).
 */
export function useEnhancerRunsInfiniteQuery(params: UseEnhancerRunsInfiniteQueryParams = {}) {
  const limit = params.limit ?? ENHANCER_RUNS_TABLE_PAGE_SIZE;

  return usePageParamInfiniteListQuery<
    EnhancerRunItem,
    EnhancerRunsListWithActiveResponse,
    ReturnType<typeof reactQueryKeys.enhancer.runsInfiniteList>
  >({
    queryKey: reactQueryKeys.enhancer.runsInfiniteList({ limit }),
    queryFn: (page) => fetchEnhancerRuns({ limit, page }),
  });
}
