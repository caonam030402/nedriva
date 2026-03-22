/**
 * useEnhanceVideo — React Query mutation hook for POST /api/videos/enhance
 */
import { useMutation } from '@tanstack/react-query';
import type { EnhanceVideoResponse, VideoEnhanceOptions } from '@/types/videoEnhancement';

interface EnhanceVideoVariables {
  videoId: string;
  options: VideoEnhanceOptions;
}

export function useEnhanceVideo() {
  return useMutation({
    mutationFn: async (vars: EnhanceVideoVariables): Promise<EnhanceVideoResponse> => {
      const res = await fetch('/api/videos/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `Enhance failed: ${res.status}`);
      }
      return res.json();
    },
  });
}
