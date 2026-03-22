import { randomBytes } from 'node:crypto';

const ALPHANUM = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Short URL-safe referral code (lowercase letters + digits).
 */
export function newReferralCode(): string {
  const buf = randomBytes(10);
  let s = '';
  for (let i = 0; i < 10; i++) {
    s += ALPHANUM[buf[i]! % ALPHANUM.length]!;
  }
  return s;
}
