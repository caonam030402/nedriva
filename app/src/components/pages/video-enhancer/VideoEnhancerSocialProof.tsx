import { getTranslations } from 'next-intl/server';
import { SocialProofSection } from '@/components/common/SocialProofSection';
import { PRESS_LOGOS } from '@/constants/marketing/pressLogos';

export async function VideoEnhancerSocialProof() {
  const t = await getTranslations('SocialProof');

  return <SocialProofSection logos={PRESS_LOGOS} eyebrow={t('featured_in')} />;
}
