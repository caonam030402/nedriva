/**
 * DB persistence for enhancer-image jobs (`enhancer_processed_images`).
 */
import type { KeysetCursorPayload } from '@/libs/pagination/apiPagination';
import type { OpsState } from '@/types/enhancer-image/state';
import { and, desc, eq, isNull, or, sql } from 'drizzle-orm';
import {
  ENHANCER_HISTORY_DEFAULT_LIMIT,
  ENHANCER_HISTORY_MAX_LIMIT,
  ENHANCER_RUNS_ACTIVE_WINDOW,
  ENHANCER_RUNS_DEFAULT_LIMIT,
  ENHANCER_RUNS_MAX_LIMIT,
} from '@/constants/enhancer-image/enhancerHistory';
import { db } from '@/libs/core/DB';
import { enhancerProcessedImages } from '@/models/Schema';

export async function insertEnhancerJobOnSubmit(params: {
  userId: string;
  jobId: string;
  queueItemId: string;
  inputStorageKey: string;
  originalFilename: string;
  inputWidth?: number | null;
  inputHeight?: number | null;
  ops: OpsState;
  creditCost: number;
}): Promise<void> {
  await db.insert(enhancerProcessedImages).values({
    userId: params.userId,
    jobId: params.jobId,
    clientQueueItemId: params.queueItemId,
    inputStorageKey: params.inputStorageKey,
    originalFilename: params.originalFilename,
    inputWidth: params.inputWidth ?? null,
    inputHeight: params.inputHeight ?? null,
    status: 'queued',
    ops: { ...params.ops } as Record<string, unknown>,
    creditCost: params.creditCost,
  });
}

export type WebhookProcessBody = {
  job_id: string;
  queue_item_id: string;
  status: 'done' | 'error';
  output_url?: string;
  outputs?: string[];
  output_width?: number;
  output_height?: number;
  error?: string;
  processing_ms?: number;
};

/**
 * Called from trusted Python webhook (secret header).
 * @param body
 */
export async function updateEnhancerJobFromWebhook(body: WebhookProcessBody): Promise<void> {
  const status = body.status === 'done' ? 'done' : 'error';
  await db
    .update(enhancerProcessedImages)
    .set({
      status,
      outputUrl: body.output_url ?? null,
      outputUrls: body.outputs ?? null,
      outputWidth: body.output_width ?? null,
      outputHeight: body.output_height ?? null,
      errorMessage: body.error ?? null,
      processingMs: body.processing_ms ?? null,
      updatedAt: new Date(),
    })
    .where(eq(enhancerProcessedImages.jobId, body.job_id));
}

/**
 * Sync row when user polls job status — only if row belongs to this user.
 * @param params
 * @param params.userId
 * @param params.jobId
 * @param params.status
 * @param params.output_url
 * @param params.outputs
 * @param params.output_width
 * @param params.output_height
 * @param params.error
 * @param params.processing_ms
 */
export async function updateEnhancerJobFromPoll(params: {
  userId: string;
  jobId: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  output_url: string | null;
  outputs: string[] | null;
  output_width: number | null;
  output_height: number | null;
  error: string | null;
  processing_ms: number | null;
}): Promise<void> {
  if (params.status !== 'done' && params.status !== 'error') {
    return;
  }
  const status = params.status === 'done' ? 'done' : 'error';
  await db
    .update(enhancerProcessedImages)
    .set({
      status,
      outputUrl: params.output_url,
      outputUrls: params.outputs,
      outputWidth: params.output_width,
      outputHeight: params.output_height,
      errorMessage: params.error,
      processingMs: params.processing_ms,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(enhancerProcessedImages.jobId, params.jobId),
        eq(enhancerProcessedImages.userId, params.userId),
      ),
    );
}

