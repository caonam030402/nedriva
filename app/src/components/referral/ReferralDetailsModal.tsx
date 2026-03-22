'use client';

import type {
  ReferralEmailTimeCreditsRow,
  ReferralEmailTimeCreditsTableLabels,
} from '@/components/ui/ReferralEmailTimeCreditsTable';
import type { ReferralPaidBonusesTableLabels } from '@/components/ui/ReferralPaidBonusesTable';
import type { ReferralsMeActivityResponse } from '@/types/referralsApi';
import { useOverlayState } from '@heroui/react';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseTrigger,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
} from '@heroui/react/modal';
import { Tab, TabList, TabListContainer, TabPanel, TabsRoot } from '@heroui/react/tabs';
import { useCallback, useEffect, useState } from 'react';
import { ReferralEmailTimeCreditsTable } from '@/components/ui/ReferralEmailTimeCreditsTable';
import { ReferralPaidBonusesTable } from '@/components/ui/ReferralPaidBonusesTable';
import { apiRoutes } from '@/constants/apiRoutes';

export type ReferralDetailsModalCopy = {
  title: string;
  tabCredit: string;
  tabPaid: string;
  creditTable: ReferralEmailTimeCreditsTableLabels;
  paidBonusesTable: ReferralPaidBonusesTableLabels;
  paidNote: string;
  loadError: string;
  loading: string;
};

export type ReferralDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  /** Which tab to show when the modal opens. */
  initialTab: 'credit' | 'paid';
  copy: ReferralDetailsModalCopy;
  /** Matches `REFERRAL_SUBSCRIPTION_BONUS_PERCENT` — shown in paid-bonus table (not per-row in DB). */
  subscriptionBonusPercent: number;
};

function toCreditRows(data: ReferralsMeActivityResponse): ReferralEmailTimeCreditsRow[] {
  return data.creditGrants.map(g => ({
    id: g.id,
    email: g.email,
    atIso: g.grantedAt,
    credits: g.creditsYouEarned,
  }));
}

function toPaidBonusRows(data: ReferralsMeActivityResponse) {
  return data.paidBonuses.map(b => ({
    id: b.id,
    email: b.email,
    atIso: b.awardedAt,
    inviteePaidTotalUsd: b.inviteePaidTotalUsd,
    bonusAmountUsd: b.bonusAmountUsd,
  }));
}

export function ReferralDetailsModal(props: ReferralDetailsModalProps) {
  const { open, onClose, initialTab, copy, subscriptionBonusPercent } = props;
  const [tab, setTab] = useState<'credit' | 'paid'>(() => initialTab);
  const [data, setData] = useState<ReferralsMeActivityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiRoutes.referralsMeActivity, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(String(res.status));
      }
      const json = (await res.json()) as ReferralsMeActivityResponse;
      setData(json);
    } catch {
      setError(copy.loadError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [copy.loadError]);

  useEffect(() => {
    if (open) {
      void load();
    }
  }, [open, load]);

  const overlay = useOverlayState({
    isOpen: open,
    onOpenChange: isOpen => {
      if (!isOpen) {
        onClose();
      }
    },
  });

  return (
    <Modal.Root state={overlay}>
      <ModalBackdrop className="backdrop-blur-[2px]">
        <ModalContainer className="flex items-center justify-center p-4">
          <ModalDialog className="max-h-[min(90vh,720px)] w-full max-w-3xl border border-white/10 bg-[#141018] shadow-2xl shadow-black/50">
            <ModalHeader className="flex flex-row items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <ModalHeading className="text-lg font-semibold text-foreground">{copy.title}</ModalHeading>
              <ModalCloseTrigger />
            </ModalHeader>
            <ModalBody className="gap-4 px-4 py-4">
              <TabsRoot
                variant="secondary"
                selectedKey={tab}
                onSelectionChange={key => setTab(key === 'paid' ? 'paid' : 'credit')}
                className="flex w-full flex-col gap-4"
              >
                <TabListContainer>
                  <TabList
                    aria-label={copy.title}
                    className="flex gap-1 rounded-xl border border-white/10 bg-black/40 p-1"
                  >
                    {/* CSS-only selected state — avoids TabIndicator / SharedElement layout glitches */}
                    <Tab
                      id="credit"
                      className="min-h-10 min-w-0 flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold text-muted/90 transition-colors outline-none hover:text-foreground/90 data-[selected]:bg-violet-600/45 data-[selected]:text-white data-[selected]:shadow-[inset_0_0_0_1px_rgba(167,139,250,0.55)]"
                    >
                      {copy.tabCredit}
                    </Tab>
                    <Tab
                      id="paid"
                      className="min-h-10 min-w-0 flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold text-muted/90 transition-colors outline-none hover:text-foreground/90 data-[selected]:bg-violet-600/45 data-[selected]:text-white data-[selected]:shadow-[inset_0_0_0_1px_rgba(167,139,250,0.55)]"
                    >
                      {copy.tabPaid}
                    </Tab>
                  </TabList>
                </TabListContainer>

                <TabPanel id="credit" className="outline-none">
                  {loading ? (
                    <p className="py-6 text-center text-sm text-muted">{copy.loading}</p>
                  ) : error ? (
                    <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-6 text-center text-sm text-danger">
                      {error}
                    </p>
                  ) : data ? (
                    <ReferralEmailTimeCreditsTable
                      rows={toCreditRows(data)}
                      labels={copy.creditTable}
                      ariaLabel={copy.tabCredit}
                    />
                  ) : null}
                </TabPanel>

                <TabPanel id="paid" className="flex flex-col gap-3 outline-none">
                  <p className="text-xs leading-relaxed text-muted">{copy.paidNote}</p>
                  {loading ? (
                    <p className="py-6 text-center text-sm text-muted">{copy.loading}</p>
                  ) : error ? (
                    <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-6 text-center text-sm text-danger">
                      {error}
                    </p>
                  ) : data ? (
                    <ReferralPaidBonusesTable
                      rows={toPaidBonusRows(data)}
                      labels={copy.paidBonusesTable}
                      bonusPercent={subscriptionBonusPercent}
                      ariaLabel={copy.tabPaid}
                    />
                  ) : null}
                </TabPanel>
              </TabsRoot>
            </ModalBody>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal.Root>
  );
}
