/**
 * Storage and upload runtime constants — shared across image and video pipelines.
 */

/** Max filename length after sanitization (enforced in upload URL generation + download proxy). */
export const MAX_FILENAME_CHARS = 200;

/** Presigned PUT URL expiry (seconds) for image uploads — 10 min. */
export const IMAGE_UPLOAD_PRESIGNED_EXPIRY_SECS = 600;

/** Presigned PUT URL expiry (seconds) for video uploads — 15 min. */
export const VIDEO_UPLOAD_PRESIGNED_EXPIRY_SECS = 900;

/** Max video file size (bytes) — 500 MB. */
export const VIDEO_MAX_SIZE_BYTES = 500 * 1024 * 1024;
