import type { ListPaginationQuery, PaginatedListResponse } from '@/types/api/pagination';

/** Params for `GET /api/enhancer/history` — same shape as `ListPaginationQuery`. */
export type EnhancerHistoryListQuery = ListPaginationQuery;

/** One row in `GET /api/enhancer/history` → `items[]` */
export type EnhancerHistoryItem = {
  id: string;
  jobId: string;
  clientQueueItemId: string | null;
  originalFilename: string;
  /** Input dimensions when known (from submit metadata). */
  inputWidth: number | null;
  inputHeight: number | null;
  /** Public GET URL for the uploaded source (R2) — enables before/after in the result modal when set. */
  inputUrl: string | null;
  outputUrl: string | null;
  outputUrls: string[] | null;
  outputWidth: number | null;
  outputHeight: number | null;
  /** Derived from stored `ops` snapshot — English model summary for the card. */
  processingLabel: string;
  processingMs: number | null;
  createdAt: string;
  updatedAt: string;
  /** Set when row was soft-deleted — still returned so clients can show / restore. */
  deletedAt: string | null;
};

export type EnhancerHistoryListResponse = PaginatedListResponse<EnhancerHistoryItem>;
