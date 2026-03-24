'use client';

/**
 * HeroUI table — paid referral bonuses: email, USD earned, invitee payment total, bonus %, time.
 */
import {
  TableBody,
  TableCell,
  TableColumn,
  TableContent,
  TableHeader,
  TableRoot,
  TableRow,
  TableScrollContainer,
} from '@heroui/react/table';
import { useFormatter } from 'next-intl';

export type ReferralPaidBonusRow = {
  id: string;
  email: string;
  atIso: string;
  inviteePaidTotalUsd: number | null;
  bonusAmountUsd: number;
};

export type ReferralPaidBonusesTableLabels = {
  email: string;
  time: string;
  inviteePaidTotalUsd: string;
  bonusPercent: string;
  usdEarned: string;
  empty: string;
  basisUnknown: string;
};

export type ReferralPaidBonusesTableProps = {
  rows: ReferralPaidBonusRow[];
  labels: ReferralPaidBonusesTableLabels;
  /** Current app referral % (same for all rows; not read from DB). */
  bonusPercent: number;
  ariaLabel: string;
};

export function ReferralPaidBonusesTable(props: ReferralPaidBonusesTableProps) {
  const { rows, labels, bonusPercent, ariaLabel } = props;
  const format = useFormatter();

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-black/25 px-4 py-8 text-center text-sm text-muted">
        {labels.empty}
      </p>
    );
  }

  return (
    <TableRoot variant="primary" className="w-full">
      <TableScrollContainer className="max-h-[min(52vh,440px)]">
        <TableContent aria-label={ariaLabel} className="min-w-[680px]">
          <TableHeader>
            <TableColumn isRowHeader>{labels.email}</TableColumn>
            <TableColumn className="text-end">{labels.usdEarned}</TableColumn>
            <TableColumn className="text-end">{labels.inviteePaidTotalUsd}</TableColumn>
            <TableColumn className="text-end">{labels.bonusPercent}</TableColumn>
            <TableColumn>{labels.time}</TableColumn>
          </TableHeader>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id} id={row.id}>
                <TableCell className="max-w-[min(200px,40vw)] truncate font-mono text-xs">
                  {row.email || '—'}
                </TableCell>
                <TableCell className="text-end font-semibold text-brand-light tabular-nums">
                  {format.number(row.bonusAmountUsd, { style: 'currency', currency: 'USD' })}
                </TableCell>
                <TableCell className="text-end text-foreground/90 tabular-nums">
                  {row.inviteePaidTotalUsd != null ? (
                    format.number(row.inviteePaidTotalUsd, { style: 'currency', currency: 'USD' })
                  ) : (
                    labels.basisUnknown
                  )}
                </TableCell>
                <TableCell className="text-end font-medium text-brand-light tabular-nums">
                  {bonusPercent}%
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap text-foreground/90">
                  {format.dateTime(new Date(row.atIso), {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContent>
      </TableScrollContainer>
    </TableRoot>
  );
}
