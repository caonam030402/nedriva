/**
 * Browser quirk: <a href="https://other-origin/..." download> is ignored for cross-origin URLs
 * (e.g. public R2 URL). Fetch → blob → object URL forces a real download when CORS allows it.
 *
 * If direct fetch fails (common when R2 CORS is tight), falls back to same-origin
 * `GET /api/enhancer-image/storage-download` (server fetches storage; no new tab).
 */
import { apiRoutes } from '@/constants/apiRoutes';

export function buildOutputFilename(originalFileName: string, outputUrl: string): string {
  const stem = originalFileName.replace(/\.[^.]+$/, '') || 'enhanced';
  try {
    const path = new URL(outputUrl).pathname;
    const m = path.match(/\.([a-z0-9]+)$/i);
    return m ? `${stem}.${m[1]!.toLowerCase()}` : originalFileName;
  } catch {
    return originalFileName;
  }
}

export type DownloadUrlResult = 'saved' | 'failed';

function triggerBlobDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Tries same-tab download: direct CORS fetch to blob, then same-origin storage proxy.
 * Does not open a new browser tab.
 * @param url - Public object URL (e.g. R2)
 * @param filename - Suggested local filename
 */
export async function downloadUrlAsFile(
  url: string,
  filename: string,
): Promise<DownloadUrlResult> {
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit', cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const blob = await res.blob();
    triggerBlobDownload(blob, filename);
    return 'saved';
  } catch {
    /* try server proxy — avoids R2 CORS and keeps user on the app */
  }

  try {
    const proxyUrl
      = `${apiRoutes.enhancerImage.storageDownload}?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const res = await fetch(proxyUrl, { credentials: 'include', cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Proxy HTTP ${res.status}`);
    }
    const blob = await res.blob();
    triggerBlobDownload(blob, filename);
    return 'saved';
  } catch {
    console.warn('[downloadUrlAsFile] Direct and proxy download failed', url);
    return 'failed';
  }
}
