'use client';

import type {
  DefaultError,
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';

const defaultOptions = {
  /** Match `useAppQuery` — avoid immediate refetch right after hydrate */
  staleTime: 30_000,
} as const;

/**
 * `useInfiniteQuery` with app defaults (`staleTime`, …). Caller `options` spread after override these.
 * @param options
 */
export function useAppInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
): UseInfiniteQueryResult<TData, TError> {
  return useInfiniteQuery({
    ...defaultOptions,
    ...options,
  });
}
