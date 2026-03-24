import { getTranslations } from 'next-intl/server';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Link } from '@/libs/i18n/I18nNavigation';

/* ── Step icons ──────────────────────────────────────────────── */

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-8">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
    />
  </svg>
);

const WandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-8">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-8">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
);

const ArrowRight = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="size-5 text-brand/55"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

/* ── Step 1 mockup: drop zone ────────────────────────────────── */

type Step1MockupProps = { hint: string; hintSub: string };

const Step1Mockup = (props: Step1MockupProps) => (
  <div className="flex flex-col items-center justify-center gap-2.5 rounded-ui-md border-2 border-dashed border-brand/70 bg-black/30 px-4 py-9 text-center transition-colors hover:border-brand hover:bg-brand/[0.06]">
    <div className="flex size-11 items-center justify-center rounded-ui-md bg-brand/20 text-brand-light">
      <UploadIcon />
    </div>
    <p className="text-sm font-semibold text-foreground">{props.hint}</p>
    <p className="text-xs text-muted">{props.hintSub}</p>
  </div>
);

/* ── Step 2 mockup: operation selector ───────────────────────── */

type Step2MockupProps = { ops: string[]; credits: string };

const Step2Mockup = (props: Step2MockupProps) => (
  <div className="space-y-2.5 rounded-ui-md border border-white/10 bg-black/40 p-3">
    <div className="grid grid-cols-2 gap-2">
      {props.ops.map((op, i) => (
        <button
          key={op}
          type="button"
          className={`rounded-ui-sm px-3 py-2.5 text-xs font-semibold transition-colors ${
            i === 0
              ? 'border border-brand bg-brand/15 text-brand-light shadow-[inset_0_0_0_1px_rgba(232,197,71,0.25)]'
              : 'border border-white/[0.08] bg-page/80 text-muted hover:border-white/15 hover:text-foreground'
          }`}
        >
          {op}
        </button>
      ))}
    </div>
    <div className="flex items-center justify-between rounded-ui-sm border border-white/[0.06] bg-page/60 px-3 py-2">
      <span className="text-xs font-medium text-subtle">Cost</span>
      <span className="text-xs font-bold text-brand-light tabular-nums">{props.credits}</span>
    </div>
  </div>
);

/* ── Step 3 mockup: download card ────────────────────────────── */

type Step3MockupProps = { fileName: string; size: string; cta: string };

const Step3Mockup = (props: Step3MockupProps) => (
  <div className="rounded-ui-md border border-success/45 bg-success/[0.07] p-4">
    <div className="mb-3 flex items-center gap-3">
      {/* Thumbnail placeholder */}
      <div className="size-12 shrink-0 overflow-hidden rounded-ui-sm border border-white/10 bg-elevated">
        <img
          src="https://picsum.photos/seed/result/48/48"
          alt="Enhanced result thumbnail"
          className="size-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-foreground">{props.fileName}</p>
        <p className="text-[11px] text-muted">{props.size}</p>
      </div>
      <span className="ml-auto flex size-6 items-center justify-center rounded-full bg-success text-white shadow-[0_0_0_2px_rgba(34,197,94,0.25)]">
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </div>
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-ui-sm bg-success py-2.5 text-xs font-bold text-white shadow-[0_4px_20px_rgba(34,197,94,0.35)] transition-[filter,transform] hover:brightness-110 active:scale-[0.99]"
    >
      <span className="text-white [&_svg]:stroke-[2.2]">
        <DownloadIcon />
      </span>
      {props.cta}
    </button>
  </div>
);

/* ── Main section ────────────────────────────────────────────── */

export const HowItWorksSection = async () => {
  const t = await getTranslations('HowItWorksPage');

  const STEPS = [
    {
      number: '01',
      label: t('step1_label'),
      title: t('step1_title'),
      desc: t('step1_desc'),
      icon: <UploadIcon />,
      mockup: <Step1Mockup hint={t('step1_hint')} hintSub={t('step1_hint_sub')} />,
    },
    {
      number: '02',
      label: t('step2_label'),
      title: t('step2_title'),
      desc: t('step2_desc'),
      icon: <WandIcon />,
      mockup: (
        <Step2Mockup
          ops={[t('step2_op1'), t('step2_op2'), t('step2_op3'), t('step2_op4')]}
          credits={t('step2_credits')}
        />
      ),
    },
    {
      number: '03',
      label: t('step3_label'),
      title: t('step3_title'),
      desc: t('step3_desc'),
      icon: <DownloadIcon />,
      mockup: (
        <Step3Mockup fileName={t('step3_file')} size={t('step3_size')} cta={t('step3_cta')} />
      ),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-page py-20 sm:py-28">
      {/* Faint grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <SectionHeader
            badge={t('eyebrow_badge')}
            title={t('headline')}
            titleGradient={t('headline_gradient')}
            subtitle={t('subtext')}
            align="center"
            timeBadge={t('time_badge')}
          />
        </div>

        {/* ── Steps ── */}
        <div className="relative">
          {/* Connector line — desktop (through step circle centers) */}
          <div
            className="absolute top-7 right-[12%] left-[12%] z-0 hidden h-[2px] lg:block"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(232,197,71,0.35) 8%, #e8c547 45%, #e8c547 55%, rgba(232,197,71,0.35) 92%, transparent 100%)',
              boxShadow: '0 0 12px rgba(232, 197, 71, 0.25)',
            }}
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative z-10 flex flex-col">
                {/* Step number badge */}
                <div className="mb-6 flex items-center gap-4 lg:flex-col lg:items-start">
                  <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-page text-lg font-extrabold text-brand-light shadow-[0_0_24px_rgba(232,197,71,0.2)] lg:mx-auto">
                    <span className="relative">{step.number}</span>
                  </div>

                  {/* Arrow between steps — mobile/tablet */}
                  {i < STEPS.length - 1 && (
                    <div className="flex items-center lg:hidden">
                      <div className="h-px w-8 bg-brand/35" />
                      <ArrowRight />
                    </div>
                  )}
                </div>

                {/* Content card */}
                <div className="flex flex-1 flex-col rounded-card border border-white/10 bg-elevated/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-[2px]">
                  {/* Icon + label */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-ui-md bg-brand/20 text-brand-light">
                      {step.icon}
                    </div>
                    <span className="text-[11px] font-bold tracking-[0.2em] text-brand-light uppercase">
                      {step.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-lg font-bold tracking-tight text-foreground">{step.title}</h3>

                  {/* Description */}
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-muted">{step.desc}</p>

                  {/* UI Mockup */}
                  {step.mockup}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Link href="/sign-up" className="inline-flex">
            <Button variant="primary" size="lg" className="gap-2">
              <span aria-hidden>✨</span>
              {t('cta_try')}
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <p className="text-sm text-subtle">{t('cta_sub')}</p>
        </div>
      </div>
    </section>
  );
};
