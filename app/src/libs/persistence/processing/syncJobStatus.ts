/**
 * Unified job status sync — used by all status routes.
 *
 * Pattern (same for every pipeline):
 *   1. Read job from DB  (verify ownership + get latest DB state)
 *   2. If still in-progress → call Python → UPDATE DB
 *   3. Return unified JobStatusResult
 *
 * This ensures the DB is always current regardless of whether the client
 * polls, a webhook fires, or a user returns after being away.
 */
import type { JobStatus, JobStatusResult } from '@/libs/types/processing';

/** Shape returned by each pipeline's Python-status fetcher. */
export type PythonStatus = {
  status: string;
  output_url?: string | null;
  outputs?: string[] | null;
  output_width?: number | null;
  output_height?: number | null;
  error?: string | null;
  processing_ms?: number | null;
  progress?: number | null;
  stage_label?: string | null;
};

/** Per-pipeline DB-update + Python-call functions. */
export type PipelineSyncAdapter = {
  /** Fetch live status from Python service. */
  fetchPythonStatus: (jobId: string) => Promise<PythonStatus>;
  /** Update DB row when Python reports done/failed/progress. */
  updateDb: (params: {
    jobId: string;
    pythonStatus: PythonStatus;
    currentDbStatus?: string;
  }) => Promise<void>;
};

/** Minimal fields needed from a DB job row for the sync helper. */
export type JobRowForSync = {
  id: string;
  userId: string | null;
  status: JobStatus;
  outputUrl: string | null;
  errorMessage: string | null;
  creditCost: number | null;
  createdAt: Date | null;
  /** May be null/absent if the pipeline's DB table doesn't have this column */
  queuedAt?: Date | null;
  /** May be null/absent if the pipeline's DB table doesn't have this column */
  processingStartedAt?: Date | null;
  /** May be null/absent if the pipeline's DB table doesn't have this column */
  completedAt?: Date | null;
};

/**
 * Unified sync — shared across all pipelines.
 * @param job - Current DB row (already fetched + ownership-verified by the route)
 * @param adapter - Pipeline-specific Python call + DB update
 * @returns Unified JobStatusResult ready for JSON response
 */
export async function syncJobStatus(
  job: JobRowForSync,
  adapter: PipelineSyncAdapter,
): Promise<JobStatusResult> {
  const isInProgress =
    job.status === 'pending' ||
    job.status === 'queued' ||
    job.status === 'processing';

  if (!isInProgress) {
    return {
      jobId: job.id,
      status: job.status,
      outputUrl: job.outputUrl,
      errorMessage: job.errorMessage,
      creditCost: job.creditCost ?? undefined,
      createdAt: job.createdAt?.toISOString() ?? undefined,
      queuedAt: job.queuedAt?.toISOString() ?? undefined,
      processingStartedAt: job.processingStartedAt?.toISOString() ?? undefined,
      completedAt: job.completedAt?.toISOString() ?? undefined,
    };
  }

  let pythonStatus: PythonStatus;
  try {
    pythonStatus = await adapter.fetchPythonStatus(job.id);
  } catch {
    // Python unreachable — fall back to DB state
    return {
      jobId: job.id,
      status: job.status,
      outputUrl: job.outputUrl,
      errorMessage: job.errorMessage,
      creditCost: job.creditCost ?? undefined,
      createdAt: job.createdAt?.toISOString() ?? undefined,
      queuedAt: job.queuedAt?.toISOString() ?? undefined,
      processingStartedAt: job.processingStartedAt?.toISOString() ?? undefined,
      completedAt: job.completedAt?.toISOString() ?? undefined,
    };
  }

  // Sync DB with Python's latest view of this job
  await adapter.updateDb({
    jobId: job.id,
    pythonStatus,
    currentDbStatus: job.status,
  });

  return {
    jobId: job.id,
    status: pythonStatus.status as JobStatus,
    outputUrl: pythonStatus.output_url ?? null,
    errorMessage: pythonStatus.error ?? null,
    progress: pythonStatus.progress ?? undefined,
    stageLabel: pythonStatus.stage_label ?? undefined,
    outputs: pythonStatus.outputs ?? undefined,
    outputWidth: pythonStatus.output_width ?? undefined,
    outputHeight: pythonStatus.output_height ?? undefined,
    processingMs: pythonStatus.processing_ms ?? undefined,
    creditCost: job.creditCost ?? undefined,
    createdAt: job.createdAt?.toISOString() ?? undefined,
    queuedAt: job.queuedAt?.toISOString() ?? undefined,
    processingStartedAt: job.processingStartedAt?.toISOString() ?? undefined,
    completedAt: job.completedAt?.toISOString() ?? undefined,
  };
}
