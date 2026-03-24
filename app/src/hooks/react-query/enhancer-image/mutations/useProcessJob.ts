/**
 * Submits a queue item to the processing service and polls for the result.
 *
 * Usage in EnhancerUploadZone:
 *   const { submit, jobs, resumePolling, dismissJob } = useProcessJob();
 *   submit(item, ops);
 *   // jobs[item.id] contains { status, outputUrl }
 */
'use client';

import type { OpsState, QueueItem } from '@/types/enhancer-image/state';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { JOB_MAX_POLLS, JOB_POLL_INTERVAL_MS } from '@/constants/pipeline';
import { reactQueryKeys } from '@/constants/reactQueryKeys';
import { EQueueStatus } from '@/enums/enhancer-image';
import { fetchEnhancerJobStatus, uploadThenProcessEnhancer } from '@/libs/apis/enhancer-image';

export type EnhancerJobPollState = {
  jobId: string;
  status: EQueueStatus;
  outputUrl: string | null;
  outputs: string[] | null;
  outputWidth: number | null;
  outputHeight: number | null;
  error: string | null;
  processingMs: number | null;
};

const EMPTY_JOB: EnhancerJobPollState = {
  jobId: '',
  status: EQueueStatus.Processing,
  outputUrl: null,
  outputs: null,
  outputWidth: null,
  outputHeight: null,
  error: null,
  processingMs: null,
};

export function useProcessJob() {
  const queryClient = useQueryClient();
  const [jobs, setJobs] = useState<Record<string, EnhancerJobPollState>>({});
  const pollRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const _updateJob = useCallback((queueItemId: string, patch: Partial<EnhancerJobPollState>) => {
    setJobs((prev) => {
      const base = prev[queueItemId] ?? EMPTY_JOB;
      return {
        ...prev,
        [queueItemId]: { ...base, ...patch },
      };
    });
  }, []);

  const _stopPolling = useCallback((queueItemId: string) => {
    const timer = pollRefs.current[queueItemId];
    if (timer) {
      clearInterval(timer);
      delete pollRefs.current[queueItemId];
    }
  }, []);

  const _poll = useCallback(
    (queueItemId: string, jobId: string) => {
      let count = 0;

      const timer = setInterval(async () => {
        count++;
        if (count > JOB_MAX_POLLS) {
          _stopPolling(queueItemId);
          _updateJob(queueItemId, { status: EQueueStatus.Error, error: 'Timeout' });
          return;
        }

        try {
          const data = await fetchEnhancerJobStatus(jobId);
          if (data == null) {
            return;
          }

          // Backend: queued = accepted, waiting for arq worker (NOT "ready to submit again")
          // Must map to Processing — mapping to Ready caused UI to flip back + double-submit bugs
          const statusMap: Record<string, EQueueStatus> = {
            queued: EQueueStatus.Processing,
            processing: EQueueStatus.Processing,
            done: EQueueStatus.Done,
            error: EQueueStatus.Error,
          };

          _updateJob(queueItemId, {
            status: statusMap[data.status] ?? EQueueStatus.Processing,
            outputUrl: data.output_url,
            outputs: data.outputs,
            outputWidth: data.output_width,
            outputHeight: data.output_height,
            error: data.error,
            processingMs: data.processing_ms,
          });

          if (data.status === 'done' || data.status === 'error') {
            _stopPolling(queueItemId);
            void queryClient.invalidateQueries({ queryKey: reactQueryKeys.enhancer.runs() });
            if (data.status === 'done') {
              void queryClient.invalidateQueries({ queryKey: reactQueryKeys.enhancer.histories() });
            }
          }
        } catch {
          // Network error — keep polling
        }
      }, JOB_POLL_INTERVAL_MS);

      pollRefs.current[queueItemId] = timer;
    },
    [_updateJob, _stopPolling, queryClient],
  );

  /**
   * Stop polling and drop client job state (e.g. user removed the row / cleared queue).
   * Does not cancel work on the Python worker — there is no cancel endpoint yet.
   */
  const dismissJob = useCallback(
    (queueItemId: string) => {
      _stopPolling(queueItemId);
      setJobs((prev) => {
        if (!(queueItemId in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[queueItemId];
        return next;
      });
    },
    [_stopPolling],
  );

  const resumePolling = useCallback(
    (queueItemId: string, jobId: string) => {
      if (jobId.trim() === '') {
        return;
      }
      if (pollRefs.current[queueItemId]) {
        return;
      }
      _updateJob(queueItemId, {
        jobId,
        status: EQueueStatus.Processing,
        outputUrl: null,
        outputs: null,
        outputWidth: null,
        outputHeight: null,
        error: null,
        processingMs: null,
      });
      _poll(queueItemId, jobId);
    },
    [_updateJob, _poll],
  );

  const submit = useCallback(
    async (item: QueueItem, ops: OpsState) => {
      _updateJob(item.id, {
        jobId: '',
        status: EQueueStatus.Processing,
        outputUrl: null,
        outputs: null,
        outputWidth: null,
        outputHeight: null,
        error: null,
        processingMs: null,
      });

      try {
        const { jobId } = await uploadThenProcessEnhancer(
          item.id,
          item.file,
          ops,
          item.width,
          item.height,
        );
        _updateJob(item.id, { jobId, status: EQueueStatus.Processing });
        void queryClient.invalidateQueries({ queryKey: reactQueryKeys.enhancer.runs() });
        void queryClient.invalidateQueries({ queryKey: reactQueryKeys.user.credits() });
        _poll(item.id, jobId);
      } catch (err) {
        _updateJob(item.id, {
          status: EQueueStatus.Error,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    },
    [_updateJob, _poll, queryClient],
  );

  return { jobs, submit, resumePolling, dismissJob };
}
