/**
 * POST /api/videos/upload-url
 *
 * Generates a presigned PUT URL that the browser uses to upload a video
 * directly to R2 — bypassing the Next.js server entirely.
 *
 * Auth: required (Clerk session)
 *
 * Body: JSON
 * {
 *   filename: string,    // original filename (e.g. "my-video.mp4")
 *   mimeType: string,   // e.g. "video/mp4"
 *   sizeBytes: number,  // for client-side validation (optional)
 * }
 *
 * Returns:
 *   200 { videoId, uploadUrl, inputUrl, expiresAt }
 *   400 { error: "..." }
 *   401 { error: "Unauthorized" }
 *   413 { error: "File too large" }
 *   415 { error: "Unsupported media type" }
 */
import type { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/core/DB';
import { getPresignedPutUrl, inputKey } from '@/libs/video/storage';
import { videos } from '@/models/VideoEnhancementSchema';

const MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
const PRESIGNED_EXPIRY_SECS = 900; // 15 minutes
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { filename?: string; mimeType?: string; sizeBytes?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { filename, mimeType, sizeBytes } = body;

  if (!filename || typeof filename !== 'string') {
    return NextResponse.json({ error: 'Missing field: filename' }, { status: 400 });
  }
  if (!mimeType || typeof mimeType !== 'string') {
    return NextResponse.json({ error: 'Missing field: mimeType' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(mimeType)) {
    return NextResponse.json(
      { error: `Unsupported media type: ${mimeType}. Use MP4, WebM, MOV, AVI, or MPEG.` },
      { status: 415 },
    );
  }

  if (sizeBytes && sizeBytes > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File too large. Maximum size is 500 MB.` },
      { status: 413 },
    );
  }

  const videoId = randomUUID().replace(/-/g, '').slice(0, 24);
  const key = inputKey(userId, videoId, filename);

  const [uploadUrl, expiresAt] = await Promise.all([
    getPresignedPutUrl(key, mimeType, PRESIGNED_EXPIRY_SECS),
    new Date(Date.now() + PRESIGNED_EXPIRY_SECS * 1000),
  ]);

  const inputUrl = `${process.env.STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, '')}/${key}`;

  // Pre-create the DB record so it exists even if upload is slow
  await db.insert(videos).values({
    id: videoId,
    userId,
    originalName: filename,
    mimeType,
    inputUrl,
    inputUrlExpiresAt: expiresAt,
  });

  return NextResponse.json({ videoId, uploadUrl, inputUrl, expiresAt: expiresAt.toISOString() });
}
