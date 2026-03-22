import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { SocialProofSection } from './SocialProofSection';
import { TestimonialsSection } from './TestimonialsSection';
import { ToolsSection } from './ToolsSection';
import { UseCaseSection } from './UseCaseSection';
import { ValuePropSection } from './ValuePropSection';

export default function HomeView() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <SocialProofSection />
      <TestimonialsSection />
      <ToolsSection />
      <UseCaseSection />
      <ValuePropSection />
    </>
  );
}
