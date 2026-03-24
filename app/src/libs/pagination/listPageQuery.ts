/**
 * Shared **page + limit** list pagination (no raw SQL offset in URLs).
 * Safe for client bundles — no Node-only imports.
 */

/** Standard query keys for list pages (reuse across features + `router.replace`). */
export const LIST_PAGE_QUERY_KEY = 'page';
export const LIST_LIMIT_QUERY_KEY = 'limit';

export const MAX_LIST_LIMIT = 100;

/**
 * Parse 1-based page from a search param (invalid → `defaultPage`, min 1).
 * @param raw
 * @param defaultPage
 */
export function parsePageParam(raw: string | null, defaultPage: number = 1): number {
  if (raw == null || raw === '') {
    return Math.max(1, defaultPage);
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    return Math.max(1, defaultPage);
  }
  return n;
}

/**
 * Parse limit from URL (same rules as API `parseLimitParam`).
 * @param raw
 * @param fallback
 */
export function parseListLimitParam(raw: string | null, fallback: number): number {
  if (raw == null || raw === '') {
    return Math.min(Math.max(1, fallback), MAX_LIST_LIMIT);
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    return Math.min(Math.max(1, fallback), MAX_LIST_LIMIT);
  }
  return Math.min(Math.max(1, n), MAX_LIST_LIMIT);
}

/**
 * SQL `OFFSET` from 1-based page.
 * @param page
 * @param limit
 */
export function offsetFromPageAndLimit(page: number, limit: number): number {
  const p = Math.max(1, page);
  const l = Math.max(1, limit);
  return (p - 1) * l;
}

export function readListPageFromSearchParams(
  searchParams: URLSearchParams,
  defaultPage: number = 1,
): number {
  return parsePageParam(searchParams.get(LIST_PAGE_QUERY_KEY), defaultPage);
}

export function readListLimitFromSearchParams(
  searchParams: URLSearchParams,
  fallbackLimit: number,
): number {
  return parseListLimitParam(searchParams.get(LIST_LIMIT_QUERY_KEY), fallbackLimit);
}

export type ApplyPageLimitToSearchParamsOptions = {
  page: number;
  /** When set with `defaultLimit`, `limit` is omitted from the URL if it equals the default. */
  limit?: number;
  defaultPage?: number;
  defaultLimit?: number;
};

/**
 * Mutates `URLSearchParams`: set or delete `page` / `limit` vs defaults (cleaner URLs).
 * @param sp
 * @param options
 */
export function applyPageLimitToSearchParams(
  sp: URLSearchParams,
  options: ApplyPageLimitToSearchParamsOptions,
): void {
  const { page, limit, defaultPage = 1, defaultLimit } = options;

  if (page <= defaultPage) {
    sp.delete(LIST_PAGE_QUERY_KEY);
  } else {
    sp.set(LIST_PAGE_QUERY_KEY, String(page));
  }

  if (limit !== undefined && defaultLimit !== undefined) {
    if (limit === defaultLimit) {
      sp.delete(LIST_LIMIT_QUERY_KEY);
    } else {
      sp.set(LIST_LIMIT_QUERY_KEY, String(limit));
    }
  }
}

/**
 * Build path + query for `router.push` / `router.replace` (preserves unrelated params).
 * @param pathname
 * @param currentSearch
 * @param options
 */
export function pathnameWithPageLimitQuery(
  pathname: string,
  currentSearch: string,
  options: ApplyPageLimitToSearchParamsOptions,
): string {
  const sp = new URLSearchParams(currentSearch);
  applyPageLimitToSearchParams(sp, options);
  const q = sp.toString();
  return q.length > 0 ? `${pathname}?${q}` : pathname;
}