export async function listDoneEnhancerJobsForUser(
  userId: string,
  limit: number = ENHANCER_HISTORY_DEFAULT_LIMIT,
  cursor: KeysetCursorPayload | null = null,
) {
  const safeLimit = Math.min(Math.max(1, limit), ENHANCER_HISTORY_MAX_LIMIT);
  const take = safeLimit + 1;

  const conditions = [
    eq(enhancerProcessedImages.userId, userId),
    eq(enhancerProcessedImages.status, 'done'),
  ];

  if (cursor) {
    conditions.push(
      sql`(${enhancerProcessedImages.createdAt}, ${enhancerProcessedImages.id}) < (${cursor.at}::timestamptz, ${cursor.id}::uuid)`,
    );
  }

  return db
    .select({
      id: enhancerProcessedImages.id,
      jobId: enhancerProcessedImages.jobId,
      clientQueueItemId: enhancerProcessedImages.clientQueueItemId,
      originalFilename: enhancerProcessedImages.originalFilename,
      inputWidth: enhancerProcessedImages.inputWidth,
      inputHeight: enhancerProcessedImages.inputHeight,
      inputStorageKey: enhancerProcessedImages.inputStorageKey,
      ops: enhancerProcessedImages.ops,
      outputUrl: enhancerProcessedImages.outputUrl,
      outputUrls: enhancerProcessedImages.outputUrls,
      outputWidth: enhancerProcessedImages.outputWidth,
      outputHeight: enhancerProcessedImages.outputHeight,
      processingMs: enhancerProcessedImages.processingMs,
      createdAt: enhancerProcessedImages.createdAt,
      updatedAt: enhancerProcessedImages.updatedAt,
      deletedAt: enhancerProcessedImages.deletedAt,
    })
    .from(enhancerProcessedImages)
    .where(and(...conditions))
    .orderBy(desc(enhancerProcessedImages.createdAt), desc(enhancerProcessedImages.id))
    .limit(take);
}

/**
 * Done jobs with 1-based page + limit + total. Same filter as cursor list; page clamped to last page.
 * @param userId
 * @param limit
 * @param page
 */
