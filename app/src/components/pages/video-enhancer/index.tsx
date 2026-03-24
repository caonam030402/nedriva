import { VideoEnhancerDemoSection } from './VideoEnhancerDemoSection';
import { VideoEnhancerFaq } from './VideoEnhancerFaq';
import { VideoEnhancerFeatures } from './VideoEnhancerFeatures';
import { VideoEnhancerHero } from './VideoEnhancerHero';
import { VideoEnhancerHowItWorks } from './VideoEnhancerHowItWorks';
import { VideoEnhancerMoreTools } from './VideoEnhancerMoreTools';
import { VideoEnhancerSocialProof } from './VideoEnhancerSocialProof';
import { VideoEnhancerUseCases } from './VideoEnhancerUseCases';

export async function VideoEnhancerView() {
  return (
    <>
      <VideoEnhancerHero />
      <VideoEnhancerSocialProof />
      <VideoEnhancerDemoSection />
      <VideoEnhancerFeatures />
      <VideoEnhancerHowItWorks />
      <VideoEnhancerUseCases />
      <VideoEnhancerMoreTools />
      <VideoEnhancerFaq />
    </>
  );
}
