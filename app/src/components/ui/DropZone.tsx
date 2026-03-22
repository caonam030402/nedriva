'use client';

import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

type SourceIcon = {
  key: string;
  content: React.ReactNode;
};

type Props = {
  onFiles: (files: File[]) => void;
  /** Called when the user picked files that did not match `accept` (so nothing was passed to `onFiles`). */
  onRejectedFiles?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
  sources?: SourceIcon[];
  className?: string;
};

const DEFAULT_SOURCES: SourceIcon[] = [
  {
    key: 'local',
    content: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>
    ),
  },
  {
    key: 'gdrive',
    content: (
      <svg viewBox="0 0 87.3 78" className="size-4">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
        <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.5C.4 49.9 0 51.45 0 53h27.5z" fill="#00ac47" />
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.5z" fill="#ea4335" />
        <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.45-4.45 1.2z" fill="#00832d" />
        <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.45 1.2h50.9c1.55 0 3.1-.4 4.45-1.2z" fill="#2684fc" />
        <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28H87.3c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
      </svg>
    ),
  },
];

export const DropZone = (props: Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sources = props.sources ?? DEFAULT_SOURCES;

  const handleFiles = (raw: FileList | File[]) => {
    const all = Array.from(raw);
    const accepted = props.accept
      ? all.filter(f => props.accept!.split(',').some(t => f.type.match(t.trim())))
      : all;
    const rejected = props.accept ? all.filter(f => !accepted.includes(f)) : [];
    if (rejected.length > 0) {
      props.onRejectedFiles?.(rejected);
    }
    if (accepted.length > 0) {
      props.onFiles(accepted);
    }
  };

  return (
    <motion.div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      animate={{
        borderColor: isDragging ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.1)',
        backgroundColor: isDragging ? 'rgba(139,92,246,0.05)' : 'transparent',
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors ${props.className ?? ''}`}
    >
      {isDragging
        ? (
            <UploadCloud size={28} className="text-brand-light" />
          )
        : (
            <p className="text-sm text-muted">
              Drop your image,
              {' '}
              <span className="font-semibold text-brand-light">browse</span>
            </p>
          )}

      {!isDragging && (
        <>
          {sources.length > 0 && (
            <>
              <p className="text-xs text-subtle">or import from</p>
              <div className="flex items-center gap-2">
                {sources.map(s => (
                  <div
                    key={s.key}
                    className="flex size-7 items-center justify-center rounded-md border border-white/10 bg-white/6 text-subtle"
                  >
                    {s.content}
                  </div>
                ))}
              </div>
            </>
          )}
          {props.hint && (
            <p className="text-[11px] text-subtle">{props.hint}</p>
          )}
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={props.accept}
        multiple={props.multiple}
        className="hidden"
        onChange={e => e.target.files && handleFiles(e.target.files)}
      />
    </motion.div>
  );
};
