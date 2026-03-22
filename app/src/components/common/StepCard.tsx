'use client';

/**
 * StepCard — Card hiển thị từng bước trong section "How It Works".
 * Props: number, label, title, description, icon, mockup, accentColor
 * Dùng Lucide icons.
 */
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

type StepCardProps = {
  number: string;
  label: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  mockup?: React.ReactNode;
  accentColor?: string;
  isFirst?: boolean;
  index?: number;
};

export const StepCard = (props: StepCardProps) => {
  const accentColor = props.accentColor ?? 'text-brand-light';

  return (
    <motion.div
      className="relative flex flex-col"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (props.index ?? 0) * 0.1 }}
    >
      {/* Connector line — desktop only */}
      {props.index !== undefined && props.index > 0 && (
        <div
          className="absolute top-[52px] right-0 left-0 -z-10 hidden h-px lg:block"
          style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(139,92,246,0.2) 20%, rgba(139,92,246,0.2) 80%, transparent 95%)' }}
        />
      )}

      {/* Step number */}
      <div className="mb-6 flex items-center gap-4 lg:flex-col lg:items-start">
        <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-brand/40 bg-surface text-brand-light shadow-card lg:mx-auto">
          {props.isFirst && (
            <span className="absolute -inset-1 animate-ping rounded-full bg-brand/20" />
          )}
          <span className="relative text-lg font-extrabold">{props.number}</span>
        </div>

        {/* Arrow — mobile/tablet */}
        {props.index !== undefined && props.index > 0 && (
          <div className="flex items-center lg:hidden">
            <div className="h-px w-8 bg-brand/20" />
            <ArrowRight className="size-5 text-brand/40" />
          </div>
        )}
      </div>

      {/* Content card */}
      <div className="flex flex-1 flex-col rounded-card border border-white/[0.06] bg-surface p-6 shadow-card">
        {/* Icon + label */}
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-ui-md bg-brand/15 ${accentColor}`}>
            {props.icon}
          </div>
          <span className="text-xs font-bold tracking-widest text-subtle uppercase">
            {props.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-bold text-foreground">{props.title}</h3>

        {/* Description */}
        <p className="mb-5 flex-1 text-sm leading-relaxed text-muted">{props.description}</p>

        {/* UI Mockup */}
        {props.mockup}
      </div>
    </motion.div>
  );
};
