import { getTranslations } from 'next-intl/server';
import { VIDEO_ENHANCER_DEMO_YOUTUBE_ID } from '@/constants/marketing/videoEnhancer';

export async function VideoEnhancerDemoSection() {
  const t = await getTranslations('VideoEnhancer');
  const embedId = VIDEO_ENHANCER_DEMO_YOUTUBE_ID.trim();

  return (
    <section className="border-b border-white/10 bg-page py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t('demo_title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{t('demo_desc')}</p>
        </div>

        <div className="mt-12 overflow-hidden rounded-card border border-white/[0.08] bg-black/30 shadow-card">
          {embedId ? (
            <iframe
              title={t('demo_title')}
              className="aspect-video h-auto min-h-[240px] w-full"
              src={`https://www.youtube-nocookie.com/embed/${embedId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex aspect-video min-h-[220px] flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 to-black p-8 text-center">
              <p className="text-sm text-muted">{t('demo_video_placeholder')}</p>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-subtle">{t('demo_caption')}</p>
      </div>
    </section>
  );
}
