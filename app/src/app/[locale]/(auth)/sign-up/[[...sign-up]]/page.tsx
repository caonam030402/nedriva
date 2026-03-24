import type { Metadata } from 'next';
import { SignUp } from '@clerk/nextjs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PendingReferralCookieSetter } from '@/components/pages/invite/referral/PendingReferralCookieSetter';
import { ReferralClickTracker } from '@/components/pages/invite/referral/ReferralClickTracker';
import { clerkAppearance } from '@/libs/core/ClerkAppearance';
import { getI18nPath } from '@/utils/Helpers';

type SignUpPageProps = {
  params: Promise<{ locale: string; 'sign-up'?: string[] }>;
  searchParams: Promise<{ ref?: string }>;
};

export async function generateMetadata(props: SignUpPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SignUp',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignUpPage(props: SignUpPageProps) {
  const { locale } = await props.params;
  const { ref: refFromQuery } = await props.searchParams;
  setRequestLocale(locale);

  return (
    <>
      <PendingReferralCookieSetter refCode={refFromQuery ?? null} />
      <ReferralClickTracker refCode={refFromQuery ?? null} />
      <SignUp path={getI18nPath('/sign-up', locale)} appearance={clerkAppearance} />
    </>
  );
}
