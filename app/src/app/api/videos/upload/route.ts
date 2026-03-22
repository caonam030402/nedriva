/**
 * POST /api/videos/upload
 *
 * Receives a video file, uploads it to R2, extracts metadata with ffprobe,
 * and stores the record in the `videos` table.
 *
 * Auth: required (Clerk session)
 *
 * Body: multipart/form-data
 *   file: Blob — video file (required)
 *
 * Returns:
 *   200 { videoId, inputUrl, metadata: { durationSecs, width, height, fps, sizeBytes } }
 *   400 { error: "..." }
 *   401 { error: "Unauthorized" }
 *   413 { error: "File too large" }  (max 500 MB)
 *   415 { error: "Unsupported media type" }
 */
import type { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/libs/core/DB';
import { videos } from '@/models/VideoEnhancementSchema';
import { uploadVideoToR2, inputKey } from '@/libs/video/storage';
import { probeVideo } from '@/libs/video/ffprobe';
import { ensureAppUserFromCurrentClerkUser } from '@/libs/persistence/users/syncClerkAppUser';

export const maxDuration = 120; // video upload can take a while

const MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureAppUserFromCurrentClerkUser();

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // ── Validate type ────────────────────────────────────────────
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported media type: ${file.type}. Use MP4, WebM, MOV, AVI, or MPEG.` },
      { status: 415 },
    );
  }

  // ── Validate size ────────────────────────────────────────────
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File too large. Maximum size is 500 MB.` },
      { status: 413 },
    );
  }

  const videoId = randomUUID().replace(/-/g, '').slice(0, 24);
  const key = inputKey(userId, videoId, file.name);

  // ── Upload to R2 ─────────────────────────────────────────────
  const buffer = Buffer.from(await file.arrayBuffer());
  const inputUrl = await uploadVideoToR2(buffer, key, file.type);

  // ── Probe metadata (non-blocking — ffprobe may be unavailable) ──
  // Write to a temp file for ffprobe
  const { writeFile } = await import('fs/promises');
  const { tmpdir } = await import('os');
  const tmpPath = `${tmpdir()}/video-probe-${videoId}.${file.name.replace(/.*\./, '')}`;
  await writeFile(tmpPath, buffer);

  const meta = await probeVideo(tmpPath);
  const { rm } = await import('fs/promises');
  await rm(tmpPath).catch(() => { /* best-effort cleanup */ });

  // ── Persist record ───────────────────────────────────────────
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7-day input URL validity

  const [record] = await db
    .insert(videos)
    .values({
      id: videoId,
      userId,
      originalName: file.name,
      mimeType: file.type,
      inputUrl,
      inputUrlExpiresAt: expiresAt,
      ...(meta
        ? {
            durationSecs: String(meta.durationSecs),
            width: meta.width,
            height: meta.height,
            fps: String(meta.fps),
            sizeBytes: String(meta.sizeBytes),
          }
        : {}),
    })
    .returning();

  if (!record) throw new Error('Failed to insert video record');

  return NextResponse.json({
    videoId: record.id,
    inputUrl: record.inputUrl,
    metadata: meta ?? null,
  });
}
