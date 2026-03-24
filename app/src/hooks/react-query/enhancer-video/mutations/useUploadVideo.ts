import type { UploadVideoResponse } from '@/types/enhancer-video/videoEnhancement';
/**
 * useUploadVideo — React Query mutation hook.
 *
 * Upload flow (browser → R2 directly):
 *   1. POST /api/enhancer-video/upload-url  →  presigned PUT URL
 *   2. PUT {uploadUrl}              →  video bytes straight to R2
 *   3. POST /api/enhancer-video/upload     →  probe metadata, update DB record
 *
 * Skips the Next.js server entirely for the raw bytes — no body-size limits.
 * Uses XMLHttpRequest for R2 PUT so we can track real upload progress.
 */
import { useMutation } from '@tanstack/react-query';

type UploadVariables = {
  file: File;
  onProgress?: (pct: number) => void;
};

async function uploadVideoToR2({
  file,
  onProgress,
}: UploadVariables): Promise<UploadVideoResponse> {
  // 1. Get presigned PUT URL
  const urlRes = await fetch('/api/enhancer-video/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    }),
  });
  if (!urlRes.ok) {
    const err = await urlRes.json().catch(() => ({ error: urlRes.statusText }));
    throw new Error(err.error ?? `Failed to get upload URL: ${urlRes.status}`);
  }
  const { videoId, uploadUrl } = (await urlRes.json()) as { videoId: string; uploadUrl: string };

  // 2. Upload file bytes directly to R2 with progress tracking
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`R2 upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('R2 upload network error')));

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });

  // 3. Finalize — probe metadata + update DB
  const finalizeRes = await fetch('/api/enhancer-video/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId }),
  });
  if (!finalizeRes.ok) {
    const err = await finalizeRes.json().catch(() => ({ error: finalizeRes.statusText }));
    throw new Error(err.error ?? `Failed to finalize upload: ${finalizeRes.status}`);
  }
  return finalizeRes.json() as Promise<UploadVideoResponse>;
}

export function useUploadVideo() {
  return useMutation({
    mutationFn: uploadVideoToR2,
  });
}
