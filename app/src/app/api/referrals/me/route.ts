/**
 * GET /api/referrals/me — referral code, share link, invite count (session).
 */
import { auth } from '@clerk/nextjs/server';
import { count, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import {
  REFERRAL_CREDITS_BUSINESS_EMAIL,
  REFERRAL_CREDITS_CONSUMER_EMAIL,
  REFERRAL_SUBSCRIPTION_BONUS_PERCENT,
} from '@/constants/referral';
import { db } from '@/libs/core/DB';
import { ensureAppUserFromCurrentClerkUser } from '@/libs/persistence/users/syncClerkAppUser';
import { affiliates, referralSubscriptionBonuses, users } from '@/models/Schema';
import { AppConfig } from '@/utils/AppConfig';
import { buildReferralSignupLink } from '@/utils/referralLink';

function localeForReferralLink(request: Request): string {
  const q = new URL(request.url).searchParams.get('locale');
  if (q && AppConfig.i18n.locales.includes(q as 'en' | 'fr')) {
    return q;
  }
  const ref = request.headers.get('referer');
  if (ref) {
    try {
      const path = new URL(ref).pathname;
      for (const loc of AppConfig.i18n.locales) {
        if (path === `/${loc}` || path.startsWith(`/${loc}/`)) {
          return loc;
        }
      }
    } catch {
      /* ignore */
    }
  }
  return AppConfig.i18n.defaultLocale;
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

  const locale = localeForReferralLink(request);
  const link = buildReferralSignupLink(locale, row.code);

  return NextResponse.json({
    code: row.code,
    link,
    inviteCount,
    linkClickCount: Number(row.linkClickCount ?? 0),
    subscriptionBonusCount,
    subscriptionBonusPercent: REFERRAL_SUBSCRIPTION_BONUS_PERCENT,
    creditsPerInviteBusiness: REFERRAL_CREDITS_BUSINESS_EMAIL,
    creditsPerInviteConsumer: REFERRAL_CREDITS_CONSUMER_EMAIL,
  });
}
