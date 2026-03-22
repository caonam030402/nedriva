'use client';

import type { EnhancerPreviewTarget } from './useEnhancerUploadZone';
import type { EScaleFactor } from '@/enums/enhancer';
import { Images, Loader2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { DropZone } from '@/components/ui/DropZone';
import { Tabs } from '@/components/ui/Tabs';
import { EQueueStatus } from '@/enums/enhancer';
import { Link } from '@/libs/i18n/I18nNavigation';
import { enhancerRunToHistoryItem } from '@/utils/enhancerRunToHistoryItem';
import { Routes } from '@/utils/Routes';
import {
  ENHANCER_QUEUE_GRID_CLASS,
  ENHANCER_QUEUE_ROW_GAP_CLASS,
  FILE_LIST_HEADERS,
  UPSCALE_MODELS,
} from '../constants';
import { EnhanceResultModal } from '../EnhanceResultModal';
import { OperationsPanel } from '../OperationsPanel';
import { PresetsPanel } from '../PresetsPanel';
import { QueueRow } from '../QueueRow';
import { useEnhancerUploadZone } from './useEnhancerUploadZone';

export const EnhancerUploadZone = () => {
  const t = useTranslations('Enhancer');
  const {
    displayQueue,
    tableRows,
    buildRowViewModel,
    runsItems,
    ops,
    setOps,
    creditsPerJob,
    enhanceBatchCredits,
    addFiles,
    onRejectedFileTypes,
    removeLocalItem,
    removeServerRun,
    clearQueue,
    handleEnhance,
    reprocessItemAtScale,
    hasReadyLocalItems,
    serverRunsTotal,
    loadedServerItemsCount,
    hasNextRunsPage,
    isFetchingNextRunsPage,
    loadMoreSentinelRef,
    setListScrollRoot,
  } = useEnhancerUploadZone();

  const [preview, setPreview] = useState<EnhancerPreviewTarget | null>(null);

  const modalModelLabel = UPSCALE_MODELS.find(m => m.id === ops.upscaleModel)?.label ?? 'Prime';

  const modalPayload = useMemo(() => {
    if (preview == null) {
      return null;
    }
    if (preview.kind === 'local') {
      const item = displayQueue.find(i => i.id === preview.id) ?? null;
      if (item == null) {
        return null;
      }
      return {
        kind: 'queue' as const,
        item,
        modelLabel: modalModelLabel,
        onReprocessAtScale: (factor: EScaleFactor) => reprocessItemAtScale(item, factor),
      };
    }
    const run = runsItems.find(r => r.id === preview.runId) ?? null;
    if (run == null) {
      return null;
    }
    return { kind: 'history' as const, item: enhancerRunToHistoryItem(run) };
  }, [preview, displayQueue, runsItems, modalModelLabel, reprocessItemAtScale]);

  const panelTabs = [
    { id: 'operations', label: t('tab_operations') },
    { id: 'presets', label: t('tab_presets') },
  ];

  const colLabels: Record<string, string> = {
    name: t('col_name'),
    input: t('col_input'),
    output: t('col_output'),
    status: t('col_status'),
  };

  const showRunsChrome = tableRows.length > 0 || serverRunsTotal > 0;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden lg:flex-row">
      <EnhanceResultModal payload={modalPayload} onClose={() => setPreview(null)} />

      {/* ══ LEFT PANEL ══════════════════════════════════════════ */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-b border-white/8 lg:border-r lg:border-b-0">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/8 px-4 py-2.5">
          <span className="text-[10px] font-bold tracking-widest text-subtle uppercase">
            {t('queue_header')}
          </span>
          <div className="flex items-center gap-4">
            <Link
              href={Routes.dashboard.history}
              className="flex cursor-pointer items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
            >
              <Images size={13} strokeWidth={2} />
              {t('history_nav_my_images')}
            </Link>
            <button
              type="button"
              onClick={clearQueue}
              className="flex cursor-pointer items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
            >
              <Trash2 size={13} />
              {t('clear')}
            </button>
          </div>
        </div>

        {/* One scroll region for upload + queue (desktop); mobile flows naturally */}
        <div
          ref={setListScrollRoot}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:min-h-0 lg:overflow-y-auto"
        >
          <DropZone
            onFiles={addFiles}
            onRejectedFiles={onRejectedFileTypes}
            accept="image/jpeg,image/png,image/webp,image/tiff"
            multiple
            hint={t('upload_hint')}
            className="mx-4 my-3 shrink-0"
          />

          {showRunsChrome && (
            <div className="shrink-0">
              {tableRows.length > 0 && (
                <>
                  <div
                    className={`${ENHANCER_QUEUE_GRID_CLASS} ${ENHANCER_QUEUE_ROW_GAP_CLASS} border-b border-white/6 px-4 py-1.5`}
                  >
                    {FILE_LIST_HEADERS.map(h => (
                      <p
                        key={h.key}
                        className={
                          h.key === 'status'
                            ? 'text-left text-[10px] font-semibold tracking-wide text-subtle uppercase'
                            : 'text-[10px] font-semibold tracking-wide text-subtle uppercase'
                        }
                      >
                        {h.key in colLabels ? colLabels[h.key] : ''}
                      </p>
                    ))}
                  </div>
                  {tableRows.map((row) => {
                    const model = buildRowViewModel(row);
                    const onRemove
                      = row.kind === 'local'
                        ? () => removeLocalItem(row.item.id)
                        : () =>
                            void removeServerRun(row.run.id, row.run.clientQueueItemId ?? row.run.id);
                    const openPreview
                      = row.kind === 'local'
                        ? () => setPreview({ kind: 'local', id: row.item.id })
                        : () => setPreview({ kind: 'server', runId: row.run.id });
                    return (
                      <QueueRow
                        key={model.rowKey}
                        model={model}
                        onRemove={onRemove}
                        onOpenPreview={
                          model.status === EQueueStatus.Done && model.outputUrl
                            ? openPreview
                            : undefined
                        }
                      />
                    );
                  })}
                </>
              )}

              {serverRunsTotal > 0 && (
                <p className="border-t border-white/6 px-4 py-2 text-[10px] text-subtle">
                  {t('queue_loaded_summary', {
                    loaded: loadedServerItemsCount,
                    total: serverRunsTotal,
                  })}
                </p>
              )}

              <div ref={loadMoreSentinelRef} className="h-px w-full shrink-0" aria-hidden />

              {isFetchingNextRunsPage && (
                <div
                  className="flex items-center justify-center gap-2 border-t border-white/6 px-4 py-4 text-[11px] text-subtle"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="size-4 shrink-0 animate-spin opacity-80" aria-hidden />
                  {t('queue_loading_more')}
                </div>
              )}

              {!hasNextRunsPage && loadedServerItemsCount > 0 && serverRunsTotal > 0
                && loadedServerItemsCount >= serverRunsTotal
                ? (
                    <p className="border-t border-white/6 px-4 py-3 text-center text-[10px] text-subtle">
                      {t('queue_end_of_list')}
                    </p>
                  )
                : null}
            </div>
          )}
        </div>
      </div>

      {/* ══ RIGHT PANEL ═════════════════════════════════════════ */}
      <div
        className={
          'flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-white/8 '
          + 'h-[clamp(260px,55vh,620px)] min-h-[200px] '
          + 'lg:h-full lg:max-h-none lg:min-h-0 lg:w-72 lg:shrink-0 lg:border-t-0 xl:w-80'
        }
      >
        <Tabs
          tabs={panelTabs}
          defaultTab="operations"
          className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden"
        >
          {activeTab =>
            activeTab === 'operations'
              ? (
                  <OperationsPanel
                    ops={ops}
                    setOps={setOps}
                    credits={enhanceBatchCredits}
                    hasFiles={hasReadyLocalItems}
                    onEnhance={handleEnhance}
                  />
                )
              : (
                  <PresetsPanel credits={creditsPerJob} />
                )}
        </Tabs>
      </div>
    </div>
  );
};
