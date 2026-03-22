import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HeroSection } from '@/components/pages/marketing/HeroSection';
import { HowItWorksSection } from '@/components/pages/marketing/HowItWorksSection';
import { SocialProofSection } from '@/components/pages/marketing/SocialProofSection';
import { TestimonialsSection } from '@/components/pages/marketing/TestimonialsSection';
import { ToolsSection } from '@/components/pages/marketing/ToolsSection';
import { UseCaseSection } from '@/components/pages/marketing/UseCaseSection';
import { ValuePropSection } from '@/components/pages/marketing/ValuePropSection';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function HomePage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <SocialProofSection />
      <UseCaseSection />
      <ValuePropSection />
      <HowItWorksSection />
      <ToolsSection />
      <TestimonialsSection />
      {/* <PricingSection />    */}
      {/* <HowItWorksSection /> */}
      {/* <PricingSection />    */}
      {/* <TestimonialsSection /> */}
      {/* <CtaBannerSection />  */}
    </>
  );
}
