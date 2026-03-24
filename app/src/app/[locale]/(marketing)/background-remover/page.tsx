import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BgRemoverView } from '@/components/pages/bg-remover';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'BgRemover' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function BgRemoverPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <BgRemoverView />;
}
