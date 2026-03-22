'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SelectableList } from '@/components/ui/SelectableList';
import { PRESET_GROUPS } from './constants';

type Props = { credits: number };

const GROUPS = PRESET_GROUPS.map(g => ({
  title: g.group,
  items: g.items.map(item => ({ id: item.label, label: item.label, meta: item.metric })),
}));

export const PresetsPanel = (props: Props) => {
  const t = useTranslations('Enhancer');
  const [selected, setSelected] = useState<string | undefined>();

  return (
    /** Grid: row 1 scrolls only the list; row 2 keeps the CTA pinned (reliable on iOS vs flex-1 + overflow) */
    <div className="grid h-full min-h-0 w-full flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
      <div
        className="isolate min-h-0 touch-pan-y overflow-y-auto overscroll-y-contain px-4 pt-4 pb-2 [-webkit-overflow-scrolling:touch]"
      >
        <SelectableList
          groups={GROUPS}
          value={selected}
          onChange={setSelected}
        />
      </div>

      <div className="z-10 border-t border-white/8 bg-page px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_28px_rgba(0,0,0,0.45)]">
        <Button
          variant="primary"
          fullWidth
          isDisabled={!selected}
          className="font-semibold"
          style={{ background: selected ? 'var(--gradient-cta)' : undefined }}
        >
          <span>{t('enhance_button', { credits: props.credits })}</span>
          <Info size={13} className="shrink-0" />
        </Button>
      </div>
    </div>
  );
};
