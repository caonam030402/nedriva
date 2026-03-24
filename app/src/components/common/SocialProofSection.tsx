'use client';

/**
 * SocialProofSection — Marquee logos section.
 * Props: logos array (name + svg), eyebrow, fadeEdges
 */
import type { ReactNode } from 'react';

type Logo = {
  name: string;
  svg: ReactNode;
};

type SocialProofSectionProps = {
  logos: Logo[];
  eyebrow?: string;
  className?: string;
};

export const SocialProofSection = (props: SocialProofSectionProps) => {
  const doubled = [...props.logos, ...props.logos];

  return (
    <section className={`border-y border-white/[0.06] bg-surface py-10 ${props.className ?? ''}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {props.eyebrow && (
          <p className="mb-8 text-center text-xs font-semibold tracking-widest text-subtle uppercase">
            {props.eyebrow}
          </p>
        )}

        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-surface to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-surface to-transparent" />

          {/* Infinite scroll track */}
          <div className="animate-marquee flex w-max items-center gap-12 hover:paused">
            {doubled.map((logo, i) => (
              <div
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

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
      `}</style>
    </section>
  );
};
