import type { PaginatedListResponse } from '@/types/api/pagination';
import type { EnhancerHistoryItem } from '@/types/enhancer-image/historyApi';
import { EEnhancerStatus } from '@/enums/enhancer-image';

/** Row status from `enhancer_processed_images.status` */
export type EnhancerRunStatus = EEnhancerStatus;

/**
 * One row in `GET /api/enhancer/runs` — same public fields as history plus lifecycle status.
 */
export type EnhancerRunItem = EnhancerHistoryItem & {
  status: EnhancerRunStatus;
  errorMessage: string | null;
  /** From stored `ops` at submit — used for output size estimates in the queue table. */
  effectiveScaleFactor: number;
};

export type EnhancerRunsListResponse = PaginatedListResponse<EnhancerRunItem>;

/**
 * `GET /api/enhancer/runs` — paged `items` plus `activeItems` (queued + processing) for polling/merge.
 */
export type EnhancerRunsListWithActiveResponse = EnhancerRunsListResponse & {
  activeItems: EnhancerRunItem[];
};

/** React Query key for `runsInfiniteList` — `limit` only (`page` is the infinite query pageParam). */
export type EnhancerRunsInfiniteListKeyParams = {
  limit: number;
};
