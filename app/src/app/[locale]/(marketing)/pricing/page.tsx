import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PricingPlansPage } from '@/components/pages/pricing-plans/PricingPlansPage';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'CreditsPage' });
  return { title: `Nedriva — ${t('meta_title')}` };
}

export default async function PricingPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <PricingPlansPage />;
}
