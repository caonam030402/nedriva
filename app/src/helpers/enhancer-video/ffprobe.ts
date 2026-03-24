/**
 * Extract video metadata (duration, resolution, fps) via ffprobe.
 * Runs as a subprocess; ffprobe must be available on the host.
 */

export type VideoMetadata = {
  durationSecs: number;
  width: number;
  height: number;
  fps: number;
  sizeBytes: number;
};

/**
 * Download a file from a remote URL to a local temp path.
 * Returns the local path, or null on failure.
 * @param url
 * @param prefix
 */
export async function downloadTempFile(url: string, prefix: string): Promise<string | null> {
  try {
    const { writeFile, mkdir } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');

    const dir = join(tmpdir(), 'nedriva-ffprobe');
    await mkdir(dir, { recursive: true });

    const filename = `${prefix}-${Date.now()}.mp4`;
    const tmpPath = join(dir, filename);

    const response = await fetch(url);
    if (!response.ok) return null;

    // eslint-disable-next-line node/prefer-global/buffer
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(tmpPath, buffer);
    return tmpPath;
  } catch {
    return null;
  }
}

/**
 * Probe a video file at `inputPath` (local path or remote URL).
 * Returns null if ffprobe is unavailable.
 * @param inputPath
 */
export async function probeVideo(inputPath: string): Promise<VideoMetadata | null> {
  try {
    const { execSync } = await import('node:child_process');

    // Ask ffprobe to output JSON with stream info
    const json = execSync(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${inputPath}"`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
    );

    const probe = JSON.parse(json) as {
      format: {
        duration?: string;
        size?: string;
      };
      streams: Array<{
        codec_type: string;
        width?: number;
        height?: number;
        r_frame_rate?: string;
      }>;
    };

    const videoStream = probe.streams.find((s) => s.codec_type === 'video');
    if (!videoStream || !probe.format) return null;

    const fpsStr = videoStream.r_frame_rate ?? '30/1';
    const parts = fpsStr.split('/').map(Number);
    const num = parts[0] ?? 30;
    const den = parts[1] ?? 1;
    const fps = den > 0 ? num / den : 30;

    return {
      durationSecs: Number.parseFloat(probe.format.duration ?? '0'),
      width: videoStream.width ?? 0,
      height: videoStream.height ?? 0,
      fps,
      sizeBytes: Number.parseInt(probe.format.size ?? '0', 10),
    };
  } catch {
    // ffprobe not available or video unreadable — return null, caller handles
    return null;
  }
}
