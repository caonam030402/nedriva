import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export type ResultPlayerProps = {
  downloadUrl: string;
  onReset: () => void;
};

export function ResultPlayer(props: ResultPlayerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-success">
          <CheckCircle2 className="size-4" aria-hidden />
          <span>Enhancement complete</span>
        </div>
        <Button variant="secondary" size="sm" onClick={props.onReset}>
          <RotateCcw className="size-3.5" aria-hidden />
          Enhance another
        </Button>
      </div>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={props.downloadUrl}
        controls
        className="max-h-[460px] w-full rounded-xl border border-white/10 object-contain"
      />

      <a
        href={props.downloadUrl}
        download="enhanced-video.mp4"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Download enhanced video
      </a>
    </div>
  );
}
