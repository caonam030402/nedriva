'use client';

import type { EScaleFactor } from '@/enums/enhancer-image';
import type { EnhancerRunItem } from '@/types/enhancer-image/runsApi';
import type { OpsState, QueueItem } from '@/types/enhancer-image/state';
import { toast } from '@heroui/react/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  calcCredits,
  ENHANCER_MAX_CONCURRENT_PROCESSING,
  ENHANCER_MAX_LOCAL_QUEUE_ITEMS,
  ENHANCER_MAX_UPLOAD_FILE_BYTES,
  ENHANCER_MAX_UPLOAD_FILE_MB,
  ENHANCER_QUEUE_TABLE_PAGE_SIZE,
  INITIAL_OPS,
} from '@/constants/enhancer-image/enhancerImage';
import { reactQueryKeys } from '@/constants/reactQueryKeys';
import { EQueueStatus, ESizeMode } from '@/enums/enhancer-image';
import { countEnhancerReadyPlusProcessingRows } from '@/helpers/enhancer-image/countEnhancerProcessingRows';
import {
  enhancerRunToViewModel,
  queueItemToViewModel,
} from '@/helpers/enhancer-image/queueRowViewModel';
import { useProcessJob } from '@/hooks/react-query/enhancer-image/mutations/useProcessJob';
import { useEnhancerRunsInfiniteQuery } from '@/hooks/react-query/enhancer-image/queries';
import { userCreditBalanceQueryOptions } from '@/hooks/react-query/user/queries/useUserCreditBalanceQuery';
import { useInfiniteScrollTrigger } from '@/hooks/useInfiniteScrollTrigger';
import { deleteEnhancerRun } from '@/libs/apis/enhancer-image';

export type EnhancerTableRow =
  | { kind: 'local'; item: QueueItem }
  | { kind: 'server'; run: EnhancerRunItem };

export type EnhancerPreviewTarget =
  | { kind: 'local'; id: string }
  | { kind: 'server'; runId: string };

