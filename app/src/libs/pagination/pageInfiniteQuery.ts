import type { PaginatedListResponse } from '@/types/api/pagination';

/**
 * `useInfiniteQuery` page param is 1-based — matches `GET ?page=` + `buildPagePaginatedResponse`.
 * @param lastPage
 */
export function getNextPageParamFromPageMeta(
  lastPage: PaginatedListResponse<unknown>,
): number | undefined {
  if (!lastPage.pagination.hasMore) {
    return undefined;
  }
  const p = lastPage.pagination.page;
  if (p == null) {
    return undefined;
  }
  return p + 1;
}
