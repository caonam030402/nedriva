import type { ListPaginationMeta, PaginatedListResponse } from '@/types/api/pagination';
/**
 * Parse query params and build `PaginatedListResponse` — aligned with `src/types/api/pagination.ts`.
 */
import { Buffer } from 'node:buffer';

export const DEFAULT_LIST_LIMIT = 20;
export const MAX_LIST_LIMIT = 100;

export function parseLimitParam(
  raw: string | null,
  fallback: number = DEFAULT_LIST_LIMIT,
): number {
  if (raw == null || raw === '') {
    return Math.min(Math.max(1, fallback), MAX_LIST_LIMIT);
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    return Math.min(Math.max(1, fallback), MAX_LIST_LIMIT);
  }
  return Math.min(Math.max(1, n), MAX_LIST_LIMIT);
}

/** Keyset cursor: `{ at: createdAt ISO, id: uuid }` — base64url */
export type KeysetCursorPayload = { at: string; id: string };

export function encodeKeysetCursor(payload: KeysetCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeKeysetCursor(raw: string | null | undefined): KeysetCursorPayload | null {
  if (raw == null || raw === '') {
    return null;
  }
  try {
    const j = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as unknown;
    if (
      j !== null
      && typeof j === 'object'
      && 'at' in j
      && 'id' in j
      && typeof (j as KeysetCursorPayload).at === 'string'
      && typeof (j as KeysetCursorPayload).id === 'string'
    ) {
      return j as KeysetCursorPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export function buildCursorPaginatedResponse<T>(
  items: T[],
  limit: number,
  encodeNextCursor: (lastItem: T) => string,
): PaginatedListResponse<T> {
  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;
  const last = page[page.length - 1];
  const pagination: ListPaginationMeta = {
    limit,
    hasMore,
    nextCursor: hasMore && last != null ? encodeNextCursor(last) : null,
    page: null,
    total: null,
    totalPages: null,
  };
  return { items: page, pagination };
}

export function buildPagePaginatedResponse<T>(
  items: T[],
  limit: number,
  page: number,
  total: number | null,
): PaginatedListResponse<T> {
  const safePage = Math.max(1, page);
  const hasMore
    = total != null
      ? (safePage - 1) * limit + items.length < total
      : items.length === limit;
  const totalPages
    = total != null && limit > 0 ? Math.max(1, Math.ceil(total / limit)) : null;
  const pagination: ListPaginationMeta = {
    limit,
    hasMore,
    nextCursor: null,
    page: safePage,
    total,
    totalPages,
  };
  return { items, pagination };
}
