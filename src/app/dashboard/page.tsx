// src/app/dashboard/page.tsx
import type { Metadata } from 'next';
import {
  getKpiWithTrend,
  getTimeSeries,
  getSourcesBreakdown,
  getClient,
} from '@/lib/queries';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils';
import KpiCard from '@/components/dashboard/KpiCard';
import TimeSeriesChart from '@/components/dashboard/TimeSeriesChart';
import CostValueChart from '@/components/dashboard/CostValueChart';
import PnoChart from '@/components/dashboard/PnoChart';
import SourcesTable from '@/components/dashboard/SourcesTable';
import AiInsightCard from '@/components/dashboard/AiInsightCard';
import Breadcrumbs from '@/components/nav/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Dashboard výkonu',
  description: 'Přehled klíčových marketingových metrik mionelo.cz — návštěvy, náklady, konverze a PNO.',
};

// Revalidate every hour
export const revalidate = 3600;

const CLIENT_ID = 1;

async function getAiInsight(): Promise<string> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/analyst`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Shrň hlavní marketingový problém klienta jednou větou.' }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return 'Analytik momentálně není dostupný.';
    const data = await res.json() as { answer?: string };
    return data.answer ?? 'Analytik momentálně není dostupný.';
  } catch {
    return 'Analytik momentálně není dostupný.';
  }
}

export default async function DashboardPage() {
  const [kpi, series, sources, client, insight] = await Promise.all([
    getKpiWithTrend(CLIENT_ID, 30),
    getTimeSeries(CLIENT_ID, 30),
    getSourcesBreakdown(CLIENT_ID, 30),
    getClient(CLIENT_ID),
    getAiInsight(),
  ]);

  const { current: c, delta: d } = kpi;

  const kpiCards = [
    {
      label: 'Návštěvy',
      value: formatNumber(c.visits),
      delta: d.visits_pct,
      metric: 'visits' as const,
      sparkKey: 'visits' as const,
    },
    {
      label: 'Náklady',
      value: formatCurrency(c.cost),
      delta: d.cost_pct,
      metric: 'cost' as const,
      sparkKey: 'cost' as const,
    },
    {
      label: 'Konverze',
      value: formatNumber(c.conversions),
      delta: d.conversions_pct,
      metric: 'conversions' as const,
      sparkKey: 'conversions' as const,
    },
    {
      label: 'Hodnota konv.',
      value: formatCurrency(c.conversion_value),
      delta: d.conversion_value_pct,
      metric: 'conversion_value' as const,
      sparkKey: 'conversion_value' as const,
    },
    {
      label: 'PNO',
      value: formatPercent(c.pno),
      delta: d.pno_pct,
      metric: 'pno' as const,
      sparkKey: 'pno' as const,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
      <Breadcrumbs
        crumbs={[
          { label: 'mionelo.cz', href: '/' },
          { label: 'Dashboard výkonu' },
        ]}
      />

      <div>
        <h1 className="font-heading text-3xl font-semibold text-espresso">
          Dashboard výkonu
        </h1>
        <p className="mt-1 text-sm text-espresso/50">
          {client.name} · posledních 30 dní · cílové PNO: {client.target_pno} %
        </p>
      </div>

      {/* KPI Cards */}
      <section aria-label="Klíčové metriky">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpiCards.map((card) => (
            <KpiCard
              key={card.metric}
              label={card.label}
              value={card.value}
              delta={card.delta}
              metric={card.metric}
              sparkData={series}
              sparkKey={card.sparkKey}
            />
          ))}
        </div>
      </section>

      {/* Charts row */}
      <section aria-label="Grafy výkonu" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TimeSeriesChart data={series} />
        <CostValueChart data={series} />
      </section>

      {/* PNO full width */}
      <PnoChart data={series} targetPno={client.target_pno} />

      {/* Sources table */}
      <SourcesTable channels={sources} targetPno={client.target_pno} />

      {/* AI Insight */}
      <AiInsightCard insight={insight} />
    </div>
  );
}
