/**
 * Shared TypeScript types for the video enhancement feature.
 * Uses camelCase for API responses; snake_case lives in `videoProcessingClient.ts`.
 */
import type {
  EEnhancementStyle,
  EUpscaleLevel,
  EVideoOutputFormat,
  EVideoOutputSize,
  EVideoStatus,
} from '@/enums/enhancer-video';

export {
  EEnhancementStyle,
  EUpscaleLevel,
  EVideoOutputFormat,
  EVideoOutputSize,
  EVideoStatus,
} from '@/enums/enhancer-video';

/* ── API request / response shapes ───────────────────────────── */

/** Sent in POST /api/videos/enhance */
export type VideoEnhanceOptions = {
  upscaleFactor: EUpscaleLevel;
  denoise: boolean;
  deblur: boolean;
  faceEnhance: boolean;
  style: EEnhancementStyle;
};

/** Upload response */
export type UploadVideoResponse = {
  videoId: string;
  inputUrl: string;
  metadata: {
    durationSecs: number;
    width: number;
    height: number;
    fps: number;
    sizeBytes: number;
  } | null;
};

/** POST /api/videos/upload-url response — presigned PUT URL for direct R2 upload */
export type GetUploadUrlResponse = {
  videoId: string;
  uploadUrl: string;
  inputUrl: string;
  expiresAt: string;
};

/** Enhancement job response */
export type EnhanceVideoResponse = {
  jobId: string;
  videoId: string;
  status: EVideoStatus;
  creditCost: number;
};

/** Job status response */
export type VideoJobStatusResponse = {
  videoId: string;
  jobId: string;
  status: EVideoStatus;
  progress: number;
  stageLabel: string | null;
  options: VideoEnhanceOptions;
  creditCost: number;
  errorMessage: string | null;
  createdAt: string | null;
  queuedAt: string | null;
  processingStartedAt: string | null;
  completedAt: string | null;
};

/** Result download response */
export type VideoResultResponse = {
  downloadUrl?: string;
  expiresAt?: string;
  /** Returned when status is not 'done' */
  status?: EVideoStatus;
  progress?: number;
  stageLabel?: string | null;
  /** Returned when job failed */
  error?: string;
  reason?: string;
};

/* ── Type aliases (backward compat) ─────────────────────────── */

export type VideoJobStatus = EVideoStatus;
/** Wire / UI values — string union so literals match `SegmentedControl` ids */
export type VideoOutputSize = `${EVideoOutputSize}`;
export type VideoOutputFormat = `${EVideoOutputFormat}`;
