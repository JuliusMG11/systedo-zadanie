// src/components/dashboard/PnoChart.tsx
'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { TimeSeriesPoint } from '@/lib/queries';

interface Props {
  data: TimeSeriesPoint[];
  targetPno: number;
}

export default function PnoChart({ data, targetPno }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.date.slice(5),
    pno: parseFloat(d.pno.toFixed(1)),
  }));

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="font-heading text-lg font-semibold text-espresso mb-1">
        Vývoj PNO
      </h2>
      <p className="text-sm text-espresso/50 mb-4">
        Cíl: {targetPno} % — červená linie
      </p>
      <div aria-label="Graf vývoje PNO" style={{ height: 'clamp(160px, 26vw, 220px)', minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D6" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#2E241D99' }} />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#2E241D99' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #F0E4D6', fontSize: 12 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((v: unknown) => [
                typeof v === 'number' ? `${v} %` : String(v ?? ''),
                'PNO',
              ]) as any}
            />
            <ReferenceLine
              y={targetPno}
              stroke="#C0413B"
              strokeDasharray="6 3"
              label={{ value: `Cíl ${targetPno}%`, position: 'right', fontSize: 11, fill: '#C0413B' }}
            />
            <Line
              type="monotone"
              dataKey="pno"
              name="PNO"
              stroke="#D98A3D"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
