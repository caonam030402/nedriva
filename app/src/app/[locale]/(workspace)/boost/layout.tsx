import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { ClearPendingReferralCookie } from '@/components/common/ClearPendingReferralCookie';
import { BoostHeader } from '@/components/layout/BoostHeader';
import { getUserCreditBalance } from '@/libs/persistence/users/getUserCreditBalance';
import { ensureAppUserFromCurrentClerkUser } from '@/libs/persistence/users/syncClerkAppUser';

export default async function BoostLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const { userId } = await auth();
  let headerCredits = 0;
  if (userId) {
    await ensureAppUserFromCurrentClerkUser();
    headerCredits = await getUserCreditBalance(userId);
  }

  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-page text-foreground">
      {/* Cinematic base — same tokens as auth + marketing hero */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'var(--gradient-hero)' }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {userId ? <ClearPendingReferralCookie /> : null}

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <BoostHeader initialCredits={headerCredits} />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{props.children}</main>
      </div>
    </div>
  );
}
