'use client';

/**
 * Before/after result dialog — HeroUI Modal. Supports queue (live job) and history rows.
 * Compare slider when both before + after URLs exist; otherwise large output preview.
 */
import type { QueueItem } from '@/types/enhancer';
import type { EnhancerHistoryItem } from '@/types/enhancer/historyApi';
import { useOverlayState } from '@heroui/react';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseTrigger,
  ModalContainer,
  ModalDialog,
  ModalFooter,
  ModalHeader,
  ModalHeading,
} from '@heroui/react/modal';
import { Camera, Share2, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BeforeAfterCompare } from '@/components/common/BeforeAfterCompare';
import { EQueueStatus, EScaleFactor } from '@/enums/enhancer';
import { EnhancerOutputDownloadButton } from './EnhancerOutputDownloadButton';

export type EnhanceResultModalPayload =
  | {
      kind: 'queue';
      item: QueueItem;
      modelLabel: string;
      onReprocessAtScale?: (factor: EScaleFactor) => void;
    }
  | {
      kind: 'history';
      item: EnhancerHistoryItem;
    };

export type EnhanceResultModalProps = {
  payload: EnhanceResultModalPayload | null;
  onClose: () => void;
};

function MotionComingPill(props: { className?: string }) {
  const t = useTranslations('Enhancer');
  return (
    <button
      type="button"
      disabled
      className={
        props.className ??
        'pointer-events-none absolute top-14 left-5 z-20 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-neutral-800 opacity-70 shadow-sm'
      }
    >
      <Camera size={13} className="shrink-0" />
      <span>{t('modal_motion_coming')}</span>
      <Sparkles size={12} className="shrink-0 text-violet-600" />
    </button>
  );
}

