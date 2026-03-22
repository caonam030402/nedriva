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
