import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Cormorant_Garamond } from 'next/font/google';
import { notFound } from 'next/navigation';
import { PostHogProvider } from '@/components/providers/PostHogProvider';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { clerkAppearance } from '@/libs/core/ClerkAppearance';
import { getClerkAuthUrls, getClerkLocalization } from '@/libs/core/clerkAuthUrls';
import { routing } from '@/libs/i18n/I18nRouting';
import '@/styles/global.css';

const marketingDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-marketing-display',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const clerkUrls = getClerkAuthUrls(locale);

  // HeroUI: `data-theme="dark"` drives overlay tokens. Clerk wraps the locale tree so marketing pages get session (SignedIn / UserButton).
  return (
    <html
      lang={locale}
      data-theme="dark"
      className={marketingDisplay.variable}
      suppressHydrationWarning
    >
      <body>
        <ClerkProvider
          appearance={clerkAppearance}
          localization={getClerkLocalization(locale)}
          {...clerkUrls}
        >
          <NextIntlClientProvider>
            <PostHogProvider>
              <ReactQueryProvider>{props.children}</ReactQueryProvider>
            </PostHogProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
