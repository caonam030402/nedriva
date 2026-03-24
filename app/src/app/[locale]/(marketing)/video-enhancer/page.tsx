import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { VideoEnhancerView } from '@/components/pages/video-enhancer';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'VideoEnhancer' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function VideoEnhancerPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <VideoEnhancerView />;
}
