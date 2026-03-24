/**
 * Centralized React Query key factories.
 * - Cursor/page lists: `normalizeListPaginationKeyParams` → `CursorOrPageListKeyParams` → `historyList`.
 * - Runs infinite: `GET /api/enhancer-image/runs` — key `{ limit }` + internal page param (`activeItems` on each chunk).
 */

import type { EnhancerRunsInfiniteListKeyParams } from '@/types/enhancer-image';

/** Stable fragment for lists that use **either** keyset cursor **or** 1-based `page` (never both in the key). */
export type CursorOrPageListKeyParams = {
  limit: number;
  cursor: string | null;
  /** `null` in cursor mode; otherwise 1-based page. */
  page: number | null;
};

const enhancerImageAll = ['enhancer-image'] as const;

/** Query key fragment for enhancer-image lists & runs (canonical string tag: `enhancer-image`). */
const enhancerImageKeys = {
  all: enhancerImageAll,
  histories: () => [...enhancerImageAll, 'history'] as const,
  historyList: (params: CursorOrPageListKeyParams) =>
    [...enhancerImageAll, 'history', 'list', params] as const,
  runs: () => [...enhancerImageAll, 'runs'] as const,
  /**
   * `GET /api/enhancer-image/runs` — infinite scroll; `useInfiniteQuery` supplies `page`.
   * @param params
   */
  runsInfiniteList: (params: EnhancerRunsInfiniteListKeyParams) =>
    [...enhancerImageAll, 'runs', 'infinite', params] as const,
} as const;

export const reactQueryKeys = {
  user: {
    all: ['user'] as const,
    /** `GET /api/credits` — signed-in balance */
    credits: () => [...reactQueryKeys.user.all, 'credits'] as const,
  },
  'enhancer-image': enhancerImageKeys,
  /** Shorthand — same object as `'enhancer-image'` (ergonomic `reactQueryKeys.enhancer.*`). */
  enhancer: enhancerImageKeys,
} as const;
