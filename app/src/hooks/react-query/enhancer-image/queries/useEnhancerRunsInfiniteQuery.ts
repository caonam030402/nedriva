'use client';

import type { EnhancerRunItem, EnhancerRunsListWithActiveResponse } from '@/types/enhancer-image/runsApi';
import { ENHANCER_RUNS_TABLE_PAGE_SIZE } from '@/constants/enhancer-image/enhancerHistory';
import { reactQueryKeys } from '@/constants/reactQueryKeys';
import { usePageParamInfiniteListQuery } from '@/hooks/react-query/core/usePageParamInfiniteListQuery';
import { fetchEnhancerRuns } from '@/libs/apis/enhancer-image';

export type UseEnhancerRunsInfiniteQueryParams = {
  limit?: number;
};

/**
 * Enhancer runs — `useInfiniteQuery` + `GET /api/enhancer-image/runs` (per-chunk `page`, `activeItems` on each response).
 * @param params
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
