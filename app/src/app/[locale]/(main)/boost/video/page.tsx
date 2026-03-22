import { EnhancerVideoView } from '@/components/pages/boost/enhancer-video';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Nedriva — Video enhance' };
}

export default async function BoostVideoPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <EnhancerVideoView />;
}
