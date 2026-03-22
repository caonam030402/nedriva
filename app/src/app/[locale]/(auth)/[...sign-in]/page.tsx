import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PendingReferralCookieSetter } from '@/components/pages/invite/referral/PendingReferralCookieSetter';
import { clerkAppearance } from '@/libs/core/ClerkAppearance';
import { getI18nPath } from '@/utils/Helpers';

type SignInPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
};

export async function generateMetadata(props: SignInPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SignIn',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignInPage(props: SignInPageProps) {
  const { locale } = await props.params;
  const { ref: refFromQuery } = await props.searchParams;
  setRequestLocale(locale);

  return (
    <>
      <PendingReferralCookieSetter refCode={refFromQuery ?? null} />
      <SignIn path={getI18nPath('/sign-in', locale)} appearance={clerkAppearance} />
    </>
  );
}
