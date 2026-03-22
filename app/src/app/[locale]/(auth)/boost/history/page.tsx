import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { EnhancerHistoryMyImages } from '@/components/pages/boost/enhance-image/EnhancerHistoryMyImages';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Nedriva — My images' };
}

export default async function BoostHistoryPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <EnhancerHistoryMyImages showPageChrome />;
}
