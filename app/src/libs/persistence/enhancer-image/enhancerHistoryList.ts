/**
 * Shared enhancer-image history payload — used by `GET /api/enhancer-image/history` and RSC prefetch.
 */
import type { KeysetCursorPayload } from '@/libs/pagination/apiPagination';
import type { EnhancerHistoryItem, EnhancerHistoryListResponse } from '@/types/enhancer-image/historyApi';
import { formatEnhancerOpsSummary } from '@/helpers/enhancer-image/formatEnhancerImageOpsLabel';
import {
  buildCursorPaginatedResponse,
  buildPagePaginatedResponse,
  encodeKeysetCursor,
} from '@/libs/pagination/apiPagination';
import { buildPublicStorageObjectUrl } from '@/libs/persistence/enhancer-image/buildPublicStorageObjectUrl';
import {
  listDoneEnhancerJobsForUser,
  listDoneEnhancerJobsForUserPaged,
} from '@/libs/persistence/enhancer-image/enhancerProcessedRecords';

function mapHistoryRow(r: {
  id: string;
  jobId: string;
  clientQueueItemId: string | null;
  originalFilename: string;
  inputWidth: number | null;
  inputHeight: number | null;
  inputStorageKey: string;
  ops: unknown;
  outputUrl: string | null;
  outputUrls: string[] | null;
  outputWidth: number | null;
  outputHeight: number | null;
  processingMs: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): EnhancerHistoryItem {
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
  };
}

/**
 * @param userId
 * @param limit
 * @param cursor - Keyset cursor when using cursor mode (`listPage` must be `undefined`).
 * @param listPage - 1-based page when using page mode (`cursor` ignored).
 */
export async function getEnhancerHistoryListResponse(
  userId: string,
  limit: number,
  cursor: KeysetCursorPayload | null,
  listPage?: number,
): Promise<EnhancerHistoryListResponse> {
  if (listPage !== undefined) {
    const {
      rows,
      total,
      page: effectivePage,
    } = await listDoneEnhancerJobsForUserPaged(userId, limit, listPage);
    const items = rows.map(mapHistoryRow);
    return buildPagePaginatedResponse(items, limit, effectivePage, total);
  }

  const rows = await listDoneEnhancerJobsForUser(userId, limit, cursor);
  const { items, pagination } = buildCursorPaginatedResponse(rows, limit, (row) =>
    encodeKeysetCursor({
      at: row.createdAt.toISOString(),
      id: row.id,
    }),  );

  return {
    items: items.map(mapHistoryRow),
    pagination,
  };
}
