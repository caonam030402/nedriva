/**
 * Video enhancement data model.
 *
 * Tables:
 *   videos            — raw uploaded video + metadata
 *   enhancement_jobs  — each enhancement pass on a video
 *   user_video_usage  — credits consumed per user per job
 */
import {
  pgTable,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './Schema';

/* ── videos ──────────────────────────────────────────────────── */

export const videos = pgTable(
  'videos',
  {
    /** Primary key */
    id: varchar('id', { length: 32 }).primaryKey(),
    /** Uploaded by this user (nullable for anonymous uploads) */
    userId: varchar('user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    /** Original filename */
    originalName: text('original_name').notNull(),
    /** MIME type */
    mimeType: varchar('mime_type', { length: 64 }).notNull(),
    /** Duration in seconds */
    durationSecs: numeric('duration_secs', { precision: 10, scale: 3 }),
    /** Width in pixels */
    width: integer('width'),
    /** Height in pixels */
    height: integer('height'),
    /** File size in bytes */
    sizeBytes: numeric('size_bytes', { precision: 20 }),
    /** FPS */
    fps: numeric('fps', { precision: 6, scale: 3 }),
    /** S3 key for the raw upload */
    inputUrl: text('input_url').notNull(),
    /** Pre-signed URL expiry timestamp */
    inputUrlExpiresAt: timestamp('input_url_expires_at', { withTimezone: true }),
    /** S3 key for the enhanced output (set when done) */
    outputUrl: text('output_url'),
    /** Pre-signed URL expiry for output */
    outputUrlExpiresAt: timestamp('output_url_expires_at', { withTimezone: true }),
    /** Upload timestamp */
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  t => [
    index('videos_user_id_idx').on(t.userId),
    index('videos_created_at_idx').on(t.createdAt),
  ],
);

/* ── enhancement_jobs ────────────────────────────────────────── */

/** Status of a single enhancement job */
export const EVideoJobStatus = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  DONE: 'done',
  FAILED: 'failed',
} as const;
export type TVideoJobStatus = (typeof EVideoJobStatus)[keyof typeof EVideoJobStatus];

/** Upscale factor */
export const EUpscaleFactor = {
  AUTO: 'auto',
  X2: '2x',
  X4: '4x',
} as const;
export type TUpscaleFactor = (typeof EUpscaleFactor)[keyof typeof EUpscaleFactor];

/** Enhancement style */
export const EEnhancementStyle = {
  CINEMATIC: 'cinematic',
  SOCIAL: 'social',
  NATURAL: 'natural',
} as const;
export type TEnhancementStyle =
  (typeof EEnhancementStyle)[keyof typeof EEnhancementStyle];

/** JSON shape for the options column */
export interface VideoEnhancementOptions {
  upscaleFactor: TUpscaleFactor;
  denoise: boolean;
  deblur: boolean;
  faceEnhance: boolean;
  style: TEnhancementStyle;
}

export const enhancementJobs = pgTable(
  'enhancement_jobs',
  {
    /** Primary key */
    id: varchar('id', { length: 32 }).primaryKey(),
    /** Which video this job is enhancing */
    videoId: varchar('video_id', { length: 32 })
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    /** User who owns this job */
    userId: varchar('user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    /** Enhancement options snapshot (JSON) */
    options: jsonb('options').notNull().$type<VideoEnhancementOptions>(),
    /** Cost in credits at time of submission */
    creditCost: integer('credit_cost').notNull().default(10),
    /** Current status */
    status: varchar('status', { length: 20 })
      .notNull()
      .default(EVideoJobStatus.QUEUED),
    /** Processing progress 0–100 */
    progress: integer('progress').notNull().default(0),
    /** Error message if failed */
    errorMessage: text('error_message'),
    /** Stage label shown to user */
    stageLabel: text('stage_label'),
    /** Pre-signed URL for result (valid while outputUrlExpiresAt) */
    resultUrl: text('result_url'),
    /** Output URL expiry */
    resultUrlExpiresAt: timestamp('result_url_expires_at', { withTimezone: true }),
    /** Job enqueued at */
    queuedAt: timestamp('queued_at', { withTimezone: true }),
    /** Processing started at */
    processingStartedAt: timestamp('processing_started_at', { withTimezone: true }),
    /** Completed at */
    completedAt: timestamp('completed_at', { withTimezone: true }),
    /** Created at */
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  t => [
    index('enhancement_jobs_video_id_idx').on(t.videoId),
    index('enhancement_jobs_user_id_idx').on(t.userId),
    index('enhancement_jobs_status_idx').on(t.status),
    index('enhancement_jobs_created_at_idx').on(t.createdAt),
  ],
);

/* ── user_video_usage ────────────────────────────────────────── */

/**
 * Credits consumed per user per video enhancement job.
 * Mirrors the pattern used for image-enhancer credits.
 */
export const userVideoUsage = pgTable(
  'user_video_usage',
  {
    id: varchar('id', { length: 32 }).primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    jobId: varchar('job_id', { length: 32 })
      .notNull()
      .references(() => enhancementJobs.id, { onDelete: 'cascade' }),
    videoId: varchar('video_id', { length: 32 })
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    creditsUsed: integer('credits_used').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  t => [
    index('user_video_usage_user_id_idx').on(t.userId),
    uniqueIndex('user_video_usage_job_id_idx').on(t.jobId),
  ],
);

/* ── Infer types ──────────────────────────────────────────────── */

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type EnhancementJob = typeof enhancementJobs.$inferSelect;
export type NewEnhancementJob = typeof enhancementJobs.$inferInsert;
export type UserVideoUsage = typeof userVideoUsage.$inferSelect;
