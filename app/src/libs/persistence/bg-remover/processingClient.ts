import type { BgRemovalJobStatus } from '@/models/Schema';
/**
 * Processing client — calls Python FastAPI worker to process background removal.
 */
import { Env } from '@/libs/core/Env';

const PYTHON_SERVICE_URL = Env.PYTHON_SERVICE_URL;
const PYTHON_SERVICE_API_KEY = Env.PYTHON_SERVICE_API_KEY;

type EnqueueBgRemovalResponse = {
  job_id: string;
  status: string;
};

type EnqueueBgRemovalParams = {
  job_id: string;
  input_url: string;
};

/**
 * Call the Python FastAPI worker to start background removal processing.
 * @param jobId - The job ID in our database
 * @param inputUrl - The public URL of the uploaded image in R2
 */
export async function enqueueBgRemovalProcessing(
  jobId: string,
  inputUrl: string,
): Promise<EnqueueBgRemovalResponse> {
  if (!PYTHON_SERVICE_URL) {
    throw new Error('PYTHON_SERVICE_URL is not configured');
  }

  const response = await fetch(`${PYTHON_SERVICE_URL}/api/v1/background-remover/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(PYTHON_SERVICE_API_KEY ? { Authorization: `Bearer ${PYTHON_SERVICE_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      job_id: jobId,
      input_url: inputUrl,
    } satisfies EnqueueBgRemovalParams),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Background removal worker error: ${response.status} ${error}`);
  }

  return response.json() as Promise<EnqueueBgRemovalResponse>;
}

/**
 * Update job status callback from Python worker.
 * The Python worker calls this endpoint when processing is done.
 *
 * POST /api/webhooks/bg-removal
 *
 * Body: JSON
 * {
 *   job_id: string,
 *   status: "done" | "failed",
 *   output_url?: string,
 *   error?: string,
 * }
 * @param params
 * @param params.jobId
 * @param params.status
 * @param params.outputUrl
 * @param params.error
 */
export async function updateBgRemovalJobFromWorker(params: {
  jobId: string;
  status: BgRemovalJobStatus;
  outputUrl?: string;
  error?: string;
}): Promise<void> {
  const response = await fetch(`/api/bg-remover/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(PYTHON_SERVICE_API_KEY ? { Authorization: `Bearer ${PYTHON_SERVICE_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      job_id: params.jobId,
      status: params.status,
      output_url: params.outputUrl,
      error: params.error,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update job status: ${response.status}`);
  }
}
