import type { ReactNode } from 'react';
import { Link } from '@/libs/i18n/I18nNavigation';
import { CopyReferralLinkButton } from './CopyReferralLinkButton';
import { ReferralStatsPanel } from './ReferralStatsPanel';

type Labels = {
  badge: string;
  title: string;
  subtitle: string;
  bodyIntro: string;
  statFriendsJoined: string;
  statFriendsZero: string;
  shareHint: string;
  linkLabel: string;
  linkCardTitle: string;
  tierWorkLabel: string;
  tierPersonalLabel: string;
  tierSubLabel: string;
  tierSubDetail: string;
  bothEarnShort: string;
  tierCreditsSuffix: string;
  statInvitesSuffix: string;
  statClicksSuffix: string;
  statClicksCaption: string;
  statSubsSuffix: string;
  statSubsLabel: string;
  statsPanelLabel: string;
  affiliateProgramLink: string;
  affiliateProgramHref: string;
  statClickHintCredit: string;
  statClickHintPaid: string;
  modalTitle: string;
  modalTabCredit: string;
  modalTabPaid: string;
  modalColEmail: string;
  modalColTime: string;
  modalColCredits: string;
  modalColInviteePaidTotalUsd: string;
  modalColUsdEarned: string;
  modalColBonusPercent: string;
  modalBasisUnknown: string;
  modalCreditsUnitHint: string;
  modalEmptyCredit: string;
  modalEmptyPaid: string;
  modalPaidNote: string;
  modalLoadError: string;
  modalLoading: string;
};

type Props = {
  link: string;
  inviteCount: number;
  linkClickCount: number;
  subscriptionBonusCount: number;
  subscriptionBonusPercent: number;
  businessCredits: number;
  consumerCredits: number;
  labels: Labels;
};

function BriefcaseIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={props.className} aria-hidden>
      <path
        d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M4 9h16v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 12h16" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function MailIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={props.className} aria-hidden>
      <path d="M4 6h16v12H4V6z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparklesIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={props.className} aria-hidden>
      <path
        d="M9.5 3.5 11 8l4.5 1.5L11 11l-1.5 4.5L8 11 3.5 9.5 8 8l1.5-4.5zM17.5 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
        stroke="currentColor"
        strokeWidth={1.35}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RewardTierCard(props: {
  borderClass: string;
  bgClass: string;
  iconWrapClass: string;
  icon: ReactNode;
  label: string;
  value: ReactNode;
  footer: string | null;
}) {
  const { borderClass, bgClass, iconWrapClass, icon, label, value, footer } = props;
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border px-5 py-5 backdrop-blur-md ${borderClass} ${bgClass}`}
    >
      <div className="flex flex-1 gap-4">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${iconWrapClass}`}
        >
          {icon}
        </div>
        <div className="grid min-w-0 flex-1 grid-rows-[auto_minmax(2.85rem,auto)_minmax(2.75rem,auto)] content-start gap-0.5">
          <p className="text-xs font-semibold tracking-wider text-subtle uppercase">{label}</p>
          <div className="flex items-center">{value}</div>
          <p className="text-xs leading-snug text-muted">{footer ?? '\u00A0'}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Decorative illustration (SVG) — gold / amber tones matching the invite page.
 * @param props - SVG root props
 * @param props.className - Size / placement (Tailwind)
 */
