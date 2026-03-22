/**
 * Shared TypeScript types for the video enhancement feature.
 */

/* ── API request / response shapes ───────────────────────────── */

export type VideoOutputSize = 'auto' | 'hd' | 'fhd' | '2k' | '4k';
export type VideoOutputFormat = 'auto' | 'mp4' | 'webm' | 'mov';

/** Sent in POST /api/videos/enhance */
export type VideoEnhanceOptions = {
  upscaleFactor: 'auto' | '2x' | '4x';
  denoise: boolean;
  deblur: boolean;
  faceEnhance: boolean;
  style: 'cinematic' | 'social' | 'natural';
}

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
}

/** POST /api/videos/upload-url response — presigned PUT URL for direct R2 upload */
export type GetUploadUrlResponse = {
  videoId: string;
  uploadUrl: string;
  inputUrl: string;
  expiresAt: string;
}

/** Enhancement job response */
export type EnhanceVideoResponse = {
  jobId: string;
  videoId: string;
  status: VideoJobStatus;
  creditCost: number;
}

/** Job status response */
export type VideoJobStatusResponse = {
  videoId: string;
  jobId: string;
  status: VideoJobStatus;
  progress: number;
  stageLabel: string | null;
  options: VideoEnhanceOptions;
  creditCost: number;
  errorMessage: string | null;
  createdAt: string | null;
  queuedAt: string | null;
  processingStartedAt: string | null;
  completedAt: string | null;
}

/** Result download response */
export type VideoResultResponse = {
  downloadUrl?: string;
  expiresAt?: string;
  /** Returned when status is not 'done' */
  status?: VideoJobStatus;
  progress?: number;
  stageLabel?: string | null;
  /** Returned when job failed */
  error?: string;
  reason?: string;
}

/* ── Internal types ──────────────────────────────────────────── */

export type VideoJobStatus = 'queued' | 'processing' | 'done' | 'failed';
