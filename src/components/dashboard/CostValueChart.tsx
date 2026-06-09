// src/components/dashboard/CostValueChart.tsx
'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { TimeSeriesPoint } from '@/lib/queries';

interface Props {
  data: TimeSeriesPoint[];
}

export default function CostValueChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.date.slice(5),
  }));

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="font-heading text-lg font-semibold text-espresso mb-4">
        Náklady vs. Hodnota konverze
      </h2>
      <div aria-label="Graf nákladů a hodnoty konverze" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D6" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#2E241D99' }} />
            <YAxis
              tick={{ fontSize: 11, fill: '#2E241D99' }}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #F0E4D6', fontSize: 12 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: unknown) =>
                typeof value === 'number' ? formatCurrency(value) : String(value ?? '')
              ) as any}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="cost" name="Náklady" fill="#C2703D" radius={[4, 4, 0, 0]} />
            <Bar dataKey="conversion_value" name="Hodnota konv." fill="#5B8A5A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
