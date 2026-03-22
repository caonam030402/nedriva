-- ============================================================
--  Video Enhancement Schema
-- ============================================================

-- ── videos ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "videos" (
  "id"               varchar(32)   NOT NULL PRIMARY KEY,
  "user_id"          varchar(64)  REFERENCES "users"("id") ON DELETE SET NULL,
  "original_name"    text          NOT NULL,
  "mime_type"        varchar(64)   NOT NULL,
  "duration_secs"    numeric(10,3),
  "width"            integer,
  "height"           integer,
  "size_bytes"       numeric(20),
  "fps"              numeric(6,3),
  "input_url"        text          NOT NULL,
  "input_url_expires_at" timestamptz,
  "output_url"       text,
  "output_url_expires_at" timestamptz,
  "created_at"        timestamptz   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "videos_user_id_idx"     ON "videos"("user_id");
CREATE INDEX IF NOT EXISTS "videos_created_at_idx" ON "videos"("created_at");

COMMENT ON TABLE "videos" IS
  'Uploaded raw video files — metadata extracted from FFmpeg at upload time.';

-- ── enhancement_jobs ──────────────────────────────────────────
-- status: queued | processing | done | failed
-- options: JSON with upscaleFactor, denoise, deblur, faceEnhance, style

CREATE TABLE IF NOT EXISTS "enhancement_jobs" (
  "id"                   varchar(32)   NOT NULL PRIMARY KEY,
  "video_id"             varchar(32)   NOT NULL REFERENCES "videos"("id") ON DELETE CASCADE,
  "user_id"              varchar(64)   REFERENCES "users"("id") ON DELETE SET NULL,
  "options"              jsonb         NOT NULL,
  "credit_cost"          integer       NOT NULL DEFAULT 10,
  "status"               varchar(20)   NOT NULL DEFAULT 'queued',
  "progress"             integer       NOT NULL DEFAULT 0,
  "error_message"        text,
  "stage_label"          text,
  "result_url"           text,
  "result_url_expires_at" timestamptz,
  "queued_at"            timestamptz,
  "processing_started_at" timestamptz,
  "completed_at"         timestamptz,
  "created_at"           timestamptz   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "enhancement_jobs_video_id_idx"  ON "enhancement_jobs"("video_id");
CREATE INDEX IF NOT EXISTS "enhancement_jobs_user_id_idx"  ON "enhancement_jobs"("user_id");
CREATE INDEX IF NOT EXISTS "enhancement_jobs_status_idx"  ON "enhancement_jobs"("status");
CREATE INDEX IF NOT EXISTS "enhancement_jobs_created_at_idx" ON "enhancement_jobs"("created_at");

COMMENT ON TABLE "enhancement_jobs" IS
  'Each row = one enhancement run on a video. Pipeline worker owns status/progress updates.';

-- ── user_video_usage ──────────────────────────────────────────
-- Credits consumed per job (mirrors image-enhancer user_usage pattern)

CREATE TABLE IF NOT EXISTS "user_video_usage" (
  "id"            varchar(32)   NOT NULL PRIMARY KEY,
  "user_id"       varchar(64)   NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "job_id"        varchar(32)   NOT NULL REFERENCES "enhancement_jobs"("id") ON DELETE CASCADE,
  "video_id"      varchar(32)   NOT NULL REFERENCES "videos"("id") ON DELETE CASCADE,
  "credits_used"  integer       NOT NULL,
  "created_at"    timestamptz   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "user_video_usage_user_id_idx" ON "user_video_usage"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "user_video_usage_job_id_idx" ON "user_video_usage"("job_id");
