/**
 * useUploadVideo — React Query mutation hook for POST /api/videos/upload
 */
import { useMutation } from '@tanstack/react-query';
import type { UploadVideoResponse } from '@/types/videoEnhancement';

export function useUploadVideo() {
  return useMutation({
    mutationFn: async (formData: FormData): Promise<UploadVideoResponse> => {
      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `Upload failed: ${res.status}`);
      }
      return res.json();
    },
  });
}
