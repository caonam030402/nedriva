'use client';

import type { EnhancerHistoryListQuery } from '@/types/enhancer';
import { ENHANCER_HISTORY_DEFAULT_LIMIT } from '@/constants/enhancerHistory';
import { reactQueryKeys } from '@/constants/reactQueryKeys';
import { useAppQuery } from '@/hooks/react-query/useAppQuery';
import { fetchEnhancerHistory } from '@/libs/apis/enhancer';
import { normalizeListPaginationKeyParams } from '@/utils/normalizeListPaginationKeyParams';

/** Hook args — same shape as `EnhancerHistoryListQuery`. */
export type UseEnhancerHistoryQueryParams = EnhancerHistoryListQuery;

export type UseEnhancerHistoryQueryOptions = {
  /** Set `false` when data is supplied from another query (e.g. enhancer runs). */
  enabled?: boolean;
};

/**
 * Enhancer history — cursor or page pagination (`page` for page numbers + `pagination.total`).
 * @param params - History list query params
 * @param options - Query options
 */
export function useEnhancerHistoryQuery(
  params: UseEnhancerHistoryQueryParams = {},
  options: UseEnhancerHistoryQueryOptions = {},
) {
  const keyParams = normalizeListPaginationKeyParams(params, ENHANCER_HISTORY_DEFAULT_LIMIT);
  const { limit, cursor, page } = keyParams;
  const usePageMode = page !== null;
  const enabled = options.enabled ?? true;

  return useAppQuery({
    queryKey: reactQueryKeys.enhancer.historyList(keyParams),
    queryFn: () =>
      usePageMode
        ? fetchEnhancerHistory({ limit, page: page! })
        : fetchEnhancerHistory({ limit, cursor: cursor ?? undefined }),
    enabled,
  });
}
