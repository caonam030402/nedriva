import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { EnhancerImageView } from '@/components/pages/boost/enhancer-image';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Nedriva — Enhancer' };
}

export default async function EnhanceImagePage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <EnhancerImageView />;
}
