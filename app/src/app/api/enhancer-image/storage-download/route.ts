/**
 * GET /api/enhancer-image/storage-download?url=&filename=
 *
 * Proxies a public storage object (R2) as `Content-Disposition: attachment` so the browser
 * downloads in-tab without opening a new tab (avoids cross-origin fetch + `window.open` fallback).
 * Only URLs under `STORAGE_PUBLIC_BASE_URL` are allowed (SSRF guard).
 */
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { MAX_FILENAME_CHARS } from '@/constants/storage';
import { Env } from '@/libs/core/Env';

export const maxDuration = 60;

function normalizeBaseUrl(raw: string): URL {
  const trimmed = raw.trim();
  const withSlash = trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
  return new URL(withSlash);
}

function isUrlUnderStoragePublicBase(targetStr: string): boolean {
  const baseRaw = Env.STORAGE_PUBLIC_BASE_URL;
  if (baseRaw == null || baseRaw.trim() === '') {
    return false;
  }
  let target: URL;
  let base: URL;
  try {
    target = new URL(targetStr);
    base = normalizeBaseUrl(baseRaw);
  } catch {
    return false;
  }
  if (target.origin !== base.origin) {
    return false;
  }
  const basePath = base.pathname.replace(/\/$/, '') || '';
  const targetPath = target.pathname;
  if (basePath !== '' && !targetPath.startsWith(basePath)) {
    return false;
  }
  return true;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\]/g, '').slice(0, MAX_FILENAME_CHARS) || 'download';
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const urlParam = req.nextUrl.searchParams.get('url');
  const filenameParam = req.nextUrl.searchParams.get('filename') ?? 'image';

  if (urlParam == null || urlParam === '') {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  let targetUrl: string;
  try {
    targetUrl = decodeURIComponent(urlParam);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (!isUrlUnderStoragePublicBase(targetUrl)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const upstream = await fetch(targetUrl, {
      redirect: 'follow',
      cache: 'no-store',
      headers: { Accept: 'image/*,*/*' },
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream failed' }, { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
    const buf = await upstream.arrayBuffer();
    const safeName = sanitizeFilename(filenameParam);
    const ascii = safeName.replace(/[^\x20-\x7E]/g, '_');
    const utf = encodeURIComponent(safeName);
    const contentDisposition = `attachment; filename="${ascii}"; filename*=UTF-8''${utf}`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 502 });
  }
}
