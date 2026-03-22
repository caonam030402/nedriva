'use client';

import { UserButton } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher';
import { useUserCreditBalanceQuery } from '@/hooks/react-query/queries/user/useUserCreditBalanceQuery';
import { clerkUserButtonPopoverElements } from '@/libs/core/ClerkUserButtonAppearance';
import { Link, usePathname } from '@/libs/i18n/I18nNavigation';
import { Routes } from '@/utils/Routes';

/* ── Tool nav items ──────────────────────────────────────────── */

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

/* ── Invite icon ─────────────────────────────────────────────── */

const InviteIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 14c0-2.485 2.462-4.5 5.5-4.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v4m-2-2h4" />
  </svg>
);

/* ── Credits icon ────────────────────────────────────────────── */

const CreditIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5 text-warning">
    <path
      fillRule="evenodd"
      d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 0a1 1 0 11-2 0 1 1 0 012 0zm-1-5.25a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 2.75z"
      clipRule="evenodd"
    />
  </svg>
);

/* ── Component ───────────────────────────────────────────────── */

type Props = {
  /** Seed from RSC layout — React Query keeps balance fresh after enhance */
  initialCredits?: number;
};

export const BoostHeader = (props: Props) => {
  const t = useTranslations('BoostHeader');
  const pathname = usePathname();
  const creditsQuery = useUserCreditBalanceQuery({ initialBalance: props.initialCredits });
  const credits = creditsQuery.data ?? props.initialCredits ?? 0;

  return (
    <header className="sticky top-0 z-60 border-b border-white/6">
      {/* bg + blur on a child so header doesn't create a backdrop-filter stacking context */}
      <div
        className="absolute inset-0 -z-10 backdrop-blur-md"
        style={{ background: 'rgba(9,8,15,0.80)' }}
      />
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-2 overflow-x-auto px-4 sm:gap-3 sm:px-6">
        {/* ── Logo ── */}
        <Link href={Routes.dashboard.index} className="mr-3 flex shrink-0 items-center gap-2.5">
          <div
            className="flex size-8 items-center justify-center rounded-ui-sm"
            style={{ background: 'var(--gradient-cta)' }}
          >
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="font-bold text-foreground">Nedriva</span>
        </Link>

        {/* ── Tool tabs ── */}
        <nav className="flex items-center gap-0.5">
          {TOOLS.map((tool) => {
            const isActive =
              tool.href === Routes.dashboard.index
                ? pathname === Routes.dashboard.index
                : pathname.startsWith(tool.href);
            return (
              <Link
                key={tool.key}
                href={tool.href}
                className={`flex shrink-0 items-center gap-1.5 rounded-ui-sm px-3 py-2 text-sm font-medium transition-all duration-150 ${
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

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Right controls ── */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Invite friends */}
          <Link
            href={Routes.dashboard.invite}
            className="flex items-center gap-1.5 rounded-ui-sm border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-colors hover:border-success/50 hover:bg-success/20"
          >
            <InviteIcon />
            <span className="hidden sm:inline">{t('invite_friends')}</span>
          </Link>

          {/* Credits → public pricing (no login required) */}
          <Link
            href={Routes.pricing}
            className="flex items-center gap-1.5 rounded-ui-sm border border-warning/20 bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning transition-colors hover:border-warning/40"
          >
            <CreditIcon />
            {t('credits_left', { count: credits })}
          </Link>

          {/* Pricing plans */}
          <Link
            href={Routes.pricing}
            className="hidden items-center rounded-ui-sm px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground sm:flex"
          >
            {t('pricing_plans')}
          </Link>

          {/* Divider */}
          <div className="mx-0.5 h-5 w-px bg-white/10" />

          {/* Locale switcher */}
          <LocaleSwitcher />

          {/* Clerk UserButton */}
          <UserButton
            appearance={{
              elements: {
                ...clerkUserButtonPopoverElements,
                avatarBox: 'size-7',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
};
