'use client';

/**
 * HeroUI Table — referral activity rows: email, time, credits (sign-up or subscription bonus).
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

export type ReferralEmailTimeCreditsRow = {
  id: string;
  email: string;
  atIso: string;
  credits: number;
};

export type ReferralEmailTimeCreditsTableLabels = {
  email: string;
  time: string;
  credits: string;
  empty: string;
};

export type ReferralEmailTimeCreditsTableProps = {
  rows: ReferralEmailTimeCreditsRow[];
  labels: ReferralEmailTimeCreditsTableLabels;
  /** Accessible name for the table (e.g. tab title). */
  ariaLabel: string;
};

export function ReferralEmailTimeCreditsTable(props: ReferralEmailTimeCreditsTableProps) {
  const { rows, labels, ariaLabel } = props;
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
      <TableScrollContainer className="max-h-[min(52vh,420px)]">
        <TableContent aria-label={ariaLabel} className="min-w-[520px]">
          <TableHeader>
            <TableColumn isRowHeader>{labels.email}</TableColumn>
            <TableColumn>{labels.time}</TableColumn>
            <TableColumn className="text-end">{labels.credits}</TableColumn>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} id={row.id}>
                <TableCell className="max-w-[220px] truncate font-mono text-xs">
                  {row.email || '—'}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap text-foreground/90">
                  {format.dateTime(new Date(row.atIso), {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </TableCell>
                <TableCell className="text-end font-semibold text-brand-light tabular-nums">
                  +{row.credits}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContent>
      </TableScrollContainer>
    </TableRoot>
  );
}
