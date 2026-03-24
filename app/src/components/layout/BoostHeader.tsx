'use client';

import { UserButton } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { BrandLogo } from '@/components/common/BrandLogo';
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher';
import { Chip } from '@/components/ui/Chip';
import { useUserCreditBalanceQuery } from '@/hooks/react-query/user/queries/useUserCreditBalanceQuery';
import { clerkUserButtonPopoverElements } from '@/libs/core/ClerkUserButtonAppearance';
import { Link, usePathname } from '@/libs/i18n/I18nNavigation';
import { Routes } from '@/utils/Routes';

// ── Inline SVG icons (no external dep) ────────────────────────

const InviteIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 14c0-2.485 2.462-4.5 5.5-4.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v4m-2-2h4" />
  </svg>
);

const CreditIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.35} aria-hidden>
    <ellipse cx="8" cy="8.5" rx="5" ry="3.25" />
    <path strokeLinecap="round" d="M8 5.25v6.5" />
  </svg>
);

// ── Toolbar nav items ──────────────────────────────────────────

type ToolItem = {
  key: string;
  labelKey: 'tool_enhancer' | 'tool_generator' | 'tool_chat' | 'tool_video' | 'tool_upscaler';
  href: string;
  isNew?: boolean;
};

const TOOLS: ToolItem[] = [
  { key: 'enhancer', labelKey: 'tool_enhancer', href: Routes.dashboard.enhance },
  { key: 'generator', labelKey: 'tool_generator', href: Routes.dashboard.generate },
  { key: 'chat', labelKey: 'tool_chat', href: Routes.dashboard.chat },
  { key: 'video', labelKey: 'tool_video', href: Routes.dashboard.video },
  { key: 'upscaler', labelKey: 'tool_upscaler', href: Routes.dashboard.upscale, isNew: true },
];

// ── Header ─────────────────────────────────────────────────────

type Props = {
  initialCredits?: number;
};

export const BoostHeader = (props: Props) => {
  const t = useTranslations('BoostHeader');
  const pathname = usePathname();
  const creditsQuery = useUserCreditBalanceQuery({ initialBalance: props.initialCredits });
  const credits = creditsQuery.data ?? props.initialCredits ?? 0;
  const creditsDepleted = credits <= 0;

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-white/10 bg-black">
      {/* Blueprint grid — aligned with `SiteHeader` */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute inset-0 z-0 bg-linear-to-b from-black via-black to-black/95" />

      <div className="relative z-10 mx-auto flex h-17 w-full max-w-screen-2xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        {/* ── Logo ── */}
        <Link href={Routes.dashboard.index} className="mr-2 flex h-9 shrink-0 items-center sm:mr-3">
          <BrandLogo className="leading-none" />
        </Link>

        {/* ── Tool nav ── */}
        <nav className="flex min-h-0 min-w-0 items-center gap-0.5 overflow-x-auto">
          {TOOLS.map((tool) => {
            const isActive =
              tool.href === Routes.dashboard.index
                ? pathname === Routes.dashboard.index
                : pathname.startsWith(tool.href);
            return (
              <Link
                key={tool.key}
                href={tool.href}
                className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-ui-sm px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand/15 text-brand-light'
                    : 'text-muted hover:bg-white/6 hover:text-foreground'
                }`}
              >
                {t(tool.labelKey)}
                {tool.isNew && (
                  <span className="rounded-pill bg-success/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-success uppercase">
                    {t('tool_new_badge')}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="min-w-0 flex-1" aria-hidden />

        {/* ── Right actions ── */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Chip
            variant="accent"
            href={Routes.dashboard.invite}
            icon={InviteIcon}
            iconClassName="text-emerald-400/85"
          >
            <span className="hidden whitespace-nowrap sm:inline">{t('invite_friends')}</span>
          </Chip>

          <Chip
            variant={creditsDepleted ? 'warning' : 'idle'}
            href={Routes.pricing}
            icon={CreditIcon}
            iconClassName={creditsDepleted ? 'text-amber-400/90' : 'text-zinc-500'}
            className="whitespace-nowrap"
          >
            {t('credits_left', { count: credits })}
          </Chip>

          <Link
            href={Routes.pricing}
            className="hidden h-9 items-center justify-center rounded-ui-sm px-3 text-xs font-medium text-muted transition-colors hover:text-foreground sm:inline-flex"
          >
            {t('pricing_plans')}
          </Link>

          <div className="mx-0.5 h-6 w-px shrink-0 self-center bg-white/10" aria-hidden />

          <LocaleSwitcher />

          <div className="flex h-9 shrink-0 items-center">
            <UserButton
              appearance={{
                elements: {
                  ...clerkUserButtonPopoverElements,
                  avatarBox: 'size-8',
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
