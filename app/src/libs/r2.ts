/**
 * Shared R2 upload helpers — used by all features (image, video, etc.).
 *
 * FE pattern:
 *   1. getPresignedUrl({ filename, contentType, folder })  → { uploadUrl, fileKey, url }
 *   2. uploadToR2(file, uploadUrl)                         → void
 */
import type {
  GetPresignedUploadUrlRequest,
  GetPresignedUploadUrlResponse,
} from '@/types/storage';
import { apiRoutes } from '@/constants/apiRoutes';

/**
 * Step 1 — Get a presigned PUT URL so the browser can upload directly to R2.
 * @param body  - { filename, contentType, folder }
 */
export async function getPresignedUrl(
  body: GetPresignedUploadUrlRequest,
): Promise<GetPresignedUploadUrlResponse> {
  const res = await fetch(apiRoutes.shared.uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `getPresignedUrl failed: ${res.status}`);
  }

  return res.json() as Promise<GetPresignedUploadUrlResponse>;
}

/**
 * Step 2 — Upload a File directly to R2 using the presigned PUT URL.
 * Throws on failure.
 * @param file
 * @param uploadUrl
 */
export async function uploadToR2(file: File, uploadUrl: string): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`R2 upload failed: ${res.status} ${res.statusText}`);
  }
}

/**
 * Full upload flow: get presigned URL → upload to R2 → return fileKey.
 * Convenience wrapper — equivalent to calling getPresignedUrl then uploadToR2.
 * @param file
 * @param folder
 */
export async function uploadFileToR2(
  file: File,
  folder: string,
): Promise<{ fileKey: string; url: string }> {
  const { uploadUrl, fileKey, url } = await getPresignedUrl({
    filename: file.name,
    contentType: file.type,
    folder,
  });

  await uploadToR2(file, uploadUrl);

  return { fileKey, url };
}
