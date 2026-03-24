import { setRequestLocale } from 'next-intl/server';

/**
 * Centers embedded Clerk SignIn / SignUp in the same cinematic atmosphere as the marketing hero.
 * ClerkProvider lives in `[locale]/layout.tsx` so both marketing and auth pages share the session.
 * @param props
 * @param props.children
 * @param props.params
 */
export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  setRequestLocale((await props.params).locale);

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-page px-4 py-10 text-foreground sm:py-16">

      {/* Gradient mesh — identical to HeroSection */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'var(--gradient-hero)' }}
      />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Clerk card slot */}
      <div className="relative z-10 w-full max-w-105">
        {props.children}
      </div>

    </div>
  );
}
