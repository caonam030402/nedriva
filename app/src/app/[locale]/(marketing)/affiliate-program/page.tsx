import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AffiliateProgramView } from '@/components/pages/marketing/affiliate-program/AffiliateProgramView';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'AffiliateProgram' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function AffiliateProgramPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AffiliateProgramView locale={locale} />;
}
