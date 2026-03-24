import type {
  EnhancerHistoryListQuery,
  EnhancerHistoryListResponse,
} from '@/types/enhancer-image/historyApi';
import { apiRoutes } from '@/constants/apiRoutes';
import { ENHANCER_HISTORY_DEFAULT_LIMIT } from '@/constants/enhancer-image/enhancerHistory';
import { apiFetch } from '@/libs/apis/httpClient';

/**
 * GET `/api/enhancer-image/history` — cursor pagination.
 * @param params - `EnhancerHistoryListQuery` from `@/types/enhancer-image/historyApi` (cursor pagination)
 */
export async function fetchEnhancerHistory(
  params: EnhancerHistoryListQuery = {},
): Promise<EnhancerHistoryListResponse> {
  const limit = params.limit ?? ENHANCER_HISTORY_DEFAULT_LIMIT;
  const sp = new URLSearchParams();
  sp.set('limit', String(limit));
  if (params.page !== undefined) {
    sp.set('page', String(Math.max(1, params.page)));
  } else if (params.cursor != null && params.cursor !== '') {
    sp.set('cursor', params.cursor);
  }
  return apiFetch<EnhancerHistoryListResponse>(`${apiRoutes.enhancerImage.history}?${sp.toString()}`);
}
