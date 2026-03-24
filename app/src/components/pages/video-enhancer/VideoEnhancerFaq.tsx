import { getTranslations } from 'next-intl/server';
import { FaqAccordion } from '@/components/ui/FaqAccordion';

const FAQ_IDS = ['faq_1', 'faq_2', 'faq_3', 'faq_4', 'faq_5'] as const;

export async function VideoEnhancerFaq() {
  const t = await getTranslations('VideoEnhancer');

  const items = FAQ_IDS.map(id => ({
    id,
    question: t(`${id}_q`),
    answer: t(`${id}_a`),
  }));

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t('faq_title')}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted">{t('faq_subtitle')}</p>
        <div className="mt-10">
          <FaqAccordion items={items} />
        </div>
      </div>
    </section>
  );
}
