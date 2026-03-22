/**
 * Typed HTTP client for the Python processing service.
 * Used by Next.js API routes (server-side only — contains secret key).
 */

import type { OpsState } from '@/types/enhancer';
import { ESizeMode, EUpscaleModel } from '@/enums/enhancer';

const BASE_URL = process.env.PYTHON_SERVICE_URL ?? 'http://localhost:8000';
const API_KEY = process.env.PYTHON_SERVICE_API_KEY ?? '';

export type JobStatus = 'queued' | 'processing' | 'done' | 'error';

export type EnqueueResponse = {
  job_id: string;
  status: JobStatus;
};

export type JobStatusResponse = {
  job_id: string;
  queue_item_id: string;
  status: JobStatus;
  output_url: string | null;
  outputs: string[] | null;
  output_width: number | null;
  output_height: number | null;
  error: string | null;
  processing_ms: number | null;
  metadata: Record<string, unknown>;
};

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
}

/**
 * Upload a File to the processing service and enqueue a job.
 * @param imageUrl
 * @param queueItemId
 * @param ops
 */
export async function enqueueProcessing(
  imageUrl: string,
  queueItemId: string,
  ops: OpsState,
): Promise<EnqueueResponse> {
  // Python schema expects scale_factor as string ('1','2','4',…). For Auto, backend
  // uses AUTO_UPSCALE_SCALE (default 2); this value is ignored for Auto but kept for logs.
  const scaleFactor = ops.sizeMode === ESizeMode.Scale ? String(ops.scaleFactor) : '2';

  const body = {
    queue_item_id: queueItemId,
    image_url: imageUrl,
    upscale_enabled: ops.upscaleEnabled,
    upscale_model: ops.upscaleModel,
    more_model: ops.upscaleModel === EUpscaleModel.More ? ops.moreModel : null,
    size_mode: ops.sizeMode,
    scale_factor: scaleFactor,
    custom_width: ops.sizeMode === ESizeMode.Custom ? ops.customWidth : null,
    custom_height: ops.sizeMode === ESizeMode.Custom ? ops.customHeight : null,
    light_ai_enabled: ops.lightAIEnabled,
    light_ai_intensity: ops.lightAIIntensity,
    remove_bg_enabled: ops.removeBgEnabled,
    bg_type: ops.bgType,
    clip_to_object: ops.clipToObject,
  };

  const res = await fetch(`${BASE_URL}/api/v1/process`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Processing service error ${res.status}: ${text}`);
  }

  return res.json() as Promise<EnqueueResponse>;
}

/**
 * Poll job status from the Python service.
 * @param jobId
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/jobs/${jobId}`, {
    headers: headers(),
    next: { revalidate: 0 }, // always fresh
  });

  if (!res.ok) {
    throw new Error(`Job status error ${res.status}`);
  }

  return res.json() as Promise<JobStatusResponse>;
}
