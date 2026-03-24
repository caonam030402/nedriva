'use client';

/**
 * VideoEnhanceWorkspace
 *
 * Full video enhancement UI — upload, configure, submit, track, and download.
 *
 * User flow:
 *   1. Upload video  →  POST /api/videos/upload
 *   2. Configure enhancement options (upscale, denoise, deblur, face, style)
 *   3. Submit job     →  POST /api/videos/enhance
 *   4. Poll status    →  GET  /api/videos/:id/status  (every 3 s while processing)
 *   5. On done: fetch result →  GET  /api/videos/:id/result
 *   6. Preview + download in-page
 */

import type {
  VideoEnhanceOptions,
  VideoOutputFormat,
  VideoOutputSize,
} from '@/types/enhancer-video/videoEnhancement';
import { AlertCircle, Film, Loader2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DropZone } from '@/components/ui/DropZone';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import {
  EEnhancementStyle,
  EUpscaleLevel,
  EVideoOutputFormat,
  EVideoOutputSize,
  EVideoStatus,
} from '@/enums/enhancer-video';
import { useEnhanceVideo } from '@/hooks/react-query/enhancer-video/mutations/useEnhanceVideo';
import { useUploadVideo } from '@/hooks/react-query/enhancer-video/mutations/useUploadVideo';
import { useVideoJobStatus } from '@/hooks/react-query/enhancer-video/queries/useVideoJobStatus';
import { ResultPlayer } from './ResultPlayer';

/* ── Credit cost helpers ──────────────────────────────────────── */

function creditCost(size: VideoOutputSize): number {
  if (size === EVideoOutputSize.K4) return 15;
  if (size === EVideoOutputSize.K2) return 10;
  return 8;
}

/* ── Format pill button ──────────────────────────────────────── */

function FormatPill(props: {
  id: VideoOutputFormat;
  label: string;
  tooltip: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
        props.selected
          ? 'cursor-pointer bg-brand text-white shadow-sm'
          : 'cursor-pointer text-muted hover:text-foreground'
      }`}
    >
      <span>{props.label}</span>
      <InfoTooltip text={props.tooltip} size={12} />
    </button>
  );
}

/* ── Progress bar ──────────────────────────────────────────────── */

function ProcessingProgress(props: { progress: number; stageLabel: string | null }) {
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/3 p-4">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{props.stageLabel ?? 'Processing…'}</span>
        <span className="font-medium tabular-nums">{props.progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${props.progress}%` }}
        />
      </div>
    </div>
  );
}

/* ── Main workspace ───────────────────────────────────────────── */

