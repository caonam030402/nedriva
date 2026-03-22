/**
 * Monthly plan pricing derived from Clerk Dashboard (USD).
 * Key = monthly_credit_allowance value in DB.
 * Rates are used to display referral bonuses in US$ — not stored in DB.
 */
export const MONTHLY_CREDIT_ALLOWANCE_USD: ReadonlyMap<number, number> = new Map([
  [100, 9],    // Starter
  [300, 24],   // Pro
  [500, 34],   // Max
  [1000, 72],  // Business 1000
  [2500, 149], // Business 2500
  [5000, 279], // Business 5000
]);

/**
 * USD price per credit for each plan tier (monthly USD ÷ monthly credits).
 */
export const USD_PER_CREDIT: ReadonlyMap<number, number> = new Map(
  [...MONTHLY_CREDIT_ALLOWANCE_USD.entries()].map(([credits, usd]) => [
    credits,
    usd / credits,
  ]),
);

/**
 * Convert a referral bonus creditsAwarded to approximate USD.
 * Uses the invitee's plan allowance to determine per-credit rate.
 */
export function bonusCreditsToUsd(
  monthlyCreditAllowanceBasis: number,
  creditsAwarded: number,
): number {
  const rate = USD_PER_CREDIT.get(monthlyCreditAllowanceBasis);
  if (rate == null) return 0;
  return creditsAwarded * rate;
}

/**
 * One-time subscription referral bonus in USD: `percent` of invitee paid basis (invoice total USD),
 * rounded to cents (min $0.01 if basis > 0).
 */
export function computeReferralSubscriptionBonusUsd(
  inviteePaidBasisUsd: number,
  bonusPercent: number,
): number {
  if (!(inviteePaidBasisUsd > 0) || !(bonusPercent > 0)) {
    return 0;
  }
  const raw = (inviteePaidBasisUsd * bonusPercent) / 100;
  const rounded = Math.round(raw * 100) / 100;
  if (rounded > 0) {
    return rounded;
  }
  return 0.01;
}
