'use client';

import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { trendIsGood } from '@/lib/utils';
import type { TimeSeriesPoint } from '@/lib/queries';

type MetricKey = 'visits' | 'conversions' | 'conversion_value' | 'cost' | 'pno';

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
  metric: MetricKey;
  sparkData: TimeSeriesPoint[];
  sparkKey: keyof TimeSeriesPoint;
}

export default function KpiCard({ label, value, delta, metric, sparkData, sparkKey }: KpiCardProps) {
  const good = trendIsGood(metric, delta);
  const noChange = Math.abs(delta) < 0.01;

  const badgeBg = noChange ? '#F3ECDF' : good ? '#E4EEE2' : '#F6E0DD';
  const badgeColor = noChange ? '#6B5E52' : good ? '#467045' : '#C0463B';
  const strokeColor = noChange ? '#9C8F81' : good ? '#467045' : '#C0463B';
  const absVal = Math.abs(delta).toFixed(1);

  const ArrowUp = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 8V2M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const ArrowDown = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="rounded-(--radius-card) bg-white border border-clay-soft p-5.5 shadow-(--shadow-card) flex flex-col gap-3">
      {/* Top row: label + badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-ink-soft">{label}</span>
        {!noChange && (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-pill px-[9px] py-1 text-[13px] font-heading font-semibold leading-none"
            style={{ background: badgeBg, color: badgeColor }}
          >
            {delta > 0 ? <ArrowUp /> : <ArrowDown />}
            {absVal} %
          </span>
        )}
      </div>

      {/* Value */}
      <p className="font-heading font-tabular text-[22px] sm:text-[27px] font-bold leading-none tracking-[-0.02em] text-espresso truncate">
        {value}
      </p>

      {/* Sparkline — full width at bottom */}
      <div className="h-10 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.18} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={sparkKey as string}
              stroke={strokeColor}
              strokeWidth={1.5}
              fill={`url(#grad-${metric})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
