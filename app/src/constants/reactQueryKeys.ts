/**
 * Centralized React Query key factories.
 * - Cursor/page lists: `normalizeListPaginationKeyParams` → `CursorOrPageListKeyParams` → `historyList`.
 * - Runs infinite: `GET /api/enhancer/runs` — key `{ limit }` + internal page param (`activeItems` on each chunk).
 */
import type { EnhancerRunsInfiniteListKeyParams } from '@/types/enhancer/runsApi';

/** Stable fragment for lists that use **either** keyset cursor **or** 1-based `page` (never both in the key). */
export type CursorOrPageListKeyParams = {
  limit: number;
  cursor: string | null;
  /** `null` in cursor mode; otherwise 1-based page. */
  page: number | null;
};

export const reactQueryKeys = {
  user: {
    all: ['user'] as const,
    /** `GET /api/credits` — signed-in balance */
    credits: () => [...reactQueryKeys.user.all, 'credits'] as const,
  },
  enhancer: {
    all: ['enhancer'] as const,
    histories: () => [...reactQueryKeys.enhancer.all, 'history'] as const,
    historyList: (params: CursorOrPageListKeyParams) =>
      [...reactQueryKeys.enhancer.histories(), 'list', params] as const,

    runs: () => [...reactQueryKeys.enhancer.all, 'runs'] as const,
    /**
     * `GET /api/enhancer/runs` — infinite scroll; `useInfiniteQuery` supplies `page`.
     */
    runsInfiniteList: (params: EnhancerRunsInfiniteListKeyParams) =>
      [...reactQueryKeys.enhancer.runs(), 'infinite', params] as const,
  },
} as const;
