import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { BgRemoverView } from '@/components/pages/boost/bg-remover/BgRemoverView';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Nedriva — Background Remover' };
}

export default async function BgRemoverPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <BgRemoverView />;
}
