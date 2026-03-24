/**
 * Shared types for R2 storage upload.
 */

/** POST /api/upload-url request body */
export type GetPresignedUploadUrlRequest = {
  /** Original filename (used for safe key name only) */
  filename: string;
  /** MIME type, e.g. "image/png", "video/mp4" */
  contentType: string;
  /**
   * Folder name under `inputs/{userId}/`.
   * Examples: "bg-removal", "enhancer", "enhancer/{queueItemId}", "videos/{videoId}"
   */
  folder: string;
};

/** POST /api/upload-url response */
export type GetPresignedUploadUrlResponse = {
  /** Presigned PUT URL — browser uploads directly to R2 */
  uploadUrl: string;
  /** R2 object key, e.g. `inputs/{userId}/bg-removal/photo.png` */
  fileKey: string;
  /** Full public URL, e.g. `https://pub-xxx.r2.dev/inputs/...` */
  url: string;
};