export function EnhancerVideoView() {
  const t = useTranslations('VideoEnhance');
  const id = useId();

  // ── Options state ──────────────────────────────────────────
  const [size, setSize] = useState<VideoOutputSize>('2k');
  const [format, setFormat] = useState<VideoOutputFormat>('mp4');
  const [denoise, setDenoise] = useState(true);
  const [deblur, setDeblur] = useState(false);
  const [faceEnhance, setFaceEnhance] = useState(false);
  const [style, setStyle] = useState<EEnhancementStyle>(EEnhancementStyle.NATURAL);

  // ── Upload state ───────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // ── Job state ──────────────────────────────────────────────
  const [jobId, setJobId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'queued' | 'done' | 'failed'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastProcessedStatusRef = useRef<string | null>(null);
  const failedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isUploading = phase === 'uploading';
  const isProcessing = phase === 'queued';
  const isDone = phase === 'done';
  const isFailed = phase === 'failed';

  // ── React Query mutations / queries ───────────────────────
  const uploadMutation = useUploadVideo();
  const enhanceMutation = useEnhanceVideo();
  const { data: statusData } = useVideoJobStatus(uploadedVideoId, jobId, {
    pollIntervalMs: isProcessing ? 3000 : undefined,
  });

  // ── Poll result when status is 'done' ─────────────────────
  useEffect(() => {
    if (statusData?.status !== EVideoStatus.DONE) return;
    if (phase === 'done') return;

    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/videos/${uploadedVideoId}/result?jobId=${jobId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.downloadUrl) {
            setDownloadUrl(data.downloadUrl);
            setPhase('done');
          }
        }
      } catch {
        // Will retry on next poll cycle
      }
    };

    fetchResult();
  }, [statusData?.status, phase, uploadedVideoId, jobId]);

  // Update phase from status
  useEffect(() => {
    if (!statusData) return;
    if (phase !== 'queued') return;

    const prev = lastProcessedStatusRef.current;
    if (prev === statusData.status) return; // already handled this status
    lastProcessedStatusRef.current = statusData.status;

    if (statusData.status === EVideoStatus.DONE) {
      // Download URL fetched in the other effect
    } else if (statusData.status === EVideoStatus.FAILED) {
      failedStatusTimerRef.current = setTimeout(() => {
        setPhase('failed');
        setErrorMsg(statusData.errorMessage ?? 'Processing failed');
      }, 0);
    }
  }, [statusData, phase]);

  // Cleanup timeout on unmount or re-run
  useEffect(() => {
    return () => {
      if (failedStatusTimerRef.current) clearTimeout(failedStatusTimerRef.current);
    };
  }, []);

  // ── File handling ───────────────────────────────────────────
  const handleFiles = useCallback((files: File[]) => {
    const next = files[0] ?? null;
    if (!next) return;
    setFile(next);
    setUploadedVideoId(null);
    setJobId(null);
    setDownloadUrl(null);
    setErrorMsg(null);
    setPhase('idle');
    setUploadProgress(0);

    const url = URL.createObjectURL(next);
    setPreviewUrl(url);
  }, []);

  const handleRemove = useCallback(() => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadedVideoId(null);
    setJobId(null);
    setDownloadUrl(null);
    setErrorMsg(null);
    setPhase('idle');
    setUploadProgress(0);
  }, [previewUrl]);

  // ── Upload + Submit flow ───────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setPhase('uploading');
    setErrorMsg(null);

    try {
      // 1. Upload direct to R2 (via presigned URL) + probe metadata
      const uploadRes = await uploadMutation.mutateAsync({
        file,
        onProgress: setUploadProgress,
      });
      setUploadedVideoId(uploadRes.videoId);

      // 2. Submit enhancement job
      // Map UI size to API upscaleFactor
      const upscaleFactorMap: Record<VideoOutputSize, VideoEnhanceOptions['upscaleFactor']> = {
        auto: EUpscaleLevel.AUTO,
        hd: EUpscaleLevel.AUTO,
        fhd: EUpscaleLevel.AUTO,
        '2k': EUpscaleLevel.X2,
        '4k': EUpscaleLevel.X4,
      };
      const enhanceOptions: VideoEnhanceOptions = {
        upscaleFactor: upscaleFactorMap[size],
        denoise,
        deblur,
        faceEnhance,
        style,
      };
      const enhanceRes = await enhanceMutation.mutateAsync({
        videoId: uploadRes.videoId,
        options: enhanceOptions,
      });
      setJobId(enhanceRes.jobId);
      setPhase('queued');
    } catch (err) {
      setPhase('failed');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [file, size, denoise, deblur, faceEnhance, style, uploadMutation, enhanceMutation]);

  const cost = creditCost(size);

  const showPlayer = !isUploading && (isDone || downloadUrl);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden lg:flex-row">
      {/* ══ LEFT: upload / preview ══════════════════════════════ */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-b border-white/8 lg:border-r lg:border-b-0">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-4 py-3">
          <div className="flex items-center gap-2">
            <Film className="size-5 text-brand-light" aria-hidden />
            <div>
              <h1 className="text-sm font-semibold text-foreground">{t('title')}</h1>
              <p className="text-xs text-muted">{t('subtitle')}</p>
            </div>
          </div>
          {file && !showPlayer && (
            <button
              type="button"
              onClick={handleRemove}
              className="flex size-8 items-center justify-center rounded-lg border border-white/15 text-muted transition-colors hover:border-white/25 hover:text-foreground"
              aria-label={t('remove_video')}
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
          {!file ? (
            <DropZone
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/mpeg"
              multiple={false}
              onFiles={handleFiles}
              hint={t('drop_hint')}
              className="min-h-[min(280px,40vh)] flex-1"
            />
          ) : showPlayer ? (
            <ResultPlayer downloadUrl={downloadUrl!} onReset={handleRemove} />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              {/* Video preview */}
              <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                {previewUrl ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={previewUrl}
                    controls
                    className="size-full max-h-[min(420px,50vh)] object-contain"
                  />
                ) : null}

                {/* Processing overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm">
                    <Loader2 className="size-8 animate-spin text-brand-light" aria-hidden />
                    <p className="text-sm font-medium text-white">
                      {statusData?.stageLabel ?? 'Processing…'}
                    </p>
                  </div>
                )}

                {/* Failed overlay */}
                {isFailed && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-4 text-center backdrop-blur-sm">
                    <AlertCircle className="size-8 text-danger" aria-hidden />
                    <p className="text-sm font-medium text-danger">
                      {errorMsg ?? 'Processing failed'}
                    </p>
                    <Button variant="secondary" size="sm" onClick={handleRemove}>
                      Try again
                    </Button>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {isProcessing && statusData && (
                <ProcessingProgress
                  progress={statusData.progress ?? 0}
                  stageLabel={statusData.stageLabel ?? null}
                />
              )}

              {/* Uploading state */}
              {isUploading && (
                <div className="space-y-2 py-4">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Uploading to storage…</span>
                    <span className="font-medium tabular-nums">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button variant="secondary" size="sm" onClick={handleRemove}>
                {t('choose_different')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ══ RIGHT: settings panel ══════════════════════════════ */}
      <aside className="flex w-full shrink-0 flex-col border-white/8 bg-page lg:w-[min(100%,400px)] lg:border-l">
        <div className="max-h-[55vh] min-h-0 flex-1 overflow-y-auto overscroll-y-contain lg:max-h-none">
          {/* ── Upscale ── */}
          <p className="border-b border-white/8 px-4 py-3 text-[10px] font-semibold tracking-[0.2em] text-subtle uppercase">
            {t('settings_eyebrow')}
          </p>

          <div className="border-b border-white/8 px-4 py-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{t('size_label')}</p>
              <InfoTooltip text={t('size_tooltip')} size={12} />
            </div>
            <SegmentedControl
              value={size}
              onChange={(id) => setSize(id as VideoOutputSize)}
              options={[
                { id: EVideoOutputSize.AUTO, label: t('size_auto') },
                { id: EVideoOutputSize.HD, label: t('size_hd') },
                { id: EVideoOutputSize.FHD, label: t('size_fhd') },
                { id: EVideoOutputSize.K2, label: t('size_2k') },
                {
                  id: EVideoOutputSize.K4,
                  label: t('size_4k'),
                  locked: true,
                  lockedTooltip: t('size_4k_locked'),
                },
              ]}
            />
          </div>

          {/* ── Format ── */}
          <div className="border-b border-white/8 px-4 py-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{t('format_label')}</p>
              <InfoTooltip text={t('format_tooltip')} size={12} />
            </div>
            <div className="flex gap-px overflow-hidden rounded-lg border border-white/10 bg-surface p-0.5">
              <FormatPill
                id="auto"
                label={t('format_auto')}
                tooltip={t('format_auto_tip')}
                selected={format === EVideoOutputFormat.AUTO}
                onSelect={() => setFormat(EVideoOutputFormat.AUTO)}
              />
              <FormatPill
                id="mp4"
                label={t('format_mp4')}
                tooltip={t('format_mp4_tip')}
                selected={format === EVideoOutputFormat.MP4}
                onSelect={() => setFormat(EVideoOutputFormat.MP4)}
              />
              <FormatPill
                id="webm"
                label={t('format_webm')}
                tooltip={t('format_webm_tip')}
                selected={format === EVideoOutputFormat.WEBM}
                onSelect={() => setFormat(EVideoOutputFormat.WEBM)}
              />
              <FormatPill
                id="mov"
                label={t('format_mov')}
                tooltip={t('format_mov_tip')}
                selected={format === EVideoOutputFormat.MOV}
                onSelect={() => setFormat(EVideoOutputFormat.MOV)}
              />
            </div>
          </div>

          {/* ── Enhancement toggles ── */}
          <EnhanceToggle
            id={`${id}-denoise`}
            label={t('denoise_label')}
            description={t('denoise_desc')}
            checked={denoise}
            onChange={setDenoise}
          />
          <EnhanceToggle
            id={`${id}-deblur`}
            label={t('deblur_label')}
            description={t('deblur_desc')}
            checked={deblur}
            onChange={setDeblur}
          />
          <EnhanceToggle
            id={`${id}-face`}
            label={t('face_label')}
            description={t('face_desc')}
            checked={faceEnhance}
            onChange={setFaceEnhance}
          />

          {/* ── Style ── */}
          <div className="border-b border-white/8 px-4 py-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{t('style_label')}</p>
              <InfoTooltip text={t('style_tooltip')} size={12} />
            </div>
            <SegmentedControl
              value={style}
              onChange={(id) => setStyle(id as EEnhancementStyle)}
              options={[
                { id: EEnhancementStyle.NATURAL, label: t('style_natural') },
                { id: EEnhancementStyle.CINEMATIC, label: t('style_cinematic') },
                { id: EEnhancementStyle.SOCIAL, label: t('style_social') },
              ]}
            />
          </div>
        </div>

        {/* ── CTA footer ── */}
        <div className="border-t border-white/8 p-4">
          <Button
            variant="primary"
            className="w-full"
            isDisabled={!file || isProcessing || isUploading || isDone}
            onClick={handleSubmit}
          >
            {isUploading
              ? t('cta_uploading')
              : isProcessing
                ? `${statusData?.progress ?? 0}% · ${t('cta_processing')}`
                : isDone
                  ? t('cta_done')
                  : `${t('cta_enhance')} · ${cost} credits`}
          </Button>
          {!file && <p className="mt-2 text-center text-[11px] text-muted">{t('cta_note')}</p>}
          {file && !isProcessing && !isDone && (
            <p className="mt-2 text-center text-[11px] text-muted">
              {t('cost_note', { credits: cost })}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ── Toggle row ──────────────────────────────────────────────── */

function EnhanceToggle(props: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="border-b border-white/8 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor={props.id} className="cursor-pointer text-sm font-medium text-foreground">
            {props.label}
          </label>
          <p className="mt-0.5 text-xs text-muted">{props.description}</p>
        </div>
        <button
          id={props.id}
          role="switch"
          aria-checked={props.checked}
          onClick={() => props.onChange(!props.checked)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:outline-none ${
            props.checked ? 'bg-brand' : 'bg-white/20'
          }`}
        >
          <span
            className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
              props.checked ? 'translate-x-[18px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
