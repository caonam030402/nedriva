/** JSON from `GET /api/referrals/me`. */
export type ReferralsMeResponse = {
  code: string;
  link: string;
  inviteCount: number;
  linkClickCount: number;
  /** Invitees who activated a paid plan (subscription bonus paid once per invitee). */
  subscriptionBonusCount: number;
  subscriptionBonusPercent: number;
  creditsPerInviteBusiness: number;
  creditsPerInviteConsumer: number;
};

/** JSON from `GET /api/referrals/me/activity`. */
export type ReferralsMeActivityResponse = {
  creditGrants: Array<{
    id: string;
    email: string;
    grantedAt: string;
    creditsYouEarned: number;
  }>;
  paidBonuses: Array<{
    id: string;
    email: string;
    awardedAt: string;
    /** Referrer bonus in USD: % of `inviteePaidTotalUsd` using current `REFERRAL_SUBSCRIPTION_BONUS_PERCENT`, or stored amount if basis unknown. */
    bonusAmountUsd: number;
    /** Total USD the invitee paid on the charge; null if unknown (legacy). */
    inviteePaidTotalUsd: number | null;
  }>;
};
