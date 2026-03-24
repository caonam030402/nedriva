import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { MarketingBreakSection } from './MarketingBreakSection';
import { ShowcaseSection } from './ShowcaseSection';
import { SocialProofSection } from './SocialProofSection';
import { TestimonialsSection } from './TestimonialsSection';
import { ToolsSection } from './ToolsSection';
import { UseCaseSection } from './UseCaseSection';
import { ValuePropSection } from './ValuePropSection';

export default function HomeView() {
  return (
    <>
      <HeroSection />
      <SocialProofSection />
      <HowItWorksSection />
      <ShowcaseSection />
      <TestimonialsSection />
      <ToolsSection />
      <UseCaseSection />
      <ValuePropSection />
      <MarketingBreakSection />
    </>
  );
}
