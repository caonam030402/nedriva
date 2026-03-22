import type { OpsState } from '@/types/enhancer';
import { ENHANCER_RUNS_TABLE_PAGE_SIZE } from '@/constants/enhancerHistory';
import {
  EBgType,
  EMoreModel,
  EScaleFactor,
  ESizeMode,
  EUpscaleModel,
} from '@/enums/enhancer-image';
import { calcEnhancerCreditsFromOps } from '@/libs/helpers/enhancer-image/calcCreditsFromOps';

/** Max images that may be in “processing” at once (local + server-backed rows). */
export const ENHANCER_MAX_CONCURRENT_PROCESSING = 4;

/** Per-file upload limit (matches UI hint). */
export const ENHANCER_MAX_UPLOAD_FILE_MB = 50;
export const ENHANCER_MAX_UPLOAD_FILE_BYTES = ENHANCER_MAX_UPLOAD_FILE_MB * 1024 * 1024;

/** Max local queue rows (Ready / Processing / Done kept in table). */
export const ENHANCER_MAX_LOCAL_QUEUE_ITEMS = 100;

/** Table rows per page (queue list in Enhancer) — same as `ENHANCER_RUNS_TABLE_PAGE_SIZE`. */
export const ENHANCER_QUEUE_TABLE_PAGE_SIZE = ENHANCER_RUNS_TABLE_PAGE_SIZE;

/** Grid cards per page (“My Images”). */
export const ENHANCER_MY_IMAGES_PAGE_SIZE = 12;

export const INITIAL_OPS: OpsState = {
  upscaleEnabled: true,
  upscaleModel: EUpscaleModel.Prime,
  moreModel: EMoreModel.Balanced,
  sizeMode: ESizeMode.Auto,
  scaleFactor: EScaleFactor.X4,
  customWidth: 1920,
  customHeight: 1080,
  lightAIEnabled: false,
  lightAIIntensity: 30,
  removeBgEnabled: false,
  bgType: EBgType.General,
  clipToObject: false,
};

export const UPSCALE_MODELS: {
  id: EUpscaleModel;
  label: string;
  tooltip: string;
  previewUrl: string;
}[] = [
  {
    id: EUpscaleModel.Prime,
    label: 'Prime',
    tooltip:
      'Our most realistic upscaler. Best for portraits, skin, and fine textures. Excels at product, fashion, and food photography.',
    previewUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=480&q=80',
  },
  {
    id: EUpscaleModel.Gentle,
    label: 'Gentle',
    tooltip:
      'Subtle enhancement that preserves the original. Good for product photos and images with small text (former "Image with Text").',
    previewUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=480&q=80',
  },
  {
    id: EUpscaleModel.OldPhoto,
    label: 'Old photo',
    tooltip: 'Restore & colorize old damaged photos. Output is 1 MP, ready to upscale.',
    previewUrl: 'https://images.unsplash.com/photo-1516914589923-f105f1535f88?w=480&q=80',
  },
  {
    id: EUpscaleModel.TryAll,
    label: 'Try all',
    tooltip: 'See how Prime, Gentle, and Old Photo handle your image. 3 credits / 3 outputs',
    previewUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=480&q=80',
  },
  {
    id: EUpscaleModel.More,
    label: 'More models',
    tooltip: 'Includes Balanced, Strong, Ultra, and specialized options',
    previewUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=480&q=80',
  },
];

export const SCALE_FACTORS: { value: EScaleFactor; label: string }[] = [
  { value: EScaleFactor.X1, label: '1x' },
  { value: EScaleFactor.X2, label: '2x' },
  { value: EScaleFactor.X4, label: '4x' },
  { value: EScaleFactor.X8, label: '8x' },
  { value: EScaleFactor.X16, label: '16x' },
];

export const SIZE_MODES: { id: ESizeMode; label: string; requiresPaid?: boolean }[] = [
  { id: ESizeMode.Auto, label: 'Auto' },
  { id: ESizeMode.Scale, label: 'Scale' },
  { id: ESizeMode.Custom, label: 'Width & Height', requiresPaid: true },
];

export const MORE_MODELS: { id: EMoreModel; label: string }[] = [
  { id: EMoreModel.Balanced, label: 'Balanced' },
  { id: EMoreModel.Ultra, label: 'Ultra' },
  { id: EMoreModel.Strong, label: 'Strong' },
  { id: EMoreModel.DigiArt, label: 'DigiArt' },
  { id: EMoreModel.Magic, label: 'Magic' },
];

/** Per-model capability config — UI renders options based on what each model supports. */
type ModelConfig = {
  sizeModes: ESizeMode[];
  subModels?: { id: EMoreModel; label: string }[];
  disableLightAI?: boolean;
  disableRemoveBg?: boolean;
};

