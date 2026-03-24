/**
 * POST /api/bg-remover/upload-url
 *
 * Server generates a presigned PUT URL so the browser uploads directly to R2
 * (bypasses Next.js — no file size limits, no CPU/memory cost on server).
 *
 * Auth: required (Clerk session)
 *
 * Body: JSON
 * {
 *   filename:    string,
 *   contentType: string,   // e.g. "image/png"
 *   folder:      string,  // appended as `inputs/{userId}/{folder}/{filename}`
 * }
 *
 * Returns: 200 { uploadUrl, fileKey, url }
 *          400 { error: "..." }
 *          401 { error: "Unauthorized" }
 */
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/libs/storage/imageStorage';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body == null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const filename =
    typeof b.filename === 'string' && b.filename.trim() !== ''
      ? b.filename.trim()
      : null;
  const contentType =
    typeof b.contentType === 'string' && b.contentType.trim() !== ''
      ? b.contentType.trim()
      : null;
  const folder =
    typeof b.folder === 'string' && b.folder.trim() !== ''
      ? b.folder.trim()
      : null;

  if (!filename || !contentType || !folder) {
    return NextResponse.json(
      { error: 'Missing fields: filename, contentType, folder' },
      { status: 400 },
    );
  }

  try {
    const result = await getPresignedUploadUrl(userId, folder, filename, contentType);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate upload URL';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
