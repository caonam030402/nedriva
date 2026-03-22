import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { EnhancerHistoryMyImagesView } from '@/components/pages/boost/enhancer-image/history';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Nedriva — My images' };
}

export default async function BoostHistoryPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <EnhancerHistoryMyImagesView showPageChrome />;
}
