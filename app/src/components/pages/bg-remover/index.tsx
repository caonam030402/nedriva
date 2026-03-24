import { BgRemoverComparison } from './BgRemoverComparison';
import { BgRemoverEdgeCases } from './BgRemoverEdgeCases';
import { BgRemoverExamples } from './BgRemoverExamples';
import { BgRemoverFaq } from './BgRemoverFaq';
import { BgRemoverHero } from './BgRemoverHero';
import { BgRemoverHowItWorks } from './BgRemoverHowItWorks';
import { BgRemoverMoreTools } from './BgRemoverMoreTools';

export async function BgRemoverView() {
  return (
    <>
      <BgRemoverHero />
      <BgRemoverExamples />
      <BgRemoverHowItWorks />
      <BgRemoverEdgeCases />
      <BgRemoverComparison />
      <BgRemoverMoreTools />
      <BgRemoverFaq />
    </>
  );
}
