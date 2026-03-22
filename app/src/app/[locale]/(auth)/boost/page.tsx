import { EnhancerUploadZone } from '@/components/pages/boost/enhance-image/EnhancerUploadZone';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Nedriva — Enhancer' };
}

export default async function DashboardPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <EnhancerUploadZone />;
}
