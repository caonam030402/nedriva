import type { CursorOrPageListKeyParams } from '@/constants/reactQueryKeys';

/** Minimal query shape for cursor vs page list keys (any feature can reuse). */
export type ListPaginationQueryInput = {
  limit?: number;
  cursor?: string | null;
  page?: number;
};

/**
 * Stable RQ key fragment: if `page` is provided, use page mode and drop cursor;
 * otherwise cursor mode (`page` in key is `null`).
 * @param params - API / hook params
 * @param defaultLimit - when `params.limit` omitted
 */
export function normalizeListPaginationKeyParams(
  params: ListPaginationQueryInput = {},
  defaultLimit: number,
): CursorOrPageListKeyParams {
  const limit = params.limit ?? defaultLimit;
  const usePage = params.page !== undefined;
  const page = usePage ? Math.max(1, params.page!) : null;
  const cursor = usePage ? null : (params.cursor ?? null);
  return { limit, cursor, page };
}
