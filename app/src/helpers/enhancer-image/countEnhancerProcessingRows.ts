import type { EnhancerJobPollState } from '@/hooks/react-query/enhancer-image/mutations/useProcessJob';
import type { QueueItem } from '@/types/enhancer-image/state';
import type { EnhancerRunItem } from '@/types/enhancer/runsApi';
import { EQueueStatus } from '@/enums/enhancer-image';
import { enhancerRunToViewModel, queueItemToViewModel } from './queueRowViewModel';

/**
 * Counts rows that currently show as “Processing” in the enhancer table
 * (local queue + server-only runs), aligned with `tableRows` / `buildRowViewModel`.
 * @param displayQueue
 * @param runsItems
 * @param jobs
 * @param scaleFactor
 */
export function countEnhancerProcessingRows(
  displayQueue: QueueItem[],
  runsItems: EnhancerRunItem[],
  jobs: Record<string, EnhancerJobPollState>,
  scaleFactor: number,
): number {
  const localIds = new Set(displayQueue.map((i) => i.id));
  let n = 0;

  for (const item of displayQueue) {
    const vm = queueItemToViewModel(item, scaleFactor);
    if (vm.status === EQueueStatus.Processing) {
      n++;
    }
  }

  const serverOnly = runsItems.filter(
    (r) =>
      r.deletedAt == null && (r.clientQueueItemId == null || !localIds.has(r.clientQueueItemId)),
  );

  for (const run of serverOnly) {
    const pollKey = run.clientQueueItemId ?? run.id;
    const vm = enhancerRunToViewModel(run, jobs[pollKey]);
    if (vm.status === EQueueStatus.Processing) {
      n++;
    }
  }

  return n;
}

/**
 * Ready + Processing rows (local + server-only), same merge rules as the table.
 * @param displayQueue
 * @param runsItems
 * @param jobs
 * @param scaleFactor
 */
export function countEnhancerReadyPlusProcessingRows(
  displayQueue: QueueItem[],
  runsItems: EnhancerRunItem[],
  jobs: Record<string, EnhancerJobPollState>,
  scaleFactor: number,
): number {
  const localIds = new Set(displayQueue.map((i) => i.id));
  let n = 0;

  for (const item of displayQueue) {
    const vm = queueItemToViewModel(item, scaleFactor);
    if (vm.status === EQueueStatus.Ready || vm.status === EQueueStatus.Processing) {
      n++;
    }
  }

  const serverOnly = runsItems.filter(
    (r) =>
      r.deletedAt == null && (r.clientQueueItemId == null || !localIds.has(r.clientQueueItemId)),
  );

  for (const run of serverOnly) {
    const pollKey = run.clientQueueItemId ?? run.id;
    const vm = enhancerRunToViewModel(run, jobs[pollKey]);
    if (vm.status === EQueueStatus.Ready || vm.status === EQueueStatus.Processing) {
      n++;
    }
  }

  return n;
}
