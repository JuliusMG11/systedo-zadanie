// src/components/dashboard/TimeSeriesChart.tsx
'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { TimeSeriesPoint } from '@/lib/queries';

interface Props {
  data: TimeSeriesPoint[];
}

function MiniChart({
  data,
  dataKey,
  color,
  formatter,
  ariaLabel,
}: {
  data: TimeSeriesPoint[];
  dataKey: keyof TimeSeriesPoint;
  color: string;
  formatter: (v: number) => string;
  ariaLabel: string;
}) {
  return (
    <div aria-label={ariaLabel} style={{ height: 'clamp(100px, 16vw, 130px)', minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.18} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D6" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#2E241D80' }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#2E241D80' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v))}
            width={36}
          />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: '1px solid #F0E4D6', fontSize: 12 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={((v: unknown) => [typeof v === 'number' ? formatter(v) : v, '']) as any}
          />
          <Area
            type="monotone"
            dataKey={dataKey as string}
            stroke={color}
            fill={`url(#grad-${dataKey})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function TimeSeriesChart({ data }: Props) {
  const formatted = data.map((d) => ({ ...d, date: d.date.slice(5) }));

  return (
    <div className="rounded-(--radius-card) bg-white p-5 sm:p-6 shadow-(--shadow-card) flex flex-col gap-5">
      <div>
        <p className="font-heading text-[11.5px] font-semibold uppercase tracking-[0.09em] text-ink-faint mb-1">Hodnota konverze</p>
        <MiniChart
          data={formatted}
          dataKey="conversion_value"
          color="#C2703D"
          formatter={(v) => formatCurrency(v)}
          ariaLabel="Graf hodnoty konverze"
        />
      </div>
      <div className="border-t border-clay-soft pt-5">
        <p className="font-heading text-[11.5px] font-semibold uppercase tracking-[0.09em] text-ink-faint mb-1">Konverze</p>
        <MiniChart
          data={formatted}
          dataKey="conversions"
          color="#5B8A5A"
          formatter={(v) => String(Math.round(v))}
          ariaLabel="Graf konverzí"
        />
      </div>
    </div>
  );
}
