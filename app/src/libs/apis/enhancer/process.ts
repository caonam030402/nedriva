import type { SubmitEnhancerProcessResponse } from '@/types/enhancer/processApi';
import { apiRoutes } from '@/constants/apiRoutes';
import { apiFetch } from '@/libs/apis/httpClient';

/**
 * POST `/api/process` — multipart form (file, queueItemId, ops JSON).
 * @param formData - Built by the caller (`FormData`)
 */
export async function submitEnhancerProcess(
  formData: FormData,
): Promise<SubmitEnhancerProcessResponse> {
  return apiFetch<SubmitEnhancerProcessResponse>(apiRoutes.process, {
    method: 'POST',
    body: formData,
  });
}
