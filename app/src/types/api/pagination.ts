export type ListPaginationQuery = {
  limit?: number;
  cursor?: string | null;
  page?: number;
};

export type ListPaginationMeta = {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
  page: number | null;
  total: number | null;
  totalPages: number | null;
};

/**
 * Standard JSON body for any list endpoint (200).
 * - `items`: always an array (avoid `data` to prevent confusion with a single object).
 */
export type PaginatedListResponse<T> = {
  items: T[];
  pagination: ListPaginationMeta;
};

/** Query validation error (422) — reusable shape */
export type PaginationValidationError = {
  error: 'Invalid pagination';
  details?: { field: string; message: string }[];
};
