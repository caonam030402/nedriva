'use client';

/* ═══════════════════════════════════════════════════════════════
   StatsRow — Row of stat items.
   ═══════════════════════════════════════════════════════════════ */

type Stat = { value: string; label: string };

type StatsRowProps = {
  stats: Stat[];
  className?: string;
};

export const StatsRow = (props: StatsRowProps) => (
  <div className={`flex flex-wrap items-center justify-center gap-x-10 gap-y-4 ${props.className ?? ''}`}>
    {props.stats.map(stat => (
      <div key={stat.value} className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-foreground">{stat.value}</span>
        <span className="text-sm text-subtle">{stat.label}</span>
      </div>
    ))}
  </div>
);
