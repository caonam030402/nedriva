'use client';

import type { BgRemovalJobStatusResponse } from '@/types/bg-remover/api';
import { toast as toastApi } from '@heroui/react/toast';
import { CheckCircle2, Download, Loader2, Upload, Wand2, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ENHANCER_MAX_UPLOAD_FILE_BYTES } from '@/constants/enhancer-image/enhancerImage';
import { JOB_POLL_INTERVAL_MS } from '@/constants/pipeline';
import { useBgRemovalJobStatus } from '@/hooks/react-query/bg-remover/queries/useBgRemovalJobStatus';
import { useUploadToR2 } from '@/hooks/react-query/shared/mutations/useUploadToR2';
import { createBgRemovalJob } from '@/libs/apis/bg-remover';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
const MAX_SIZE_MB = Math.round(ENHANCER_MAX_UPLOAD_FILE_BYTES / (1024 * 1024));

type StepState =
  | { step: 'idle' }
  | { step: 'uploading' }
  | { step: 'processing'; jobId: string }
  | { step: 'done'; result: BgRemovalJobStatusResponse }
  | { step: 'error'; message: string };

function isWorking(s: StepState): boolean {
  return s.step === 'uploading' || s.step === 'processing';
}

export function BgRemoverView() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [state, setState] = useState<StepState>({ step: 'idle' });
  const prevJobIdRef = useRef<string | null>(null);
  const toastDoneShownRef = useRef(false);

  const upload = useUploadToR2({
    onError: (err) => {
      setState({ step: 'error', message: err.message });
    },
  });

  const currentJobId =
    state.step === 'processing' ? (state as { step: 'processing'; jobId: string }).jobId : null;

  const { data: jobStatus } = useBgRemovalJobStatus(currentJobId, {
    pollIntervalMs: JOB_POLL_INTERVAL_MS,
  });

  // Handle status transitions — react to jobStatus changes from polling
  useEffect(() => {
    if (!jobStatus || state.step !== 'processing') return;

    if (jobStatus.status === 'done' && !toastDoneShownRef.current) {
      toastDoneShownRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Valid: sync UI state to external polling data change
      setState({ step: 'done', result: jobStatus });
      toastApi.success?.('Background removed successfully!');
    } else if (jobStatus.status === 'failed') {
      const msg = jobStatus.errorMessage ?? 'Processing failed';
       
      setState({ step: 'error', message: msg });
      toastApi.warning?.('Background removal failed', { description: msg });
    }
     
  }, [jobStatus, state.step]);

  // Reset toast flag when jobId changes
  useEffect(() => {
    if (currentJobId !== prevJobIdRef.current) {
      prevJobIdRef.current = currentJobId;
      toastDoneShownRef.current = false;
    }
  }, [currentJobId]);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        toastApi.danger?.('Invalid file type', {
          description: 'Please upload a JPEG, PNG, WebP, or TIFF image.',
        });
        return;
      }
      if (file.size > ENHANCER_MAX_UPLOAD_FILE_BYTES) {
        toastApi.danger('File too large', {
          description: `Maximum file size is ${MAX_SIZE_MB}MB.`,
        });
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(objectUrl);
      setFileName(file.name);
      setState({ step: 'uploading' });

      upload.mutate(
        { file, folder: 'bg-removal' },
        {
          onSuccess: async ({ fileKey }) => {
            try {
              const job = await createBgRemovalJob(fileKey);
              setState({ step: 'processing', jobId: job.jobId });
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Failed to create job';
              setState({ step: 'error', message });
              toastApi.danger('Failed to start job', { description: message });
            }
          },
          onError: (err) => {
            const message = err instanceof Error ? err.message : 'Upload failed';
            setState({ step: 'error', message });
          },
        },
      );
    },
    [previewUrl, upload],
  );

  const reset = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileName('');
    setState({ step: 'idle' });
    prevJobIdRef.current = null;
    toastDoneShownRef.current = false;
  }, [previewUrl]);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      void handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const onDownload = useCallback(() => {
    if (state.step !== 'done') return;
    const url = state.result.outputUrl;
    if (!url) return;
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `bg-removed-${fileName.replace(/\.[^.]+$/, '')}.png`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  }, [state, fileName]);

  const statusLabel =
    state.step === 'idle'
      ? 'Ready'
      : state.step === 'uploading'
        ? 'Uploading...'
        : state.step === 'processing'
          ? 'Processing...'
          : state.step === 'done'
            ? 'Done'
            : 'Failed';

  const statusColor =
    state.step === 'done'
      ? 'text-green-400'
      : state.step === 'error'
        ? 'text-red-400'
        : isWorking(state)
          ? 'text-brand'
          : 'text-subtle';

  const uploadInput = (
    <input
      type="file"
      accept={ALLOWED_TYPES.join(',')}
      className="sr-only"
      onChange={(e) => {
        void handleFiles(e.target.files);
      }}
    />
  );

  const dropZoneClass = previewUrl
    ? 'cursor-default border-white/10'
    : 'hover:border-brand/40 active:border-brand';

  const bgStyle =
    state.step === 'done'
      ? 'linear-gradient(135deg, #f0f0f0 25%, transparent 25%), linear-gradient(225deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(315deg, #f0f0f0 25%, #e0e0e0 25%)'
      : 'linear-gradient(135deg, #1a1a1a 25%, transparent 25%), linear-gradient(225deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(315deg, #1a1a1a 25%, #141414 25%)';

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 lg:flex-row">
        {/* LEFT: Upload / Preview */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-4 shrink-0">
            <h2 className="text-sm font-semibold tracking-wide text-subtle uppercase">
              Image Preview
            </h2>
          </div>

          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`group relative flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
              dropZoneClass
            }`}
          >
            {previewUrl ? (
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  style={{
                    background: bgStyle,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 10px 0, 10px -10px, 0px 10px',
                  }}
                />
                {isWorking(state) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm">
                    <Loader2 className="size-10 animate-spin text-brand" />
                    <p className="text-sm font-medium text-white">
                      {state.step === 'uploading' ? 'Uploading...' : 'Removing background...'}
                    </p>
                  </div>
                )}
                {state.step === 'done' && state.result.outputUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-sm">
                    <CheckCircle2 className="size-12 text-green-400" />
                    <p className="text-sm font-medium text-white">Background removed!</p>
                  </div>
                )}
                {state.step === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm">
                    <XCircle className="size-12 text-red-400" />
                    <p className="px-4 text-center text-sm font-medium text-white">
                      {state.message || 'Processing failed'}
                    </p>
                  </div>
                )}
                {!isWorking(state) && (
                  <label className="absolute right-3 bottom-3 cursor-pointer rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/20">
                    <Upload size={16} />
                    {uploadInput}
                  </label>
                )}
              </div>
            ) : (
              <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 p-8">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/5">
                  <Upload size={28} className="text-subtle" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Drag & drop an image here</p>
                  <p className="mt-1 text-xs text-subtle">
                    or <span className="text-brand hover:underline">browse files</span>
                  </p>
                  <p className="mt-3 text-[10px] text-muted">
                    JPEG, PNG, WebP, TIFF | Max {MAX_SIZE_MB}MB
                  </p>
                </div>
                {uploadInput}
              </label>
            )}
          </div>
        </div>

        {/* RIGHT: Controls */}
        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-72 lg:shrink-0">
          <div className="rounded-2xl border border-white/10 bg-elevated p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10">
                <Wand2 size={18} className="text-brand" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Background Remover</h3>
                <p className="text-xs text-muted">Powered by AI</p>
              </div>
            </div>

            <div className="mb-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-subtle">Cost</span>
                <span className="font-medium text-foreground">1 credit</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-subtle">Format</span>
                <span className="font-medium text-foreground">PNG (transparent)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-subtle">Status</span>
                <span className={`font-medium ${statusColor}`}>{statusLabel}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {state.step === 'done' && state.result.outputUrl ? (
                <button
                  type="button"
                  onClick={onDownload}
                  className="hover:bg-brand-hover flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-black transition-colors"
                >
                  <Download size={16} />
                  Download Result
                </button>
              ) : state.step === 'error' ? (
                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-white/15"
                >
                  Try Again
                </button>
              ) : isWorking(state) ? (
                <button
                  type="button"
                  disabled
                  className="flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm font-medium text-subtle"
                >
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </button>
              ) : previewUrl ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled
                    className="flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm font-medium text-subtle"
                  >
                    Image Ready
                  </button>
                  <p className="text-center text-xs text-muted">
                    Processing starts automatically...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="hover:bg-brand-hover flex cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-black transition-colors">
                    <Upload size={16} />
                    Select Image
                    {uploadInput}
                  </label>
                  <p className="text-center text-xs text-muted">
                    JPEG, PNG, WebP, TIFF | Max {MAX_SIZE_MB}MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/2 p-4">
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-subtle uppercase">
              Tips
            </p>
            <ul className="space-y-1.5 text-xs text-muted">
              <li>• Works best with clear subject separation</li>
              <li>• Complex backgrounds may take longer</li>
              <li>• Output is always PNG with transparency</li>
              <li>• High-resolution images recommended</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
