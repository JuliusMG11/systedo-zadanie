// src/components/dashboard/TimeSeriesChart.tsx
'use client';

import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '@/lib/utils';
import type { TimeSeriesPoint } from '@/lib/queries';

interface Props {
  data: TimeSeriesPoint[];
}

export default function TimeSeriesChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.date.slice(5), // "MM-DD"
  }));

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="font-heading text-lg font-semibold text-espresso mb-4">
        Návštěvy & Konverze
      </h2>
      <div aria-label="Graf návštěv a konverzí" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={formatted}>
            <defs>
              <linearGradient id="gradVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C2703D" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#C2703D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D6" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#2E241D99' }} />
            <YAxis
              yAxisId="visits"
              orientation="left"
              tick={{ fontSize: 11, fill: '#2E241D99' }}
              tickFormatter={(v) => formatNumber(v)}
            />
            <YAxis
              yAxisId="conv"
              orientation="right"
              tick={{ fontSize: 11, fill: '#2E241D99' }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #F0E4D6', fontSize: 12 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: unknown, name: string) => [
                typeof value === 'number'
                  ? (name === 'Návštěvy' ? formatNumber(value) : value)
                  : value,
                name,
              ]) as any}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              yAxisId="visits"
              type="monotone"
              dataKey="visits"
              name="Návštěvy"
              stroke="#C2703D"
              fill="url(#gradVisits)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="conv"
              type="monotone"
              dataKey="conversions"
              name="Konverze"
              stroke="#5B8A5A"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
