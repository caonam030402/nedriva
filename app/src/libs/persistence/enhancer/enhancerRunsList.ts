/**
 * Shared enhancer runs payload — used by `GET /api/enhancer/runs` and RSC prefetch.
 */
import type { EnhancerRunItem, EnhancerRunsListWithActiveResponse } from '@/types/enhancer/runsApi';
import { ENHANCER_RUNS_ACTIVE_WINDOW } from '@/constants/enhancerHistory';
import { buildPagePaginatedResponse } from '@/libs/pagination/apiPagination';
import { buildPublicStorageObjectUrl } from '@/libs/persistence/enhancer/buildPublicStorageObjectUrl';
import {
  listEnhancerRunsActiveForUser,
  listEnhancerRunsForUserPaged,
} from '@/libs/persistence/enhancer/enhancerProcessedRecords';
import {
  formatEnhancerOpsSummary,
  scaleFactorFromStoredOps,
} from '@/libs/helpers/enhancer-image/formatEnhancerImageOpsLabel';

function mapRunRow(r: {
  id: string;
  jobId: string;
  clientQueueItemId: string | null;
  originalFilename: string;
  inputWidth: number | null;
  inputHeight: number | null;
  inputStorageKey: string;
  ops: unknown;
  status: EnhancerRunItem['status'];
  outputUrl: string | null;
  outputUrls: string[] | null;
  outputWidth: number | null;
  outputHeight: number | null;
  errorMessage: string | null;
  processingMs: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): EnhancerRunItem {
  const rowOps = r.ops;
  const opsRecord =
    rowOps != null && typeof rowOps === 'object' && !Array.isArray(rowOps)
      ? (rowOps as Record<string, unknown>)
      : null;
  return {
    id: r.id,
    jobId: r.jobId,
    clientQueueItemId: r.clientQueueItemId,
    originalFilename: r.originalFilename,
    inputWidth: r.inputWidth,
    inputHeight: r.inputHeight,
    inputUrl: buildPublicStorageObjectUrl(r.inputStorageKey),
    outputUrl: r.outputUrl,
    outputUrls: r.outputUrls,
    outputWidth: r.outputWidth,
    outputHeight: r.outputHeight,
    processingLabel: formatEnhancerOpsSummary(opsRecord),
    processingMs: r.processingMs,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    deletedAt: r.deletedAt?.toISOString() ?? null,
    status: r.status,
    errorMessage: r.errorMessage,
    effectiveScaleFactor: scaleFactorFromStoredOps(opsRecord, 4),
  };
}

/**
 * Offset page of all runs + `activeItems` (queued/processing) for client merge without a second HTTP call.
 * @param userId - Clerk user id
 * @param limit - Page size (`items` slice)
 * @param page - 1-based page index (clamped server-side to last page)
 * @param activeWindow - cap for `activeItems` (separate from paged `items`)
 */
export async function getEnhancerRunsListResponse(
  userId: string,
  limit: number,
  page: number = 1,
  activeWindow: number = ENHANCER_RUNS_ACTIVE_WINDOW,
): Promise<EnhancerRunsListWithActiveResponse> {
  const [{ rows, total, page: effectivePage }, activeRows] = await Promise.all([
    listEnhancerRunsForUserPaged(userId, limit, page),
    listEnhancerRunsActiveForUser(userId, activeWindow),
  ]);
  const items = rows.map(mapRunRow);
  const activeItems = activeRows.map(mapRunRow);
  return {
    ...buildPagePaginatedResponse(items, limit, effectivePage, total),
    activeItems,
  };
}
