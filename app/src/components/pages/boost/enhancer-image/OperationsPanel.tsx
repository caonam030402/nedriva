'use client';

import type { EMoreModel, ESizeMode } from '@/enums/enhancer-image';
import type { OpsState } from '@/types/enhancer';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { Input } from '@/components/ui/Input';
import { PillGroup } from '@/components/ui/PillGroup';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Slider } from '@/components/ui/Slider';
import { Switch } from '@/components/ui/Switch';
import { EBgType } from '@/enums/enhancer-image';
import { Link } from '@/libs/i18n/I18nNavigation';
import {
  buildRenderConfig,
  SCALE_FACTORS,
  UPSCALE_MODELS,
} from '../../../../constants/enhancerImage';

/* ── Section ─────────────────────────────────────────────────── */

const Section = (props: {
  label: string;
  tooltip: string;
  toggleable?: boolean;
  enabled?: boolean;
  disabled?: boolean;
  onToggle?: (v: boolean) => void;
  children?: React.ReactNode;
}) => (
  <div className={`border-b border-white/8 px-4 py-4 ${props.disabled ? 'opacity-40' : ''}`}>
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-foreground">{props.label}</span>
        <InfoTooltip text={props.tooltip} />
      </div>
      {props.toggleable && props.onToggle && (
        <Switch
          isSelected={!props.disabled && (props.enabled ?? false)}
          onChange={props.disabled ? () => {} : props.onToggle}
          label={props.label}
        />
      )}
    </div>
    {props.children}
  </div>
);

/* ── OperationsPanel ─────────────────────────────────────────── */

type Props = {
  ops: OpsState;
  setOps: React.Dispatch<React.SetStateAction<OpsState>>;
  credits: number;
  hasFiles: boolean;
  isPaidUser?: boolean;
  onEnhance: () => void;
};

