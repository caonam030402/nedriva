'use client';

/**
 * ToolCard — Card hiển thị tool/feature với icon, title, description.
 * Dùng Lucide icons.
 */
import { Link } from '@/libs/i18n/I18nNavigation';
import { ArrowRight } from 'lucide-react';

type ToolCardProps = {
  href: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  title: string;
  description: string;
  creditLabel?: string;
  accentText?: string;
  borderHover?: string;
  tryLabel?: string;
  index?: number;
};

export const ToolCard = (props: ToolCardProps) => {
  const iconBg = props.iconBg ?? 'bg-brand/15';
  const iconColor = props.iconColor ?? 'text-brand-light';
  const borderHover = props.borderHover ?? 'hover:border-brand/40';
  const accentText = props.accentText ?? 'text-brand-light';

  return (
    <Link
      href={props.href}
      className={`group relative flex flex-col overflow-hidden rounded-card border border-brand/10 bg-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:bg-elevated hover:shadow-card ${borderHover}`}
    >
      {/* Icon */}
      <div
        className={`mb-4 inline-flex size-11 items-center justify-center rounded-ui-md ${iconBg} ${iconColor}`}
      >
        {props.icon}
      </div>

      {/* Title + credit badge */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-foreground">{props.title}</h3>
        {props.creditLabel && (
          <span className="shrink-0 rounded-pill border border-white/10 bg-elevated px-2 py-0.5 text-[10px] font-semibold text-subtle">
            {props.creditLabel}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="flex-1 text-sm leading-relaxed text-muted">{props.description}</p>

      {/* Try tool link */}
      {props.tryLabel && (
        <div className={`mt-5 flex items-center gap-1.5 text-sm font-semibold ${accentText}`}>
          {props.tryLabel}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      )}
    </Link>
  );
};
