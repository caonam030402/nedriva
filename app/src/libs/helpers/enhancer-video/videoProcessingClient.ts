/**
 * Typed HTTP client for the Python video processing service.
 * Mirrors the pattern from `processingClient.ts` (image pipeline).
 */

const BASE_URL = process.env.PYTHON_SERVICE_URL ?? 'http://localhost:8000';
const API_KEY = process.env.PYTHON_SERVICE_API_KEY ?? '';

export type VideoJobStatus = 'queued' | 'processing' | 'done' | 'failed';

export type VideoEnhanceOptions = {
  upscale_factor: 'auto' | '2x' | '4x';
  denoise: boolean;
  deblur: boolean;
  face_enhance: boolean;
  style: 'cinematic' | 'social' | 'natural';
};

export type EnqueueVideoResponse = {
  job_id: string;
  status: VideoJobStatus;
};

export type VideoJobStatusResponse = {
  job_id: string;
  status: VideoJobStatus;
  progress: number;
  stage_label: string | null;
  output_url: string | null;
  error: string | null;
};

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
}

/**
 * Enqueue a video enhancement job in the Python service.
 * The service downloads input from `inputUrl`, processes it, uploads result to R2
 * at `outputKey`, and reports completion via GET /jobs/{jobId}.
 */
export async function enqueueVideoProcessing(
  jobId: string,
  inputUrl: string,
  outputKey: string,
  options: VideoEnhanceOptions,
): Promise<EnqueueVideoResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/video/process`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ job_id: jobId, input_url: inputUrl, output_key: outputKey, options }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Video processing service error ${res.status}: ${text}`);
  }

  return res.json() as Promise<EnqueueVideoResponse>;
}

/**
 * Poll the current status + progress of a video enhancement job from the Python service.
 */
export async function getVideoJobStatus(jobId: string): Promise<VideoJobStatusResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/video/jobs/${jobId}`, {
    headers: headers(),
  });

  if (!res.ok) {
    throw new Error(`Video job status error ${res.status}`);
  }

  return res.json() as Promise<VideoJobStatusResponse>;
}
