import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
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
    <div className="flex h-[100dvh] max-h-dvh flex-col overflow-hidden bg-page text-foreground">
      <BoostHeader initialCredits={headerCredits} />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{props.children}</main>
    </div>
  );
}
