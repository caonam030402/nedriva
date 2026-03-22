import { getTranslations } from 'next-intl/server';

const PRESS_LOGOS = [
  {
    name: 'Mashable',
    svg: (
      <svg viewBox="0 0 120 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Georgia, serif" fontSize="22" fontWeight="700">Mashable</text>
      </svg>
    ),
  },
  {
    name: 'The Next Web',
    svg: (
      <svg viewBox="0 0 48 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="900">TNW</text>
      </svg>
    ),
  },
  {
    name: 'TechCrunch',
    svg: (
      <svg viewBox="0 0 160 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700">TechCrunch</text>
      </svg>
    ),
  },
  {
    name: 'Product Hunt',
    svg: (
      <svg viewBox="0 0 160 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700">Product Hunt</text>
      </svg>
    ),
  },
  {
    name: 'Wired',
    svg: (
      <svg viewBox="0 0 80 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Georgia, serif" fontSize="22" fontWeight="900">WIRED</text>
      </svg>
    ),
  },
  {
    name: 'The Verge',
    svg: (
      <svg viewBox="0 0 120 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700">The Verge</text>
      </svg>
    ),
  },
  {
    name: 'VentureBeat',
    svg: (
      <svg viewBox="0 0 148 32" fill="currentColor" className="h-5 w-auto">
        <text x="0" y="24" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700">VentureBeat</text>
      </svg>
    ),
  },
];

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