export const OperationsPanel = (props: Props) => {
  const t = useTranslations('Enhancer');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { ops, setOps } = props;
  const isPaidUser = props.isPaidUser ?? true;
  const render = buildRenderConfig(ops.upscaleModel, ops.sizeMode, isPaidUser);

  return (
    <div className="grid h-full min-h-0 w-full flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
      <div className="isolate min-h-0 touch-pan-y overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        {/* Upscale & Enhance */}
        <Section
          label={t('section_upscale')}
          tooltip={t('tooltip_upscale')}
          toggleable
          enabled={ops.upscaleEnabled}
          onToggle={(v) => setOps((s) => ({ ...s, upscaleEnabled: v }))}
        >
          {ops.upscaleEnabled && (
            <>
              <PillGroup
                options={UPSCALE_MODELS.map((m) => ({
                  id: m.id,
                  label: m.label,
                  tooltip: m.tooltip,
                  previewUrl: m.previewUrl,
                }))}
                value={ops.upscaleModel}
                onChange={(id) => {
                  const model = id as typeof ops.upscaleModel;
                  setOps((s) => ({
                    ...s,
                    upscaleModel: model,
                    sizeMode: buildRenderConfig(model, s.sizeMode, isPaidUser).defaultSizeMode,
                  }));
                }}
              />
              <AnimatePresence>
                {render.subModels && (
                  <motion.div
                    key="sub-models"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 border-l-2 border-brand/40 pl-3">
                      <p className="mb-2 text-[10px] font-semibold tracking-widest text-subtle uppercase">
                        {t('choose_model')}
                      </p>
                      <PillGroup
                        options={render.subModels}
                        value={ops.moreModel}
                        onChange={(id) => setOps((s) => ({ ...s, moreModel: id as EMoreModel }))}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </Section>

        {/* Size + Factor — only when upscale is on */}
        {ops.upscaleEnabled && (
          <>
            <div className="border-b border-white/8 px-4 py-4">
              <div className="mb-3 flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground">{t('section_size')}</p>
                <InfoTooltip text={t('tooltip_size')} />
              </div>
              <SegmentedControl
                options={render.sizeModes.map((m) => ({
                  ...m,
                  lockedTooltip: m.locked ? (
                    <p className="text-xs leading-relaxed text-gray-800">
                      {t('paid_tooltip_text')}{' '}
                      <Link
                        href="/pricing"
                        className="font-medium text-brand-light hover:underline"
                      >
                        {t('see_pricing')}
                      </Link>
                    </p>
                  ) : undefined,
                }))}
                value={ops.sizeMode}
                onChange={(id) => setOps((s) => ({ ...s, sizeMode: id as ESizeMode }))}
              />
            </div>

            {render.showFactor && (
              <div className="border-b border-white/8 px-4 py-4">
                <div className="mb-3 flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{t('section_factor')}</p>
                  <InfoTooltip text={t('tooltip_size')} />
                </div>
                <PillGroup
                  options={SCALE_FACTORS.map((f) => ({ id: f.value, label: f.label }))}
                  value={ops.scaleFactor}
                  onChange={(id) =>
                    setOps((s) => ({ ...s, scaleFactor: id as typeof ops.scaleFactor }))
                  }
                />
              </div>
            )}

            {render.showCustomSize && (
              <div className="border-b border-white/8 px-4 py-4">
                <div className="mb-3 flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{t('section_dimensions')}</p>
                  <InfoTooltip text={t('tooltip_size')} />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="custom-width"
                    label={t('width_label')}
                    type="number"
                    min={1}
                    value={ops.customWidth}
                    onChange={(v) => setOps((s) => ({ ...s, customWidth: Number(v) }))}
                    suffix="px"
                    className="flex-1"
                  />
                  <span className="mt-4 text-subtle">×</span>
                  <Input
                    id="custom-height"
                    label={t('height_label')}
                    type="number"
                    min={1}
                    value={ops.customHeight}
                    onChange={(v) => setOps((s) => ({ ...s, customHeight: Number(v) }))}
                    suffix="px"
                    className="flex-1"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Light AI */}
        <Section
          label={t('section_light_ai')}
          tooltip={t('tooltip_light_ai')}
          toggleable
          enabled={ops.lightAIEnabled}
          disabled={render.disableLightAI}
          onToggle={(v) => setOps((s) => ({ ...s, lightAIEnabled: v }))}
        >
          {ops.lightAIEnabled && (
            <Slider
              label={t('intensity_label')}
              value={ops.lightAIIntensity}
              onChange={(v) => setOps((s) => ({ ...s, lightAIIntensity: v }))}
            />
          )}
        </Section>

        {/* Remove background */}
        <Section
          label={t('section_remove_bg')}
          tooltip={t('tooltip_remove_bg')}
          toggleable
          enabled={ops.removeBgEnabled}
          disabled={render.disableRemoveBg}
          onToggle={(v) => setOps((s) => ({ ...s, removeBgEnabled: v }))}
        >
          {ops.removeBgEnabled && (
            <div className="space-y-2.5">
              <PillGroup
                options={[
                  { id: EBgType.General, label: t('bg_general'), tooltip: t('tooltip_bg_general') },
                  { id: EBgType.Car, label: t('bg_car'), tooltip: t('tooltip_bg_car') },
                ]}
                value={ops.bgType}
                onChange={(id) => setOps((s) => ({ ...s, bgType: id as EBgType }))}
              />
              <Checkbox
                isSelected={ops.clipToObject}
                onChange={(v) => setOps((s) => ({ ...s, clipToObject: v }))}
              >
                <span className="flex items-center gap-1 text-xs text-muted">
                  {t('clip_to_object')}
                  <InfoTooltip text={t('tooltip_clip_to_object')} size={11} />
                </span>
              </Checkbox>
            </div>
          )}
        </Section>

        {showAdvanced && (
          <div className="border-b border-white/8 px-4 py-4">
            <p className="text-xs text-subtle">{t('advanced_coming_soon')}</p>
          </div>
        )}
      </div>

      <div className="z-10 border-t border-white/8 bg-page px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_28px_rgba(0,0,0,0.45)]">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="mb-3 flex w-full items-center justify-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
        >
          {t('show_advanced')}
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
          />
        </button>
        <Button
          variant="primary"
          fullWidth
          isDisabled={!props.hasFiles}
          onPress={props.onEnhance}
          className="font-semibold"
          style={{ background: props.hasFiles ? 'var(--gradient-cta)' : undefined }}
        >
          {t('enhance_button', { credits: props.credits })}
        </Button>
      </div>
    </div>
  );
};
