import type { EnhancerJobPollState } from '@/hooks/react-query/mutations/enhance/useProcessJob';
import type { QueueItem } from '@/types/enhancer';
import type { EnhancerRunItem } from '@/types/enhancer/runsApi';
import { EQueueStatus } from '@/enums/enhancer';

/** Flat props for one queue table row (local file or server-backed run). */
export type QueueRowViewModel = {
  rowKey: string;
  previewSrc: string;
  fileName: string;
  width: number | null;
  height: number | null;
  status: EQueueStatus;
  outputUrl: string | null;
  outputWidth: number | null;
  outputHeight: number | null;
  error: string | null;
  scaleFactor: number;
};

export function queueItemToViewModel(item: QueueItem, scaleFactor: number): QueueRowViewModel {
  return {
    rowKey: item.id,
    previewSrc: item.preview,
    fileName: item.file.name,
    width: item.width ?? null,
    height: item.height ?? null,
    status: item.status,
    outputUrl: item.outputUrl ?? null,
    outputWidth: item.outputWidth ?? null,
    outputHeight: item.outputHeight ?? null,
    error: item.error ?? null,
    scaleFactor,
  };
}

function dbRunStatusToEQueue(s: EnhancerRunItem['status']): EQueueStatus {
  if (s === 'queued' || s === 'processing') {
    return EQueueStatus.Processing;
  }
  if (s === 'done') {
    return EQueueStatus.Done;
  }
  return EQueueStatus.Error;
}

/**
 * Merge API run row with optional live poll state (same correlation key as `useProcessJob`).
 * @param run - Row from `GET /api/enhancer/runs`
 * @param poll - Live state from `jobs[pollKey]` when polling
 */
export function enhancerRunToViewModel(
  run: EnhancerRunItem,
  poll: EnhancerJobPollState | undefined,
): QueueRowViewModel {
  const baseStatus = dbRunStatusToEQueue(run.status);
  const status = poll?.status ?? baseStatus;
  const outputUrl = poll?.outputUrl ?? run.outputUrl ?? null;
  const outputWidth = poll?.outputWidth ?? run.outputWidth ?? null;
  const outputHeight = poll?.outputHeight ?? run.outputHeight ?? null;
  const error = poll?.error ?? run.errorMessage ?? null;

  return {
    rowKey: `run:${run.id}`,
    previewSrc: run.inputUrl ?? '',
    fileName: run.originalFilename,
    width: run.inputWidth,
    height: run.inputHeight,
    status,
    outputUrl,
    outputWidth,
    outputHeight,
    error,
    scaleFactor: run.effectiveScaleFactor,
  };
}
