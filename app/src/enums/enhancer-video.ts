/** Video job status — aligns with `EVideoJobStatus` in Schema */
export enum EVideoStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed',
}

/** Video upscale factor */
export enum EUpscaleLevel {
  AUTO = 'auto',
  X2 = '2x',
  X4 = '4x',
}

/** Video enhancement style */
export enum EEnhancementStyle {
  CINEMATIC = 'cinematic',
  SOCIAL = 'social',
  NATURAL = 'natural',
}

export enum EVideoOutputSize {
  AUTO = 'auto',
  HD = 'hd',
  FHD = 'fhd',
  K2 = '2k',
  K4 = '4k',
}

export enum EVideoOutputFormat {
  AUTO = 'auto',
  MP4 = 'mp4',
  WEBM = 'webm',
  MOV = 'mov',
}
