/**
 * Shared types for all processing pipelines (image enhancer, video, bg-remover).
 *
 * Every pipeline shares the same lifecycle:
 *   submit → Python queues → poll/status syncs Python→DB → webhook updates DB → UI invalidates cache
 */

/* ── Status enum ─────────────────────────────────────────────── */

export const EJobStatus = {
  PENDING: 'pending',
  QUEUED: 'queued',
  PROCESSING: 'processing',
  DONE: 'done',
  FAILED: 'failed',
  ERROR: 'error',
} as const;

export type JobStatus = (typeof EJobStatus)[keyof typeof EJobStatus];

export function isTerminal(status: string): status is 'done' | 'failed' | 'error' {
  return status === 'done' || status === 'failed' || status === 'error';
}

/* ── Pipeline identifiers ───────────────────────────────────── */

export const EPipeline = {
  IMAGE_ENHANCER: 'image-enhancer',
  VIDEO: 'video',
  BG_REMOVER: 'bg-remover',
} as const;
export type Pipeline = (typeof EPipeline)[keyof typeof EPipeline];

/* ── Unified submit result ──────────────────────────────────── */

export type SubmitJobResult = {
  jobId: string;
};

/* ── Unified status response ─────────────────────────────────── */

export type JobStatusResult = {
  jobId: string;
  status: JobStatus;
  outputUrl: string | null;
  errorMessage: string | null;
  progress?: number | null;
  stageLabel?: string | null;
  outputs?: string[] | null;
  outputWidth?: number | null;
  outputHeight?: number | null;
  processingMs?: number | null;
  creditCost?: number | null;
  createdAt?: string | null;
  queuedAt?: string | null;
  processingStartedAt?: string | null;
  completedAt?: string | null;
};

/* ── Python service response shapes ──────────────────────────── */

export type PythonJobStatus = {
  job_id: string;
  status: JobStatus;
  output_url?: string | null;
  outputs?: string[] | null;
  output_width?: number | null;
  output_height?: number | null;
  error?: string | null;
  processing_ms?: number | null;
  progress?: number | null;
  stage_label?: string | null;
};

/* ── DB row shape (for webhook / sync) ─────────────────────── */

export type DbJobRow = {
  id: string;
  userId: string | null;
  status: JobStatus;
  outputUrl: string | null;
  errorMessage: string | null;
  creditCost: number | null;
  createdAt: Date | null;
  queuedAt: Date | null;
  processingStartedAt: Date | null;
  completedAt: Date | null;
};

/* ── Polling config ─────────────────────────────────────────── */

export type PollingConfig = {
  /** How often the client re-fetches status (ms). Shared across all pipelines. */
  readonly intervalMs: number;
  /** Max polls before declaring timeout. Shared across all pipelines. */
  readonly maxPolls: number;
  /** Backend timeout in seconds (for logging / server-side cleanup hooks). */
  readonly backendTimeoutSecs: number;
};

/* ── React Query key factory ────────────────────────────────── */

export class ReactQueryKeys {
  private constructor() {}

  static jobStatus(pipeline: Pipeline, jobId: string): string[] {
    return ['job-status', pipeline, jobId];
  }

  static jobHistory(pipeline: Pipeline): string[] {
    return ['job-history', pipeline];
  }

  static credits(): string[] {
    return ['credits'];
  }
}
