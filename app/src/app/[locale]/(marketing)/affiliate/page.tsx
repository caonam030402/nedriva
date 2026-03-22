import { redirect } from 'next/navigation';
import { getI18nPath } from '@/utils/Helpers';
import { Routes } from '@/utils/Routes';

type Props = { params: Promise<{ locale: string }> };

/** Legacy `/affiliate` → canonical affiliate program URL. */
export default async function AffiliateLegacyRedirect(props: Props) {
  const { locale } = await props.params;
  redirect(getI18nPath(Routes.affiliateProgram, locale));
}