export const MODEL_CONFIGS: Record<EUpscaleModel, ModelConfig> = {
  [EUpscaleModel.Prime]: { sizeModes: [ESizeMode.Auto, ESizeMode.Scale, ESizeMode.Custom] },
  [EUpscaleModel.Gentle]: { sizeModes: [ESizeMode.Auto, ESizeMode.Scale, ESizeMode.Custom] },
  [EUpscaleModel.OldPhoto]: {
    sizeModes: [ESizeMode.Auto, ESizeMode.Custom],
    disableLightAI: true,
    disableRemoveBg: true,
  },
  [EUpscaleModel.TryAll]: {
    sizeModes: [ESizeMode.Auto, ESizeMode.Custom],
    disableLightAI: true,
    disableRemoveBg: true,
  },
  [EUpscaleModel.More]: {
    sizeModes: [ESizeMode.Auto, ESizeMode.Scale, ESizeMode.Custom],
    subModels: MORE_MODELS,
  },
};

/**
 * Builds the render-ready config for a given model.
 * Add new derived flags here as the feature grows.
 * @param model - the currently selected upscale model
 * @param currentSizeMode - the currently selected size mode
 * @param isPaidUser - whether the current user has an active paid subscription
 */
export function buildRenderConfig(
  model: EUpscaleModel,
  currentSizeMode: ESizeMode,
  isPaidUser: boolean,
) {
  const config = MODEL_CONFIGS[model];

  const sizeModes = SIZE_MODES.map((m) => ({
    ...m,
    disabled: !config.sizeModes.includes(m.id),
    locked: !!(config.sizeModes.includes(m.id) && m.requiresPaid && !isPaidUser),
  }));

  return {
    sizeModes,
    subModels: config.subModels ?? null,
    showFactor: currentSizeMode === ESizeMode.Scale,
    showCustomSize: currentSizeMode === ESizeMode.Custom && isPaidUser,
    disableLightAI: config.disableLightAI ?? false,
    disableRemoveBg: config.disableRemoveBg ?? false,
    defaultSizeMode:
      config.sizeModes.includes(currentSizeMode) &&
      !(SIZE_MODES.find((m) => m.id === currentSizeMode)?.requiresPaid && !isPaidUser)
        ? currentSizeMode
        : ESizeMode.Auto,
  };
}

export const FILE_LIST_HEADERS = [
  { key: 'thumb', label: '' },
  { key: 'name', label: 'Name' },
  { key: 'input', label: 'Input' },
  { key: 'output', label: 'Output' },
  /** Status badge + actions — one grid column; inner layout in `QueueRow`. */
  { key: 'status', label: 'Status' },
];

/**
 * Must match `QueueRow` — thumb + **equal** name/input/output + status (`minmax` floor).
 * Use with `gap-x-4` so column gutters are even.
 */
export const ENHANCER_QUEUE_GRID_CLASS =
  'grid grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(12rem,1fr)]';

/** Even column gutters + light row rhythm (header + data rows). */
export const ENHANCER_QUEUE_ROW_GAP_CLASS = 'gap-x-4 gap-y-1';

/** Inner STATUS cell: fixed space between badge and icon group. */
export const ENHANCER_QUEUE_STATUS_INNER_GAP_CLASS = 'gap-x-4';

/**
 * When “Keep in queue” is unchecked, Done rows are removed from the table after this delay.
 * History (“My Images”) still lists the output — user sees both briefly to confirm completion.
 */

export const PRESET_GROUPS = [
  {
    group: 'Posters',
    items: [
      { label: '9 × 11 in', metric: '21.6 × 27.9 cm' },
      { label: '11 × 17 in', metric: '27.9 × 43.2 cm' },
      { label: '18 × 24 in', metric: '45.7 × 61 cm' },
      { label: '18 × 36 in', metric: '45.7 × 91.4 cm' },
      { label: '24 × 36 in', metric: '61 × 91.4 cm' },
    ],
  },
  {
    group: 'Photo',
    items: [
      { label: '8 × 6 in', metric: '20.3 × 15.2 cm' },
      { label: '8 × 8 in', metric: '20.3 × 20.3 cm' },
      { label: '8 × 11 in', metric: '20.3 × 27.9 cm' },
      { label: '8 × 12 in', metric: '20.3 × 30.5 cm' },
      { label: '12 × 8 in', metric: '30.5 × 20.3 cm' },
      { label: '9 × 12 in', metric: '22.9 × 30.5 cm' },
      { label: '12 × 12 in', metric: '30.5 × 30.5 cm' },
      { label: '16 × 12 in', metric: '40.6 × 30.5 cm' },
      { label: '18 × 12 in', metric: '45.7 × 30.5 cm' },
    ],
  },
  {
    group: 'International papers',
    items: [
      { label: 'A5', metric: '14.8 × 21 cm' },
      { label: 'A4', metric: '21 × 29.7 cm' },
      { label: 'A3', metric: '29.7 × 41 cm' },
      { label: 'A2', metric: '42 × 59.4 cm' },
      { label: 'A1', metric: '59.4 × 84.1 cm' },
      { label: 'A0', metric: '84.1 × 118.9 cm' },
    ],
  },
];

/**
 * UI alias — server uses `calcEnhancerCreditsFromOps` from `@/libs/enhancer/calcCreditsFromOps`.
 * @param ops - enhancer pipeline toggles
 */
export function calcCredits(ops: OpsState): number {
  return calcEnhancerCreditsFromOps(ops);
}
