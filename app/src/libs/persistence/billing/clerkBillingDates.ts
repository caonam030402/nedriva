/**
 * Clerk Billing webhook payloads use numeric Unix timestamps — mix of seconds and ms depending on field.
 */
export function clerkUnixToDate(value: number | null | undefined): Date | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  const ms = value > 10_000_000_000 ? value : value * 1000;
  return new Date(ms);
}
