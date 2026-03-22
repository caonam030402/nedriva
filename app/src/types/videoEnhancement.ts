/**
 * Shared TypeScript types for the video enhancement feature.
 */

/* ── API request / response shapes ───────────────────────────── */

export type VideoOutputSize = 'auto' | 'hd' | 'fhd' | '2k' | '4k';
export type VideoOutputFormat = 'auto' | 'mp4' | 'webm' | 'mov';

/** Sent in POST /api/videos/enhance */
export interface VideoEnhanceOptions {
  upscaleFactor: 'auto' | '2x' | '4x';
  denoise: boolean;
  deblur: boolean;
  faceEnhance: boolean;
  style: 'cinematic' | 'social' | 'natural';
}

/** Upload response */
export interface UploadVideoResponse {
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

/** Enhancement job response */
export interface EnhanceVideoResponse {
  jobId: string;
  videoId: string;
  status: VideoJobStatus;
  creditCost: number;
}

/** Job status response */
export interface VideoJobStatusResponse {
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
export interface VideoResultResponse {
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
