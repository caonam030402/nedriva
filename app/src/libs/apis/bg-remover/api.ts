/**
 * Background remover — browser → Next.js routes.
 */
import type {
  BgRemovalCreateJobResponse,
  BgRemovalJobStatusResponse,
} from '@/types/bg-remover/api';
import { apiRoutes } from '@/constants/apiRoutes';

/**
 * Create a background removal job.
 * Caller must upload the image to R2 first using `getPresignedUploadUrl` from imageStorage.
 * @param fileKey
 */
export async function createBgRemovalJob(
  fileKey: string,
): Promise<BgRemovalCreateJobResponse> {
  const res = await fetch(apiRoutes.bgRemover.createJob, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileKey }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Failed to create job: ${res.status}`);
  }

  return res.json() as Promise<BgRemovalCreateJobResponse>;
}

/**
 * Poll job status.
 * @param jobId
 */
export async function fetchBgRemovalJobStatus(
  jobId: string,
): Promise<BgRemovalJobStatusResponse> {
  const res = await fetch(apiRoutes.bgRemover.getJob(jobId));

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Failed to fetch job status: ${res.status}`);
  }

  return res.json() as Promise<BgRemovalJobStatusResponse>;
}
