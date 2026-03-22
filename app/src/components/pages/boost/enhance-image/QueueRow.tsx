'use client';

import type { QueueRowViewModel } from './queueRowViewModel';
import { AlertCircle, Check, Loader2, Maximize2, Sparkles, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EQueueStatus } from '@/enums/enhancer';

import {
  ENHANCER_QUEUE_GRID_CLASS,
  ENHANCER_QUEUE_ROW_GAP_CLASS,
  ENHANCER_QUEUE_STATUS_INNER_GAP_CLASS,
} from './constants';
import { EnhancerOutputDownloadButton } from './EnhancerOutputDownloadButton';

export type { QueueRowViewModel } from './queueRowViewModel';

type Props = {
  model: QueueRowViewModel;
  onRemove: () => void;
  /** Opens full result modal (before/after) when processing is done */
  onOpenPreview?: () => void;
};

function fmtMp(w: number, h: number) {
  const mp = (w * h) / 1_000_000;
  return mp >= 10 ? `${mp.toFixed(0)} MP` : `${mp.toFixed(1)} MP`;
}

function fmtDim(w: number, h: number) {
  return `${w.toLocaleString()} × ${h.toLocaleString()} px`;
}

function fmtPrintSize(w: number, h: number) {
  const inW = w / 300;
  const inH = h / 300;
  const cmW = inW * 2.54;
  const cmH = inH * 2.54;
  const fmt2 = (n: number) => n.toFixed(2);
  return `${fmt2(inW)} × ${fmt2(inH)}" (${fmt2(cmW)} × ${fmt2(cmH)} cm) · 300 DPI`;
}

/** Icon-only control — matches the row delete button (size, radius, hover). */
const ROW_ICON_BUTTON_CLASS =
  'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/10 hover:text-foreground';

const ROW_DELETE_BUTTON_CLASS =
  'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-500/12 hover:text-red-400';

