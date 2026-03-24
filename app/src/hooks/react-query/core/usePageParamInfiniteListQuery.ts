'use client';

import type { DefaultError, InfiniteData, QueryKey } from '@tanstack/react-query';
import type { PaginatedListResponse } from '@/types/api/pagination';
import { useAppInfiniteQuery } from '@/hooks/react-query/core/useAppInfiniteQuery';
import { getNextPageParamFromPageMeta } from '@/libs/pagination/pageInfiniteQuery';

export type PageParamInfiniteListQueryConfig<
  TItem,
  TResponse extends PaginatedListResponse<TItem>,
  TQueryKey extends QueryKey = QueryKey,
> = {
  queryKey: TQueryKey;
  queryFn: (page: number) => Promise<TResponse>;
  /** Defaults to `1` — matches API `?page=`. */
  initialPageParam?: number;
  enabled?: boolean;
};

/**
 * Infinite list when the backend uses **`page` + `limit`** with `pagination.hasMore` / `pagination.page`.
 * Reuse for any endpoint that returns page-style `PaginatedListResponse`.
 * @param config - `queryKey`, `queryFn(page)`, optional `initialPageParam`, `enabled`
 */
export function usePageParamInfiniteListQuery<
  TItem,
  TResponse extends PaginatedListResponse<TItem>,
  TQueryKey extends QueryKey = QueryKey,
>(
  config: PageParamInfiniteListQueryConfig<TItem, TResponse, TQueryKey>,
) {
  const initialPageParam = config.initialPageParam ?? 1;

  return useAppInfiniteQuery<TResponse, DefaultError, InfiniteData<TResponse>, TQueryKey, number>({
    queryKey: config.queryKey,
    queryFn: ({ pageParam }: { pageParam: number }) => config.queryFn(pageParam),
    initialPageParam,
    getNextPageParam: (lastPage: TResponse) => getNextPageParamFromPageMeta(lastPage),
    enabled: config.enabled ?? true,
  });
}