export function useEnhancerUploadZone() {
  const t = useTranslations('Enhancer');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const queueRef = useRef<QueueItem[]>([]);
  const [ops, setOps] = useState<OpsState>(INITIAL_OPS);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const queryClient = useQueryClient();

  const pageSize = ENHANCER_QUEUE_TABLE_PAGE_SIZE;
  const [listScrollRoot, setListScrollRoot] = useState<HTMLDivElement | null>(null);

  const runsInfinite = useEnhancerRunsInfiniteQuery({ limit: pageSize });

  const {
    data: runsInfiniteData,
    refetch: refetchRuns,
    isPending: runsPending,
    isError: runsError,
    isFetching: runsFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = runsInfinite;

  const pages = runsInfiniteData?.pages;
  const firstPage = pages?.[0];
  const serverRunsTotal =
    firstPage?.pagination.page != null ? (firstPage.pagination.total ?? 0) : 0;

  const flatPagedItems: EnhancerRunItem[] = useMemo(() => {
    const acc: EnhancerRunItem[] = [];
    for (const p of pages ?? []) {
      acc.push(...p.items);
    }
    return acc;
  }, [pages]);

  /** `activeItems` is repeated on every response — keep only the latest chunk’s copy. */
  const latestActiveItems: EnhancerRunItem[] = useMemo(() => {
    const list = pages ?? [];
    if (list.length === 0) {
      return [];
    }
    return list[list.length - 1]?.activeItems ?? [];
  }, [pages]);

  const { jobs, submit, resumePolling, dismissJob } = useProcessJob();

  /** Flattened paged items + latest `activeItems` — polling, modal lookup, pipeline slot counts. */
  const runsItems: EnhancerRunItem[] = useMemo(() => {
    const map = new Map<string, EnhancerRunItem>();
    for (const r of flatPagedItems) {
      map.set(r.id, r);
    }
    for (const r of latestActiveItems) {
      map.set(r.id, r);
    }
    return [...map.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [flatPagedItems, latestActiveItems]);

  const { sentinelRef: loadMoreSentinelRef } = useInfiniteScrollTrigger({
    scrollRoot: listScrollRoot,
    enabled: !runsPending && !runsError,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  useEffect(() => {
    if (runsItems.length === 0) {
      return;
    }
    for (const run of runsItems) {
      if (run.deletedAt != null) {
        continue;
      }
      if (run.status !== 'queued' && run.status !== 'processing') {
        continue;
      }
      const key = run.clientQueueItemId ?? run.id;
      resumePolling(key, run.jobId);
    }
  }, [runsItems, resumePolling]);

  const scaleFactor = ops.upscaleEnabled
    ? ops.sizeMode === ESizeMode.Scale
      ? Number(ops.scaleFactor)
      : 4
    : 1;

  // Derive display queue by merging live job state
  const displayQueue: QueueItem[] = useMemo(
    () =>
      queue.map((item) => {
        const job = jobs[item.id];
        if (!job) {
          return item;
        }
        return {
          ...item,
          status: job.status,
          outputUrl: job.outputUrl ?? item.outputUrl,
          outputWidth: job.outputWidth ?? item.outputWidth,
          outputHeight: job.outputHeight ?? item.outputHeight,
          error: job.error ?? item.error,
        };
      }),
    [queue, jobs],
  );

  const creditsPerJob = useMemo(() => calcCredits(ops), [ops]);

  const readyLocalCount = useMemo(
    () => displayQueue.filter((i) => i.status === EQueueStatus.Ready).length,
    [displayQueue],
  );

  /**
   * Credits for the main Enhance action: one click submits every Ready row — same total the API will charge.
   * When nothing is Ready (button disabled), show per-image cost.
   */
  const enhanceBatchCredits = useMemo(
    () => creditsPerJob * (readyLocalCount > 0 ? readyLocalCount : 1),
    [creditsPerJob, readyLocalCount],
  );

  const tableRows: EnhancerTableRow[] = useMemo(() => {
    const localIds = new Set(displayQueue.map((i) => i.id));
    const serverOnly = runsItems.filter(
      (r) =>
        r.deletedAt == null && (r.clientQueueItemId == null || !localIds.has(r.clientQueueItemId)),
    );

    const locals: EnhancerTableRow[] = displayQueue.map((item) => ({ kind: 'local', item }));
    const servers: EnhancerTableRow[] = serverOnly.map((run) => ({ kind: 'server', run }));
    return [...locals, ...servers];
  }, [displayQueue, runsItems]);

  const assertCanSpendCredits = useCallback(
    async (amount: number): Promise<boolean> => {
      if (amount <= 0) {
        return true;
      }
      try {
        const balance = await queryClient.fetchQuery(userCreditBalanceQueryOptions);
        if (balance < amount) {
          toast.warning(t('toast_insufficient_credits_title'), {
            description: t('toast_insufficient_credits_description', {
              needed: amount,
              balance,
            }),
          });
          return false;
        }
        return true;
      } catch {
        toast.danger(t('toast_credits_fetch_failed_title'), {
          description: t('toast_credits_fetch_failed_description'),
        });
        return false;
      }
    },
    [queryClient, t],
  );

  const onRejectedFileTypes = useCallback(
    (rejected: File[]) => {
      if (rejected.length === 0) {
        return;
      }
      toast.danger(t('toast_upload_invalid_type_title'), {
        description: t('toast_upload_invalid_type_description'),
      });
    },
    [t],
  );

  const addFiles = (files: File[]) => {
    const maxBytes = ENHANCER_MAX_UPLOAD_FILE_BYTES;
    const oversized = files.filter((f) => f.size > maxBytes);
    const sizeOk = files.filter((f) => f.size <= maxBytes);

    if (oversized.length > 0) {
      toast.danger(t('toast_upload_file_too_large_title'), {
        description: t('toast_upload_file_too_large_description', {
          maxMb: ENHANCER_MAX_UPLOAD_FILE_MB,
        }),
      });
    }

    if (sizeOk.length === 0) {
      return;
    }

    const maxQueue = ENHANCER_MAX_LOCAL_QUEUE_ITEMS;
    const queueSlots = Math.max(0, maxQueue - queueRef.current.length);
    const activePipeline = countEnhancerReadyPlusProcessingRows(
      displayQueue,
      runsItems,
      jobs,
      scaleFactor,
    );
    const pipelineSlots = Math.max(0, ENHANCER_MAX_CONCURRENT_PROCESSING - activePipeline);
    const effectiveSlots = Math.min(queueSlots, pipelineSlots);

    if (effectiveSlots <= 0) {
      if (pipelineSlots <= 0) {
        toast.danger(t('toast_upload_pipeline_full_title'), {
          description: t('toast_upload_pipeline_full_description', {
            max: ENHANCER_MAX_CONCURRENT_PROCESSING,
          }),
        });
      } else {
        toast.danger(t('toast_upload_queue_full_title'), {
          description: t('toast_upload_queue_full_description', { max: maxQueue }),
        });
      }
      return;
    }

    const toAdd = sizeOk.slice(0, effectiveSlots);
    if (toAdd.length < sizeOk.length) {
      const pipelineBound = pipelineSlots <= queueSlots;
      if (pipelineBound) {
        toast.warning(t('toast_upload_pipeline_partial_title'), {
          description: t('toast_upload_pipeline_partial_description', {
            added: toAdd.length,
            attempted: sizeOk.length,
            max: ENHANCER_MAX_CONCURRENT_PROCESSING,
          }),
        });
      } else {
        toast.warning(t('toast_upload_queue_partial_title'), {
          description: t('toast_upload_queue_partial_description', {
            added: toAdd.length,
            attempted: sizeOk.length,
            max: maxQueue,
          }),
        });
      }
    }

    for (const f of toAdd) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () =>
          setQueue((q) => [
            ...q,
            {
              id: crypto.randomUUID(),
              file: f,
              preview: dataUrl,
              status: EQueueStatus.Ready,
              width: img.naturalWidth,
              height: img.naturalHeight,
            },
          ]);
        img.onerror = () => {
          toast.danger(t('toast_upload_corrupt_image_title'), {
            description: t('toast_upload_corrupt_image_description', { name: f.name }),
          });
        };
        img.src = dataUrl;
      };
      reader.onerror = () => {
        toast.danger(t('toast_upload_read_failed_title'), {
          description: t('toast_upload_read_failed_description', { name: f.name }),
        });
      };
      reader.readAsDataURL(f);
    }
  };

  /** Submit all Ready items in the queue for processing. */
  const handleEnhance = useCallback(async () => {
    const readyItems = displayQueue.filter((i) => i.status === EQueueStatus.Ready);
    if (readyItems.length === 0) {
      return;
    }
    const totalNeeded = creditsPerJob * readyItems.length;
    if (!(await assertCanSpendCredits(totalNeeded))) {
      return;
    }
    readyItems.forEach((item) => submit(item, ops));
  }, [assertCanSpendCredits, creditsPerJob, displayQueue, ops, submit]);

  const removeLocalItem = useCallback(
    (id: string) => {
      dismissJob(id);
      setQueue((q) => q.filter((i) => i.id !== id));
    },
    [dismissJob],
  );

  const removeServerRun = useCallback(
    async (runId: string, pollKey: string) => {
      dismissJob(pollKey);
      await deleteEnhancerRun(runId);
      await queryClient.invalidateQueries({ queryKey: reactQueryKeys.enhancer.runs() });
      await queryClient.invalidateQueries({ queryKey: reactQueryKeys.enhancer.histories() });
    },
    [dismissJob, queryClient],
  );

  const clearQueue = useCallback(() => {
    setQueue((q) => {
      for (const item of q) {
        dismissJob(item.id);
      }
      return [];
    });
  }, [dismissJob]);

  /**
   * Re-run processing for one item at a fixed scale (e.g. modal “Upscale ×4”).
   * @param item - Queue row to reset and submit again
   * @param factor - Target scale factor for the new run
   */
  const reprocessItemAtScale = (item: QueueItem, factor: EScaleFactor) => {
    const activePipeline = countEnhancerReadyPlusProcessingRows(
      displayQueue,
      runsItems,
      jobs,
      scaleFactor,
    );
    if (activePipeline >= ENHANCER_MAX_CONCURRENT_PROCESSING) {
      return;
    }
    const nextOps: OpsState = {
      ...ops,
      upscaleEnabled: true,
      sizeMode: ESizeMode.Scale,
      scaleFactor: factor,
    };
    const cost = calcCredits(nextOps);

    void (async () => {
      if (!(await assertCanSpendCredits(cost))) {
        return;
      }
      setOps(nextOps);
      setQueue((q) =>
        q.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: EQueueStatus.Ready,
                outputUrl: undefined,
                outputWidth: undefined,
                outputHeight: undefined,
                error: undefined,
              }
            : i,
        ),
      );
      submit(item, nextOps);
    })();
  };

  const buildRowViewModel = useCallback(
    (row: EnhancerTableRow) => {
      if (row.kind === 'local') {
        return queueItemToViewModel(row.item, scaleFactor);
      }
      const pollKey = row.run.clientQueueItemId ?? row.run.id;
      return enhancerRunToViewModel(row.run, jobs[pollKey]);
    },
    [jobs, scaleFactor],
  );

  return {
    displayQueue,
    tableRows,
    buildRowViewModel,
    runsItems,
    ops,
    setOps,
    creditsPerJob,
    enhanceBatchCredits,
    scaleFactor,
    addFiles,
    onRejectedFileTypes,
    removeLocalItem,
    removeServerRun,
    clearQueue,
    handleEnhance,
    reprocessItemAtScale,
    runsPending,
    runsError,
    runsFetching,
    refetchRuns,
    hasReadyLocalItems: displayQueue.some((i) => i.status === EQueueStatus.Ready),
    /** Total runs on the server (from first page meta) — “loaded / total” UI. */
    serverRunsTotal,
    loadedServerItemsCount: flatPagedItems.length,
    hasNextRunsPage: hasNextPage ?? false,
    isFetchingNextRunsPage: isFetchingNextPage,
    loadMoreSentinelRef,
    setListScrollRoot,
  };
}
