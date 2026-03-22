/**
 * POST /api/videos/upload
 *
 * Finalizes a video upload by probing metadata from R2 and updating the DB record.
 * The raw file was uploaded directly by the browser via a presigned PUT URL
 * (see POST /api/videos/upload-url).
 *
 * Auth: required (Clerk session)
 *
 * Body: JSON
 * {
 *   videoId: string,
 * }
 *
 * Returns:
 *   200 { videoId, inputUrl, metadata: { durationSecs, width, height, fps, sizeBytes } }
 *   400 { error: "..." }
 *   401 { error: "Unauthorized" }
 *   404 { error: "Video not found" }
 */
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/core/DB';
import { probeVideo } from '@/libs/video/ffprobe';
import { videos } from '@/models/VideoEnhancementSchema';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { videoId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { videoId } = body;
  if (!videoId || typeof videoId !== 'string') {
    return NextResponse.json({ error: 'Missing field: videoId' }, { status: 400 });
  }

  const [video] = await db
    .select({ id: videos.id, userId: videos.userId, inputUrl: videos.inputUrl, mimeType: videos.mimeType })
    .from(videos)
    .where(eq(videos.id, videoId))
    .limit(1);

  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  if (video.userId !== userId) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

  // Probe metadata from R2 (download → ffprobe → discard temp file)
  let meta: { durationSecs: number; width: number; height: number; fps: number; sizeBytes: number } | null = null;
  try {
    const { downloadTempFile } = await import('@/libs/video/ffprobe');
    const tmpPath = await downloadTempFile(video.inputUrl, videoId);
    if (tmpPath) {
      const probed = await probeVideo(tmpPath);
      if (probed) {
        meta = probed;
        const { rm } = await import('node:fs/promises');
        await rm(tmpPath).catch(() => { /* best-effort cleanup */ });
      }
    }
  } catch {
    // ffprobe failure is non-fatal — metadata will be null
  }

  // Update record with metadata
  await db
    .update(videos)
    .set(
      meta
        ? {
            durationSecs: String(meta.durationSecs),
            width: meta.width,
            height: meta.height,
            fps: String(meta.fps),
            sizeBytes: String(meta.sizeBytes),
          }
        : {},
    )
    .where(eq(videos.id, videoId));

  return NextResponse.json({ videoId, inputUrl: video.inputUrl, metadata: meta });
}
