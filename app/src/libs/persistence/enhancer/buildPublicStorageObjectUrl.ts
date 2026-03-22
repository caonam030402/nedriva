import { Env } from '@/libs/core/Env';

/**
 * Builds the same public object URL shape as `POST /api/process` (`STORAGE_PUBLIC_BASE_URL` + encoded key).
 * Returns `null` when the base URL is not configured or the key is empty.
 * @param objectKey - R2 object key, e.g. `inputs/{userId}/{queueItemId}/{filename}`.
 */
export function buildPublicStorageObjectUrl(objectKey: string): string | null {
  const raw = Env.STORAGE_PUBLIC_BASE_URL;
  if (raw == null || raw === '' || objectKey.trim() === '') {
    return null;
  }
  const base = raw.replace(/\/$/, '');
  /** Match `uploadSourceImage` — single join; encode in the browser if a segment needs it. */
  return `${base}/${objectKey}`;
}