function ReferralShareIllustration(props: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={props.className} aria-hidden>
      <defs>
        <linearGradient id="invite-art-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8c547" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#e8a23a" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="invite-art-mint" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.75" />
        </linearGradient>
        <filter id="invite-art-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="100" r="78" fill="url(#invite-art-gold)" opacity="0.12" />
      <circle
        cx="100"
        cy="100"
        r="58"
        fill="none"
        stroke="url(#invite-art-gold)"
        strokeWidth="1"
        opacity="0.35"
      />
      <path
        d="M52 102h36M112 102h36"
        stroke="url(#invite-art-gold)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />
      <g filter="url(#invite-art-glow)">
        <circle
          cx="52"
          cy="102"
          r="22"
          fill="#1e1b2e"
          stroke="url(#invite-art-gold)"
          strokeWidth="2"
        />
        <circle
          cx="148"
          cy="102"
          r="22"
          fill="#1e1b2e"
          stroke="url(#invite-art-mint)"
          strokeWidth="2"
        />
        <rect
          x="84"
          y="86"
          width="32"
          height="32"
          rx="10"
          fill="#1a1625"
          stroke="url(#invite-art-gold)"
          strokeWidth="2"
        />
        <path
          d="M100 94v12M94 100h12"
          stroke="url(#invite-art-mint)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
      <circle cx="100" cy="44" r="4" fill="#f5d978" opacity="0.8" />
      <circle cx="156" cy="64" r="3" fill="#e8c547" opacity="0.65" />
      <circle cx="44" cy="64" r="3" fill="#34d399" opacity="0.55" />
    </svg>
  );
}