export async function listDoneEnhancerJobsForUserPaged(
  userId: string,
  limit: number = ENHANCER_HISTORY_DEFAULT_LIMIT,
  page: number = 1,
) {
  const safeLimit = Math.min(Math.max(1, limit), ENHANCER_HISTORY_MAX_LIMIT);
  const safeRequestedPage = Math.max(1, page);

  const baseWhere = and(
    eq(enhancerProcessedImages.userId, userId),
    eq(enhancerProcessedImages.status, 'done'),
  );

  const [countRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(enhancerProcessedImages)
    .where(baseWhere);

  const total = countRow?.c ?? 0;

  const totalPages = total <= 0 ? 1 : Math.ceil(total / safeLimit);
  const safePage = Math.min(safeRequestedPage, totalPages);
  const sqlOffset = (safePage - 1) * safeLimit;

  const rows = await db
    .select({
      id: enhancerProcessedImages.id,
      jobId: enhancerProcessedImages.jobId,
      clientQueueItemId: enhancerProcessedImages.clientQueueItemId,
      originalFilename: enhancerProcessedImages.originalFilename,
      inputWidth: enhancerProcessedImages.inputWidth,
      inputHeight: enhancerProcessedImages.inputHeight,
      inputStorageKey: enhancerProcessedImages.inputStorageKey,
      ops: enhancerProcessedImages.ops,
      outputUrl: enhancerProcessedImages.outputUrl,
      outputUrls: enhancerProcessedImages.outputUrls,
      outputWidth: enhancerProcessedImages.outputWidth,
      outputHeight: enhancerProcessedImages.outputHeight,
      processingMs: enhancerProcessedImages.processingMs,
      createdAt: enhancerProcessedImages.createdAt,
      updatedAt: enhancerProcessedImages.updatedAt,
      deletedAt: enhancerProcessedImages.deletedAt,
    })
    .from(enhancerProcessedImages)
    .where(baseWhere)
    .orderBy(desc(enhancerProcessedImages.createdAt), desc(enhancerProcessedImages.id))
    .limit(safeLimit)
    .offset(sqlOffset);

  return { rows, total, page: safePage };
}

const runsSelectShape = {
  id: enhancerProcessedImages.id,
  jobId: enhancerProcessedImages.jobId,
  clientQueueItemId: enhancerProcessedImages.clientQueueItemId,
  originalFilename: enhancerProcessedImages.originalFilename,
  inputWidth: enhancerProcessedImages.inputWidth,
  inputHeight: enhancerProcessedImages.inputHeight,
  inputStorageKey: enhancerProcessedImages.inputStorageKey,
  ops: enhancerProcessedImages.ops,
  status: enhancerProcessedImages.status,
  outputUrl: enhancerProcessedImages.outputUrl,
  outputUrls: enhancerProcessedImages.outputUrls,
  outputWidth: enhancerProcessedImages.outputWidth,
  outputHeight: enhancerProcessedImages.outputHeight,
  errorMessage: enhancerProcessedImages.errorMessage,
  processingMs: enhancerProcessedImages.processingMs,
  createdAt: enhancerProcessedImages.createdAt,
  updatedAt: enhancerProcessedImages.updatedAt,
  deletedAt: enhancerProcessedImages.deletedAt,
} as const;

/**
 * Recent enhancer rows for the user (queued / processing / done / error), **excluding** soft-deleted.
 * 1-based page + limit; clamps page to last page when out of range — aligned with queue UI.
 * @param userId
 * @param limit
 * @param page
 */
export async function listEnhancerRunsForUserPaged(
  userId: string,
  limit: number = ENHANCER_RUNS_DEFAULT_LIMIT,
  page: number = 1,
) {
  const safeLimit = Math.min(Math.max(1, limit), ENHANCER_RUNS_MAX_LIMIT);
  const safeRequestedPage = Math.max(1, page);

  const whereVisible = and(
    eq(enhancerProcessedImages.userId, userId),
    isNull(enhancerProcessedImages.deletedAt),
  );

  const [countRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(enhancerProcessedImages)
    .where(whereVisible);

  const total = countRow?.c ?? 0;

  const totalPages = total <= 0 ? 1 : Math.ceil(total / safeLimit);
  const safePage = Math.min(safeRequestedPage, totalPages);
  const offset = (safePage - 1) * safeLimit;

  const rows = await db
    .select(runsSelectShape)
    .from(enhancerProcessedImages)
    .where(whereVisible)
    .orderBy(desc(enhancerProcessedImages.createdAt), desc(enhancerProcessedImages.id))
    .limit(safeLimit)
    .offset(offset);

  return { rows, total, page: safePage };
}

export async function listEnhancerRunsActiveForUser(
  userId: string,
  limit: number = ENHANCER_RUNS_ACTIVE_WINDOW,
) {
  const safeLimit = Math.min(Math.max(1, limit), ENHANCER_RUNS_ACTIVE_WINDOW);

  return db
    .select(runsSelectShape)
    .from(enhancerProcessedImages)
    .where(
      and(
        eq(enhancerProcessedImages.userId, userId),
        isNull(enhancerProcessedImages.deletedAt),
        or(
          eq(enhancerProcessedImages.status, 'queued'),
          eq(enhancerProcessedImages.status, 'processing'),
        ),
      ),
    )
    .orderBy(desc(enhancerProcessedImages.createdAt), desc(enhancerProcessedImages.id))
    .limit(safeLimit);
}

/**
 * Soft-delete one run row if it belongs to the user.
 * @param userId
 * @param runId
 * @returns whether a row was updated
 */
export async function softDeleteEnhancerRunForUser(
  userId: string,
  runId: string,
): Promise<boolean> {
  const updated = await db
    .update(enhancerProcessedImages)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(enhancerProcessedImages.id, runId),
        eq(enhancerProcessedImages.userId, userId),
        isNull(enhancerProcessedImages.deletedAt),
      ),
    )
    .returning({ id: enhancerProcessedImages.id });

  return updated.length > 0;
}