export function EnhanceResultModal(props: EnhanceResultModalProps) {
  const { payload, onClose } = props;
  const t = useTranslations('Enhancer');

  const overlay = useOverlayState({
    isOpen: payload !== null,
    onOpenChange: (open) => {
      if (!open) {
        onClose();
      }
    },
  });

  if (!payload) {
    return null;
  }

  const afterUrl =
    payload.kind === 'queue'
      ? payload.item.outputUrl
      : (payload.item.outputUrl ?? payload.item.outputUrls?.[0] ?? null);

  const downloadBaseName =
    payload.kind === 'queue' ? payload.item.file.name : payload.item.originalFilename;

  const modelLabel = payload.kind === 'queue' ? payload.modelLabel : payload.item.processingLabel;

  const beforeUrl =
    payload.kind === 'queue' ? payload.item.preview : (payload.item.inputUrl ?? null);

  const inputW = payload.kind === 'queue' ? (payload.item.width ?? null) : payload.item.inputWidth;
  const inputH =
    payload.kind === 'queue' ? (payload.item.height ?? null) : payload.item.inputHeight;
  const outputW =
    payload.kind === 'queue' ? (payload.item.outputWidth ?? null) : payload.item.outputWidth;
  const outputH =
    payload.kind === 'queue' ? (payload.item.outputHeight ?? null) : payload.item.outputHeight;

  const isDone = payload.kind === 'queue' ? payload.item.status === EQueueStatus.Done : true;

  /** Aspect frame for compare UI — prefer output size (matches “after”); input alone is enough only if output missing. */
  const compareFrameDims =
    outputW != null && outputH != null && outputW > 0 && outputH > 0
      ? { w: outputW, h: outputH }
      : inputW != null && inputH != null && inputW > 0 && inputH > 0
        ? { w: inputW, h: inputH }
        : null;

  const canCompare = Boolean(isDone && afterUrl && beforeUrl && compareFrameDims != null);

  const showSingleAfter = Boolean(isDone && afterUrl && !canCompare);
  const showEmpty = !isDone || !afterUrl;

  const hasDimsForRatio =
    inputW != null &&
    inputH != null &&
    outputW != null &&
    outputH != null &&
    inputW > 0 &&
    inputH > 0;

  const ratio = hasDimsForRatio ? Math.min(outputW! / inputW!, outputH! / inputH!) : 1;

  const suggest4x = payload.kind === 'queue' && Boolean(ratio < 3.25 && payload.onReprocessAtScale);

  const handleShare = async () => {
    if (!afterUrl) {
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share({
          title: t('modal_share_title'),
          url: afterUrl,
        });
      } else {
        await navigator.clipboard.writeText(afterUrl);
      }
    } catch {
      /* user cancelled or clipboard denied */
    }
  };

  const handleCloseReprocess = () => {
    if (payload.kind === 'queue') {
      payload.onReprocessAtScale?.(EScaleFactor.X4);
    }
    overlay.close();
  };

  const singleAspectStyle =
    outputW != null && outputH != null && outputW > 0 && outputH > 0
      ? { aspectRatio: `${outputW} / ${outputH}` as const }
      : inputW != null && inputH != null && inputW > 0 && inputH > 0
        ? { aspectRatio: `${inputW} / ${inputH}` as const }
        : { aspectRatio: '1 / 1' as const };

  return (
    <Modal.Root state={overlay}>
      <ModalBackdrop className="backdrop-blur-[2px]">
        <ModalContainer
          placement="center"
          scroll="inside"
          size="lg"
          className="relative max-w-[420px] sm:pr-2"
        >
          <ModalDialog className="max-h-[min(92vh,880px)] border border-white/10 bg-[#141018] shadow-2xl shadow-black/50">
            <ModalHeader className="flex flex-row items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
              <ModalHeading
                className="text-base font-semibold tracking-tight text-foreground"
                id="enhance-result-title"
              >
                {t('modal_title', { model: modelLabel })}
              </ModalHeading>
              <ModalCloseTrigger aria-label={t('modal_close')} />
            </ModalHeader>

            <ModalBody className="relative min-h-0 gap-0 px-0 py-0">
              {canCompare && beforeUrl && afterUrl && compareFrameDims ? (
                <>
                  <BeforeAfterCompare
                    key={`${payload.kind}-${payload.item.id}`}
                    beforeSrc={beforeUrl}
                    afterSrc={afterUrl}
                    hint={t('modal_compare_drag_hint')}
                    ratioWidth={compareFrameDims.w}
                    ratioHeight={compareFrameDims.h}
                  />
                  <MotionComingPill />
                </>
              ) : null}

              {showSingleAfter && afterUrl ? (
                <div className="relative mx-auto max-w-full px-3 pt-3">
                  <div
                    className="relative mx-auto max-h-[min(70vh,560px)] w-full overflow-hidden rounded-xl bg-black/40"
                    style={singleAspectStyle}
                  >
                    {/* eslint-disable-next-line next/no-img-element -- R2 / remote output URL */}
                    <img src={afterUrl} alt="" className="size-full object-contain object-center" />
                    <MotionComingPill className="absolute top-2 left-2 z-20 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-neutral-800 opacity-70 shadow-sm" />
                  </div>
                </div>
              ) : null}

              {showEmpty ? (
                <p className="px-4 py-6 text-center text-sm text-muted">{t('modal_no_result')}</p>
              ) : null}
            </ModalBody>

            <ModalFooter className="border-t border-white/8 px-3 py-3">
              {afterUrl ? (
                <div className="flex w-full flex-wrap items-center gap-2">
                  {suggest4x ? (
                    <button
                      type="button"
                      onClick={handleCloseReprocess}
                      className="min-h-10 flex-1 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-opacity hover:opacity-95"
                    >
                      {t('modal_cta_upscale_x', { n: 4 })}
                    </button>
                  ) : (
                    <EnhancerOutputDownloadButton
                      outputUrl={afterUrl}
                      originalFileName={downloadBaseName}
                      ariaLabel={t('modal_download')}
                      className="min-h-10 flex-1 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-opacity hover:opacity-95 disabled:opacity-60"
                    >
                      {t('modal_download')}
                    </EnhancerOutputDownloadButton>
                  )}
                  <button
                    type="button"
                    onClick={() => overlay.close()}
                    className="min-h-10 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/8 hover:text-foreground"
                  >
                    {t('modal_more')}
                  </button>
                  <div className="ml-auto flex gap-1">
                    <button
                      type="button"
                      onClick={() => void handleShare()}
                      aria-label={t('modal_share')}
                      className="flex size-10 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-muted transition-colors hover:text-foreground"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex w-full justify-end">
                  <button
                    type="button"
                    onClick={() => overlay.close()}
                    className="min-h-10 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/8 hover:text-foreground"
                  >
                    {t('modal_close')}
                  </button>
                </div>
              )}
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal.Root>
  );
}