export const QueueRow = (props: Props) => {
  const t = useTranslations('Enhancer');
  const { model } = props;
  const ext = model.fileName.split('.').pop()?.toUpperCase() ?? 'IMG';
  const hasInput = model.width != null && model.height != null;
  const estimatedW = hasInput ? Math.round(model.width! * model.scaleFactor) : null;
  const estimatedH = hasInput ? Math.round(model.height! * model.scaleFactor) : null;
  // After Done, show real dimensions from server (matches downloaded file)
  const hasActualOut =
    model.status === EQueueStatus.Done && model.outputWidth != null && model.outputHeight != null;
  const outW = hasActualOut ? model.outputWidth! : estimatedW;
  const outH = hasActualOut ? model.outputHeight! : estimatedH;
  const differsFromEstimate =
    hasActualOut &&
    estimatedW != null &&
    estimatedH != null &&
    (model.outputWidth !== estimatedW || model.outputHeight !== estimatedH);

  const canPreview =
    model.status === EQueueStatus.Done && Boolean(model.outputUrl) && Boolean(props.onOpenPreview);
  const canDownload = model.status === EQueueStatus.Done && Boolean(model.outputUrl);

  return (
    <div
      className={`${ENHANCER_QUEUE_GRID_CLASS} ${ENHANCER_QUEUE_ROW_GAP_CLASS} items-center border-b border-white/6 px-4 py-2.5 transition-colors hover:bg-white/2`}
    >
      {/* Thumbnail — data URL or remote input URL */}
      {model.status === EQueueStatus.Done && model.outputUrl && props.onOpenPreview ? (
        <button
          type="button"
          onClick={props.onOpenPreview}
          aria-label={t('modal_open_preview')}
          className="relative size-12 shrink-0 cursor-zoom-in overflow-hidden rounded-lg ring-0 transition hover:ring-2 hover:ring-brand/40"
        >
          {/* eslint-disable-next-line next/no-img-element -- preview / remote URL */}
          <img src={model.previewSrc} alt="" className="size-full object-cover" />
        </button>
      ) : (
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line next/no-img-element -- preview / remote URL */}
          <img src={model.previewSrc} alt="" className="size-full object-cover" />
        </div>
      )}

      {/* Name + badge — min-w-0 + overflow so long filenames ellipsis inside grid */}
      <div className="min-w-0 max-w-full overflow-hidden">
        <p className="truncate text-xs font-medium text-foreground" title={model.fileName}>
          {model.fileName}
        </p>
        <span className="mt-0.5 inline-block rounded bg-white/10 px-1.5 py-px text-[9px] font-bold text-subtle uppercase">
          {ext}
        </span>
      </div>

      {/* Input */}
      <div className="min-w-0 text-xs text-muted">
        {hasInput ? (
          <>
            <p>{fmtDim(model.width!, model.height!)}</p>
            <p className="text-subtle">{fmtMp(model.width!, model.height!)}</p>
          </>
        ) : (
          <span className="text-subtle">—</span>
        )}
      </div>

      {/* Output — column `gap-x` handles gutter; clip long lines */}
      <div className="min-w-0 max-w-full overflow-hidden text-xs">
        {outW && outH ? (
          <div className="space-y-0.5 break-words">
            {/* eslint-disable-next-line tailwindcss/classnames-order */}
            <p className="text-[10px] font-medium uppercase tracking-wide text-subtle">
              {t('resolution_label')}
            </p>
            <p className="text-muted">
              {fmtDim(outW, outH)}
              {' · '}
              {fmtMp(outW, outH)}
            </p>
            {differsFromEstimate && (
              <p className="text-[10px] leading-snug text-subtle">{t('output_differs_hint')}</p>
            )}
            {/* eslint-disable-next-line tailwindcss/classnames-order */}
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-subtle">
              {t('print_size_label')}
            </p>
            <p className="text-muted">{fmtPrintSize(outW, outH)}</p>
          </div>
        ) : (
          <span className="text-subtle">—</span>
        )}
      </div>

      {/* Status: fixed gap between badge column and icon column (not stretched `space-between`) */}
      <div
        className={`grid min-w-0 w-full grid-cols-[minmax(0,1fr)_auto] items-center ${ENHANCER_QUEUE_STATUS_INNER_GAP_CLASS}`}
      >
        <div className="min-w-0">
          {model.status === EQueueStatus.Error ? (
            <div
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-red-500/12 px-2 py-1"
              title={model.error ?? 'Processing failed'}
            >
              <AlertCircle size={13} className="shrink-0 text-red-400" />
              <span className="truncate text-[10px] font-medium normal-case text-red-200/90">
                {t('status_failed')}
              </span>
            </div>
          ) : model.status === EQueueStatus.Done ? (
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-emerald-500/14 px-2 py-1">
              <Check size={12} className="shrink-0 text-emerald-400" strokeWidth={2.5} />
              <span className="text-[10px] font-medium normal-case text-emerald-100/95">
                {t('status_done')}
              </span>
            </div>
          ) : model.status === EQueueStatus.Processing ? (
            <div className="inline-flex max-w-full items-center gap-2 rounded-lg bg-brand/12 px-2.5 py-1">
              <Loader2 size={12} className="shrink-0 animate-spin text-brand-light" />
              <span className="max-w-[7.5rem] truncate text-[10px] font-medium normal-case text-brand-light/95">
                {t('status_processing')}
              </span>
            </div>
          ) : (
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-white/6 px-2 py-1">
              <Sparkles size={12} className="shrink-0 text-muted" strokeWidth={2} />
              <span className="max-w-full truncate text-left text-[10px] font-medium normal-case text-muted">
                {t('status_ready')}
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center">
            {canPreview ? (
              <button
                type="button"
                onClick={props.onOpenPreview}
                aria-label={t('modal_open_preview')}
                className={ROW_ICON_BUTTON_CLASS}
              >
                <Maximize2 size={15} strokeWidth={2} />
              </button>
            ) : null}
          </div>
          <div className="flex size-8 shrink-0 items-center justify-center">
            {canDownload && model.outputUrl ? (
              <EnhancerOutputDownloadButton
                outputUrl={model.outputUrl}
                originalFileName={model.fileName}
                ariaLabel={t('download_label')}
                iconSize={15}
                className={`${ROW_ICON_BUTTON_CLASS} disabled:pointer-events-none disabled:opacity-40`}
              />
            ) : null}
          </div>
          <button
            type="button"
            onClick={props.onRemove}
            aria-label={t('remove_item_label')}
            className={ROW_DELETE_BUTTON_CLASS}
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};
