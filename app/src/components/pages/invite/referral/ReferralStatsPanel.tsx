'use client';

import type { ReferralDetailsModalCopy } from './ReferralDetailsModal';
import { useState } from 'react';
import { ReferralDetailsModal } from './ReferralDetailsModal';

type Props = {
  inviteCount: number;
  linkClickCount: number;
  subscriptionBonusCount: number;
  labels: {
    statsPanelLabel: string;
    statInvitesSuffix: string;
    statFriendsJoined: string;
    statFriendsZero: string;
    statClicksSuffix: string;
    statClicksCaption: string;
    statSubsLabel: string;
    statSubsSuffix: string;
    shareHint: string;
    statClickHintCredit: string;
    statClickHintPaid: string;
  };
  modalCopy: ReferralDetailsModalCopy;
  subscriptionBonusPercent: number;
};

function StatCard(props: {
  label: string;
  value: number;
  description: string;
  onPress?: () => void;
  ariaHint?: string;
}) {
  const { label, value, description, onPress, ariaHint } = props;
  const className =
    'flex h-full flex-col rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-left transition-colors';
  const interactiveClass = onPress
    ? ' cursor-pointer hover:border-white/20 hover:bg-black/40 focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:outline-none'
    : '';

  const inner = (
    <>
      <p className="text-[10px] font-semibold tracking-wider text-subtle uppercase">{label}</p>
      <p className="mt-1.5 text-3xl font-bold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <p className="mt-2 flex-1 text-xs leading-snug text-muted sm:min-h-10">{description}</p>
    </>
  );

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        className={className + interactiveClass}
        aria-label={ariaHint}
      >
        {inner}
      </button>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function ReferralStatsPanel(props: Props) {
  const {
    inviteCount,
    linkClickCount,
    subscriptionBonusCount,
    labels,
    modalCopy,
    subscriptionBonusPercent,
  } = props;
  const [modal, setModal] = useState<null | { tab: 'credit' | 'paid' }>(null);

  return (
    <>
      <div className="space-y-4">
        <p className="text-[10px] font-semibold tracking-widest text-subtle uppercase">
          {labels.statsPanelLabel}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label={labels.statInvitesSuffix}
            value={inviteCount}
            description={inviteCount > 0 ? labels.statFriendsJoined : labels.statFriendsZero}
            onPress={() => setModal({ tab: 'credit' })}
            ariaHint={labels.statClickHintCredit}
          />
          <StatCard
            label={labels.statClicksSuffix}
            value={linkClickCount}
            description={labels.statClicksCaption}
          />
          <StatCard
            label={labels.statSubsLabel}
            value={subscriptionBonusCount}
            description={labels.statSubsSuffix}
            onPress={() => setModal({ tab: 'paid' })}
            ariaHint={labels.statClickHintPaid}
          />
        </div>
        <p className="text-center text-xs text-subtle sm:text-left">{labels.shareHint}</p>
      </div>

      <ReferralDetailsModal
        key={modal ? modal.tab : 'closed'}
        open={modal !== null}
        initialTab={modal?.tab ?? 'credit'}
        onClose={() => setModal(null)}
        copy={modalCopy}
        subscriptionBonusPercent={subscriptionBonusPercent}
      />
    </>
  );
}
