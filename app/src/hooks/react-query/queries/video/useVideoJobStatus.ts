/**
 * useVideoJobStatus — React Query query hook for GET /api/videos/:id/status
 *
 * Polls every `pollIntervalMs` milliseconds when the job is still processing.
 * Pass `undefined` as pollIntervalMs to disable polling.
 */
import { useQuery } from '@tanstack/react-query';
import type { VideoJobStatusResponse } from '@/types/videoEnhancement';

interface Options {
  /** Poll interval in ms. Pass undefined to disable polling. */
  pollIntervalMs?: number;
}

export function useVideoJobStatus(
  videoId: string | null,
  jobId: string | null,
  { pollIntervalMs }: Options = {},
) {
  const enabled = Boolean(videoId && jobId);

  return useQuery({
    queryKey: ['video-job-status', videoId, jobId],
    queryFn: async (): Promise<VideoJobStatusResponse> => {
      const url = `/api/videos/${videoId}/status${jobId ? `?jobId=${jobId}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `Status fetch failed: ${res.status}`);
      }
      return res.json();
    },
    enabled,
    // Disable refetch when not polling
    refetchInterval: pollIntervalMs,
    refetchIntervalInBackground: false,
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10_000),
  });
}
