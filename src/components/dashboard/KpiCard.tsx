'use client';

import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { trendIsGood } from '@/lib/utils';
import type { TimeSeriesPoint } from '@/lib/queries';

type MetricKey = 'visits' | 'conversions' | 'conversion_value' | 'cost' | 'pno';

interface KpiCardProps {
  label: string;
  value: string;       // pre-formatted string
  delta: number;       // % change vs previous period
  metric: MetricKey;
  sparkData: TimeSeriesPoint[];
  sparkKey: keyof TimeSeriesPoint;
  unit?: string;
}

export default function KpiCard({
  label,
  value,
  delta,
  metric,
  sparkData,
  sparkKey,
}: KpiCardProps) {
  const good = trendIsGood(metric, delta);
  const noChange = Math.abs(delta) < 0.01;

  const trendColor = noChange
    ? 'text-espresso/40'
    : good
    ? 'text-positive'
    : 'text-negative';

  const trendBg = noChange
    ? 'bg-espresso/5'
    : good
    ? 'bg-positive/10'
    : 'bg-negative/10';

  const arrow = noChange ? '–' : delta > 0 ? '↑' : '↓';
  const absVal = Math.abs(delta).toFixed(1);

  const strokeColor = noChange ? '#94A3B8' : good ? '#3F8F5E' : '#C0413B';

  return (
    <div
      className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-md hover:border hover:border-clay-soft flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-espresso/60">{label}</span>
        {/* Sparkline */}
        <div className="w-20 h-8 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
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

      <p className="font-tabular text-3xl font-semibold leading-none text-espresso">
        {value}
      </p>

      <span
        className={`inline-flex w-fit items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium ${trendBg} ${trendColor}`}
      >
        {arrow} {absVal} % vs. předchozí
      </span>
    </div>
  );
}
