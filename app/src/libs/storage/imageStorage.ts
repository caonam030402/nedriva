/**
 * Shared R2 storage helpers — used by both BgRemover and Enhancer.
 *
 * Server-side only (credentials stay secret):
 *   getPresignedUploadUrl(userId, folder, filename, contentType)  → { uploadUrl, fileKey, url }
 *
 * Utilities:
 *   publicUrl(key)   → full public URL from an R2 key
 */
import { IMAGE_UPLOAD_PRESIGNED_EXPIRY_SECS, MAX_FILENAME_CHARS } from '@/constants/storage';

const BASE_URL = process.env.STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? '';

function safeImageFilename(name: string): string {
  const stripped = (name ?? 'image.png').replace(/^.*[/\\]/, '').slice(0, MAX_FILENAME_CHARS);
  return stripped && !stripped.includes('..') ? stripped : 'image.png';
}

/**
 * Generate a presigned PUT URL so the browser uploads directly to R2.
 * Key shape: `inputs/{userId}/{folder}/{filename}`.
 * @param userId
 * @param folder
 * @param filename
 * @param contentType
 */
export async function getPresignedUploadUrl(
  userId: string,
  folder: string,
  filename: string,
  contentType: string,
): Promise<{ uploadUrl: string; fileKey: string; url: string }> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

  const key = `inputs/${userId}/${folder}/${safeImageFilename(filename)}`;

  const client = new S3Client({
    region: 'auto',
    endpoint: process.env.STORAGE_ENDPOINT_URL,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY ?? '',
      secretAccessKey: process.env.STORAGE_SECRET_KEY ?? '',
    },
  });

  const command = new PutObjectCommand({
    Bucket: process.env.STORAGE_BUCKET ?? '',
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: IMAGE_UPLOAD_PRESIGNED_EXPIRY_SECS });

  return { uploadUrl, fileKey: key, url: `${BASE_URL}/${key}` };
}

/**
 * Build the public URL for any R2 key.
 * @param key
 */
export function publicUrl(key: string): string {
  return `${BASE_URL}/${key}`;
}
