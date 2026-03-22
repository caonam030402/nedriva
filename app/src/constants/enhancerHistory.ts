/** Default page size for enhancer history (must match API route default). */
export const ENHANCER_HISTORY_DEFAULT_LIMIT = 30;

/** Default page size for enhancer runs list (`GET /api/enhancer/runs`) when `limit` omitted. */
export const ENHANCER_RUNS_DEFAULT_LIMIT = 50;

/**
 * Queue table: rows per page — UI + client `limit` / `page` for `GET /api/enhancer/runs`.
 * (Re-exported as `ENHANCER_QUEUE_TABLE_PAGE_SIZE` in enhance-image `constants`.)
 */
export const ENHANCER_RUNS_TABLE_PAGE_SIZE = 10;

/**
 * Queued + processing rows always included alongside each paged slice (same response as `items`).
 */
export const ENHANCER_RUNS_ACTIVE_WINDOW = 50;
