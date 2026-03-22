import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { count, eq } from 'drizzle-orm';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { InviteReferralExperience } from '@/components/referral/InviteReferralExperience';
import {
  REFERRAL_CREDITS_BUSINESS_EMAIL,
  REFERRAL_CREDITS_CONSUMER_EMAIL,
  REFERRAL_SUBSCRIPTION_BONUS_PERCENT,
} from '@/constants/referral';
import { db } from '@/libs/core/DB';
import { ensureAppUserFromCurrentClerkUser } from '@/libs/persistence/users/syncClerkAppUser';
import { affiliates, referralSubscriptionBonuses, users } from '@/models/Schema';
import { getI18nPath } from '@/utils/Helpers';
import { Routes } from '@/utils/Routes';
import { buildReferralSignupLink } from '@/utils/referralLink';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'InvitePage',
  });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function InvitePage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const { userId } = await auth();
  if (!userId) {
    redirect(getI18nPath(Routes.auth.signIn, locale));
  }

  await ensureAppUserFromCurrentClerkUser();

  const [row] = await db
    .select({
      code: users.referralCode,
      linkClickCount: affiliates.linkClickCount,
    })
    .from(users)
    .leftJoin(affiliates, eq(affiliates.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!row?.code) {
    redirect(getI18nPath(Routes.auth.signIn, locale));
  }

  const [countRow] = await db
    .select({ n: count() })
    .from(users)
    .where(eq(users.referredByUserId, userId));

  const inviteCount = Number(countRow?.n ?? 0);

  const [subBonusRow] = await db
    .select({ n: count() })
    .from(referralSubscriptionBonuses)
    .where(eq(referralSubscriptionBonuses.referrerUserId, userId));

  const subscriptionBonusCount = Number(subBonusRow?.n ?? 0);
  const linkClickCount = Number(row.linkClickCount ?? 0);
  const link = buildReferralSignupLink(locale, row.code);
  const t = await getTranslations('InvitePage');

  return (
    <InviteReferralExperience
      link={link}
      inviteCount={inviteCount}
      linkClickCount={linkClickCount}
      subscriptionBonusCount={subscriptionBonusCount}
      subscriptionBonusPercent={REFERRAL_SUBSCRIPTION_BONUS_PERCENT}
      businessCredits={REFERRAL_CREDITS_BUSINESS_EMAIL}
      consumerCredits={REFERRAL_CREDITS_CONSUMER_EMAIL}
      labels={{
        badge: t('badge'),
        title: t('title'),
        subtitle: t('subtitle'),
        bodyIntro: t('body_intro'),
        statFriendsJoined: t('stat_friends_joined', { count: inviteCount }),
        statFriendsZero: t('stat_friends_zero'),
        shareHint: t('share_hint'),
        linkLabel: t('link_label'),
        linkCardTitle: t('link_card_title'),
        tierWorkLabel: t('tier_work_label'),
        tierPersonalLabel: t('tier_personal_label'),
        bothEarnShort: t('both_earn_short'),
        tierCreditsSuffix: t('tier_credits_suffix'),
        statInvitesSuffix: t('stat_invites_suffix'),
        statClicksSuffix: t('stat_clicks_suffix'),
        statClicksCaption: t('stat_clicks_caption'),
        statSubsSuffix: t('stat_subs_suffix'),
        statSubsLabel: t('stat_subs_label'),
        tierSubLabel: t('tier_sub_label'),
        tierSubDetail: t('tier_sub_detail'),
        statsPanelLabel: t('stats_panel_label'),
        affiliateProgramLink: t('affiliate_program_link'),
        affiliateProgramHref: getI18nPath(Routes.affiliateProgram, locale),
        statClickHintCredit: t('stat_click_hint_credit'),
        statClickHintPaid: t('stat_click_hint_paid'),
        modalTitle: t('modal_title'),
        modalTabCredit: t('modal_tab_credit'),
        modalTabPaid: t('modal_tab_paid'),
        modalColEmail: t('modal_col_email'),
        modalColTime: t('modal_col_time'),
        modalColCredits: t('modal_col_credits'),
        modalColInviteePaidTotalUsd: t('modal_col_invitee_paid_total_usd'),
        modalColUsdEarned: t('modal_col_usd_earned'),
        modalColBonusPercent: t('modal_col_bonus_percent'),
        modalBasisUnknown: t('modal_basis_unknown'),
        modalCreditsUnitHint: t('modal_credits_unit_hint'),
        modalEmptyCredit: t('modal_empty_credit'),
        modalEmptyPaid: t('modal_empty_paid'),
        modalPaidNote: t('modal_paid_note'),
        modalLoadError: t('modal_load_error'),
        modalLoading: t('modal_loading'),
      }}
    />
  );
}