export function InviteReferralExperience(props: Props) {
  const {
    link,
    inviteCount,
    linkClickCount,
    subscriptionBonusCount,
    subscriptionBonusPercent,
    businessCredits,
    consumerCredits,
    labels,
  } = props;

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto">
      {/* Background: vertical light streak + corners */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute top-0 left-1/2 h-[min(70vh,32rem)] w-[min(100%,42rem)] -translate-x-1/2 opacity-50 blur-[100px]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.35) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute -right-20 bottom-0 h-72 w-72 rounded-full opacity-30 blur-[90px]"
          style={{
            background: 'radial-gradient(circle, rgba(192,38,211,0.4) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:max-w-4xl lg:py-14">
        {/* ── Hero: centered ── */}
        <header className="mb-10 flex flex-col items-center text-center sm:mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-pill border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-brand-light uppercase backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
            {labels.badge}
          </div>
          <h1
            className="text-3xl font-bold tracking-tight text-balance sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-[1.1]"
            style={{
              background: 'var(--gradient-text)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {labels.title}
          </h1>
          <p className="mt-3 max-w-lg text-base font-medium text-foreground/95 sm:text-lg">
            {labels.subtitle}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-pretty text-muted sm:text-base">
            {labels.bodyIntro}{' '}
            <span className="font-medium text-brand-light">{labels.bothEarnShort}</span>
          </p>
        </header>

        {/* ── Reward row: equal height, consistent layout ── */}
        <div className="mb-10 grid grid-cols-1 items-stretch gap-3 sm:mb-12 sm:grid-cols-3 sm:gap-4">
          <RewardTierCard
            borderClass="border-brand/20"
            bgClass="bg-brand/8"
            iconWrapClass="bg-brand/20 text-brand-light"
            icon={<BriefcaseIcon className="size-6" />}
            label={labels.tierWorkLabel}
            value={
              <p className="text-2xl font-bold text-foreground tabular-nums sm:text-3xl">
                +{businessCredits}{' '}
                <span className="text-base font-semibold text-muted">
                  {labels.tierCreditsSuffix}
                </span>
              </p>
            }
            footer={null}
          />
          <RewardTierCard
            borderClass="border-accent/25"
            bgClass="bg-accent/8"
            iconWrapClass="bg-accent/20 text-accent-light"
            icon={<MailIcon className="size-6" />}
            label={labels.tierPersonalLabel}
            value={
              <p className="text-2xl font-bold text-foreground tabular-nums sm:text-3xl">
                +{consumerCredits}{' '}
                <span className="text-base font-semibold text-muted">
                  {labels.tierCreditsSuffix}
                </span>
              </p>
            }
            footer={null}
          />
          <RewardTierCard
            borderClass="border-emerald-500/25"
            bgClass="bg-emerald-500/7"
            iconWrapClass="bg-emerald-500/20 text-emerald-200"
            icon={<SparklesIcon className="size-6" />}
            label={labels.tierSubLabel}
            value={
              <p className="text-2xl font-bold text-foreground tabular-nums sm:text-3xl">
                {subscriptionBonusPercent}%
              </p>
            }
            footer={labels.tierSubDetail}
          />
        </div>

        {/* ── Panel: full-width link + stats below (avoid empty left column on desktop) ── */}
        <div
          className="overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(18,15,30,0.5) 100%)',
            boxShadow: '0 24px 80px -40px rgba(232, 197, 71, 0.2)',
          }}
        >
          <div className="p-6 sm:p-8">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(180px,260px)] lg:gap-10">
              <div className="mx-auto w-full max-w-xl space-y-4 text-center lg:mx-0 lg:max-w-none lg:text-left">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-brand-light/90 uppercase">
                    {labels.linkCardTitle}
                  </p>
                  <p className="mt-1 text-sm text-muted">{labels.linkLabel}</p>
                </div>
                <div className="relative">
                  <input
                    readOnly
                    value={link}
                    className="w-full rounded-xl border border-white/10 bg-black/35 px-3.5 py-3.5 pr-4 text-left font-mono text-[11px] leading-relaxed text-foreground/90 shadow-inner ring-brand/25 transition-shadow outline-none focus-visible:ring-2 sm:text-xs"
                    aria-label={labels.linkLabel}
                  />
                  <div
                    className="pointer-events-none absolute inset-y-0 right-0 w-14 rounded-r-xl bg-linear-to-l from-[#09080f] to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="flex justify-center lg:justify-start">
                  <CopyReferralLinkButton
                    link={link}
                    className="min-h-12 w-full max-w-sm rounded-xl font-semibold shadow-[0_4px_24px_rgba(232,197,71,0.28)] sm:max-w-none lg:w-auto lg:min-w-[min(100%,280px)]"
                  />
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative shrink-0">
                  <div
                    className="absolute inset-0 scale-110 rounded-full opacity-40 blur-3xl"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 50%, rgba(167,139,250,0.45) 0%, transparent 65%)',
                    }}
                    aria-hidden
                  />
                  <ReferralShareIllustration className="relative h-36 w-36 sm:h-44 sm:w-44 lg:h-52 lg:w-52" />
                </div>
              </div>
            </div>

            <div
              className="my-8 h-px w-full bg-linear-to-r from-transparent via-white/15 to-transparent"
              aria-hidden
            />

            <ReferralStatsPanel
              inviteCount={inviteCount}
              linkClickCount={linkClickCount}
              subscriptionBonusCount={subscriptionBonusCount}
              subscriptionBonusPercent={subscriptionBonusPercent}
              labels={{
                statsPanelLabel: labels.statsPanelLabel,
                statInvitesSuffix: labels.statInvitesSuffix,
                statFriendsJoined: labels.statFriendsJoined,
                statFriendsZero: labels.statFriendsZero,
                statClicksSuffix: labels.statClicksSuffix,
                statClicksCaption: labels.statClicksCaption,
                statSubsLabel: labels.statSubsLabel,
                statSubsSuffix: labels.statSubsSuffix,
                shareHint: labels.shareHint,
                statClickHintCredit: labels.statClickHintCredit,
                statClickHintPaid: labels.statClickHintPaid,
              }}
              modalCopy={{
                title: labels.modalTitle,
                tabCredit: labels.modalTabCredit,
                tabPaid: labels.modalTabPaid,
                creditTable: {
                  email: labels.modalColEmail,
                  time: labels.modalColTime,
                  credits: labels.modalColCredits,
                  empty: labels.modalEmptyCredit,
                },
                paidBonusesTable: {
                  email: labels.modalColEmail,
                  time: labels.modalColTime,
                  inviteePaidTotalUsd: labels.modalColInviteePaidTotalUsd,
                  bonusPercent: labels.modalColBonusPercent,
                  usdEarned: labels.modalColUsdEarned,
                  empty: labels.modalEmptyPaid,
                  basisUnknown: labels.modalBasisUnknown,
                },
                paidNote: labels.modalPaidNote,
                loadError: labels.modalLoadError,
                loading: labels.modalLoading,
              }}
            />
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-subtle">
          <Link
            href={labels.affiliateProgramHref}
            className="font-medium text-brand-light underline-offset-4 hover:underline"
          >
            {labels.affiliateProgramLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
