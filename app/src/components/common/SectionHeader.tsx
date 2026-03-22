'use client';

/* ═══════════════════════════════════════════════════════════════
   SectionHeader — Section header with badge, title, subtitle.
   ═══════════════════════════════════════════════════════════════ */
import { Badge } from '@/components/common/Badge';
import type { BadgeVariant } from '@/components/common/Badge';

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
};

export const SectionHeader = (props: SectionHeaderProps) => {
  const align = props.align ?? 'center';
  const ta = align === 'center' ? 'text-center mx-auto' : '';

  return (
    <div className={`mb-14 max-w-2xl ${ta} ${props.className ?? ''}`}>
      {props.badge && (
        <Badge
          variant={props.badgeVariant ?? 'brand'}
          pulse={props.badgePulse}
          className="mb-4"
        >
          {props.badge}
        </Badge>
      )}

      <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
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
  );
};
