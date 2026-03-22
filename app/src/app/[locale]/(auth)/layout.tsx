import { setRequestLocale } from 'next-intl/server';

/** ClerkProvider lives in `[locale]/layout.tsx` so marketing + auth share session. */
export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return props.children;
}
