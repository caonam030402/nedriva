import { useCallback, useMemo, useState } from 'react';

export type UsePaginationParams = {
  /** Items per page (must be >= 1). */
  pageSize: number;
  /**
   * Total rows in the whole list (not “length of current page”).
   * Offset APIs usually expose this as `pagination.total` — pass it in so the hook can
   * compute `totalPages`, clamp the current page, and “Showing x–y of z”.
   */
  totalItems: number;
};

export type UsePaginationResult = {
  /** 1-based current page. */
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  /** Inclusive range for “Showing {start}–{end} of {total}” (0,0 when empty). */
  rangeStart: number;
  rangeEnd: number;
  goToPrevious: () => void;
  goToNext: () => void;
};

/**
 * Page state + range for page-based list APIs (`page` + `limit` query) and summaries.
 * Clamps `page` when `totalItems` shrinks.
 * @param params
 */
export function usePagination(params: UsePaginationParams): UsePaginationResult {
  const { pageSize, totalItems } = params;
  const safeSize = Math.max(1, pageSize);
  const [page, setPageState] = useState(1);

  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));

  const setPage = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(1, next), totalPages);
      setPageState(clamped);
    },
    [totalPages],
  );

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (totalItems <= 0) {
      return { rangeStart: 0, rangeEnd: 0 };
    }
    const skip = (page - 1) * safeSize;
    const start = skip + 1;
    const end = Math.min(page * safeSize, totalItems);
    return { rangeStart: start, rangeEnd: end };
  }, [page, safeSize, totalItems]);

  const goToPrevious = useCallback(() => {
    setPageState((p) => Math.max(1, p - 1));
  }, []);

  const goToNext = useCallback(() => {
    setPageState((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  return {
    page,
    setPage,
    totalPages,
    rangeStart,
    rangeEnd,
    goToPrevious,
    goToNext,
  };
}
