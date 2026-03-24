import { getTranslations } from 'next-intl/server';
import { PRESS_LOGOS } from '@/constants/marketing/pressLogos';

const LOGOS_DOUBLED = [...PRESS_LOGOS, ...PRESS_LOGOS];

export const SocialProofSection = async () => {
  const t = await getTranslations('SocialProof');

  return (
    <section className="border-y border-white/6 bg-surface py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        <p className="mb-8 text-center text-xs font-semibold tracking-widest text-subtle uppercase">
          {t('featured_in')}
        </p>

        <div className="relative overflow-hidden">

          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-surface to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-surface to-transparent" />

          {/* Infinite scroll track */}
          <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-12 hover:paused">
            {LOGOS_DOUBLED.map((logo, i) => (
              <div
              // eslint-disable-next-line react/no-array-index-key
                key={`${logo.name}-${i}`}
                className="flex shrink-0 items-center text-subtle/50 transition-colors duration-300 hover:text-muted"
                title={logo.name}
              >
                {logo.svg}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`@keyframes marquee {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }`}
      </style>
    </section>
  );
};
