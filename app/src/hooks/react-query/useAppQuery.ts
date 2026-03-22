'use client';

import type {
  DefaultError,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

/** App-wide defaults are merged first; caller options override. */
export type AppUseQueryOptions<
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;

const defaultQueryOptions = {
  /** Avoid instant refetch after SSR hydration */
  staleTime: 30_000,
} as const;

/**
 * Typed wrapper around `useQuery` — central place for shared defaults (staleTime, etc.).
 * @param options - Full `useQuery` options (`queryKey` + `queryFn` required)
 */
export function useAppQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: AppUseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    ...defaultQueryOptions,
    ...options,
  });
}
