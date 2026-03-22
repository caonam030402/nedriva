/**
 * Video storage utilities — uploads raw video to R2, generates signed result URLs.
 */

const BASE_URL = process.env.STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? '';
const BUCKET = process.env.STORAGE_BUCKET ?? '';
const REGION = process.env.STORAGE_REGION ?? 'auto';
const ENDPOINT = process.env.STORAGE_ENDPOINT_URL;
const ACCESS_KEY = process.env.STORAGE_ACCESS_KEY ?? '';
const SECRET_KEY = process.env.STORAGE_SECRET_KEY ?? '';

/** S3 key for a raw input video */
export function inputKey(userId: string, videoId: string, filename: string) {
  return `videos/inputs/${userId}/${videoId}/${filename}`;
}

/** S3 key for an enhanced output video */
export function outputKey(userId: string, videoId: string, jobId: string) {
  return `videos/outputs/${userId}/${videoId}/${jobId}.mp4`;
}

/** S3 key for intermediate frames (deleted after reassembly) */
export function framesDir(userId: string, videoId: string, jobId: string) {
  return `videos/frames/${userId}/${videoId}/${jobId}`;
}

/**
 * Upload a raw video file to R2 via the S3 SDK.
 * Returns the public URL of the uploaded file.
 */
export async function uploadVideoToR2(
  file: Buffer,
  key: string,
  mimeType: string,
): Promise<string> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const client = new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: mimeType,
      ACL: 'public-read',
    }),
  );

  return `${BASE_URL}/${key}`;
}

/**
 * Generate a pre-signed PUT URL for direct browser → R2 upload.
 * Expires after `durationSecs` (default 15 minutes).
 */
export async function getPresignedPutUrl(
  key: string,
  mimeType: string,
  durationSecs = 900,
): Promise<string> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

  const client = new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  });

  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: mimeType,
      ACL: 'public-read',
    }),
    { expiresIn: durationSecs },
  );
}

/**
 * Generate a pre-signed GET URL for a private output file.
 * Expires after `durationSecs` (default 1 hour).
 */
export async function getSignedResultUrl(
  key: string,
  durationSecs = 3600,
): Promise<string> {
  const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

  const client = new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  });

  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: durationSecs },
  );
}

/** Upload from a URL (e.g. result from a processing service) to R2 */
export async function uploadFromUrlToR2(
  sourceUrl: string,
  destKey: string,
): Promise<string> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch source for upload: ${response.status} ${sourceUrl}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return uploadVideoToR2(buffer, destKey, 'video/mp4');
}

/** Public URL for any S3 key */
export function publicUrl(key: string): string {
  return `${BASE_URL}/${key}`;
}
