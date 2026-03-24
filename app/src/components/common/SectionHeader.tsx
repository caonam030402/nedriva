'use client';

import type { BadgeVariant } from '@/components/common/Badge';
/* ═══════════════════════════════════════════════════════════════
   SectionHeader — Section header with badge, title, subtitle.
   ═══════════════════════════════════════════════════════════════ */
import { Badge } from '@/components/common/Badge';

type SectionHeaderProps = {
  badge?: string;
  title: string;
  titleGradient?: string;
  subtitle?: string;
  align?: 'center' | 'left';
  badgePulse?: boolean;
  badgeVariant?: BadgeVariant;
  timeBadge?: string;
  className?: string;
  /** e.g. “View all” — row below title, aligned with `align` */
  action?: React.ReactNode;
  /** Soft headline glow (marketing breaks) */
  titleGlow?: boolean;
};

export const SectionHeader = (props: SectionHeaderProps) => {
  const align = props.align ?? 'center';
  const ta = align === 'center' ? 'mx-auto text-center' : '';
  const titleGlow = props.titleGlow ? 'text-glow-heading' : '';
  const actionJustify = align === 'center' ? 'justify-center' : 'justify-end';

  return (
    <div className={`mb-14 w-full max-w-6xl ${align === 'center' ? 'mx-auto' : ''} ${props.className ?? ''}`}>
      <div className={`max-w-2xl ${ta}`}>
        {props.badge && (
          <Badge
            variant={props.badgeVariant ?? 'brand'}
            pulse={props.badgePulse}
            className="mb-4"
          >
            {props.badge}
          </Badge>
        )}

        <h2
          className={`font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl ${titleGlow}`}
        >
          {props.title}
          {props.titleGradient && (
            <>
              {' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'var(--gradient-text)' }}
              >
                {props.titleGradient}
              </span>
            </>
          )}
        </h2>

        {props.timeBadge && (
          <div className="mt-5">
            <Badge variant="success" pulse>
              {props.timeBadge}
            </Badge>
          </div>
        )}

        {props.subtitle && (
          <p className="mt-5 text-lg text-muted">{props.subtitle}</p>
        )}
      </div>

      {props.action && (
        <div className={`mt-8 flex ${actionJustify}`}>
          {props.action}
        </div>
      )}
    </div>
  );
};
