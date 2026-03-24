import type { SubmitEnhancerProcessResponse } from '@/types/enhancer-image/processApi';
import type { OpsState } from '@/types/enhancer-image/state';
import { apiRoutes } from '@/constants/apiRoutes';
import { apiFetch } from '@/libs/apis/httpClient';

/** JSON payload to POST `/api/enhancer-image/process` */
export type SubmitEnhancerProcessBody = {
  fileKey: string;
  queueItemId: string;
  ops: OpsState;
  inputWidth?: number;
  inputHeight?: number;
  originalFilename?: string;
};

/**
 * POST `/api/enhancer-image/process` — client already uploaded the image to R2.
 * @param body
 */
export async function submitEnhancerProcess(
  body: SubmitEnhancerProcessBody,
): Promise<SubmitEnhancerProcessResponse> {
  return apiFetch<SubmitEnhancerProcessResponse>(apiRoutes.enhancerImage.process, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Submit an enhancer job:
 *   1. Upload file to R2  (uploadFileToR2 = getPresignedUrl + PUT)
 *   2. POST /api/enhancer-image/process  (enqueue Python job)
 * @param queueItemId
 * @param file
 * @param ops
 * @param inputWidth
 * @param inputHeight
 */
export async function uploadThenProcessEnhancer(
  queueItemId: string,
  file: File,
  ops: OpsState,
  inputWidth?: number,
  inputHeight?: number,
): Promise<SubmitEnhancerProcessResponse> {
  const { uploadFileToR2 } = await import('@/libs/r2');
  const { fileKey } = await uploadFileToR2(file, queueItemId);

  return submitEnhancerProcess({
    fileKey,
    queueItemId,
    ops,
    inputWidth,
    inputHeight,
    originalFilename: file.name,
  });
}
