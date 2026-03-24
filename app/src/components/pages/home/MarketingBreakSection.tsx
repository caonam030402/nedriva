import { getTranslations } from 'next-intl/server';
import { Link } from '@/libs/i18n/I18nNavigation';
import { Button } from '@/components/ui/Button';

export const MarketingBreakSection = async () => {
  const t = await getTranslations('HomePage');

  return (
    <section className="relative overflow-hidden border-t border-white/6 bg-black py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'var(--gradient-hero)' }}
      />
      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <Link href="/sign-up" className="inline-flex">
          <Button variant="secondary" size="lg">
            {t('brand_break_cta')}
          </Button>
        </Link>
        <h2 className="text-glow-heading mt-14 font-display text-[clamp(2.75rem,11vw,7.5rem)] leading-[0.95] font-semibold tracking-tight text-foreground/95">
          Nedriva
        </h2>
      </div>
    </section>
  );
};
