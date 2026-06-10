// src/app/dashboard/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  getKpiWithTrend,
  getTimeSeries,
  getSourcesBreakdown,
  getClient,
  getClients,
  computeDateRange,
} from '@/lib/queries';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils';
import KpiCard from '@/components/dashboard/KpiCard';
import TimeSeriesChart from '@/components/dashboard/TimeSeriesChart';
import CostValueChart from '@/components/dashboard/CostValueChart';
import PnoChart from '@/components/dashboard/PnoChart';
import SourcesTable from '@/components/dashboard/SourcesTable';
import AiInsightCard from '@/components/dashboard/AiInsightCard';
import RangeSwitcher from '@/components/dashboard/RangeSwitcher';
import ClientSwitcher from '@/components/dashboard/ClientSwitcher';

export const metadata: Metadata = {
  title: 'Dashboard výkonu',
  description: 'Přehled klíčových marketingových metrik mionelo.cz — návštěvy, náklady, konverze a PNO.',
};

export const dynamic = 'force-dynamic';

const VALID_DAYS = [7, 30, 90, 365];
const VALID_CLIENT_IDS = [1, 2, 3] as const;
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

const CLIENT_COLORS: Record<number, { bg: string; shadow: string; initial: string }> = {
  1: { bg: 'linear-gradient(150deg,#6FA46B,#467045)', shadow: '0 6px 16px rgba(91,138,90,.32)', initial: 'm' },
  2: { bg: 'linear-gradient(150deg,#5B8BC4,#3A6BA0)', shadow: '0 6px 16px rgba(59,107,160,.32)', initial: 'r' },
  3: { bg: 'linear-gradient(150deg,#C2703D,#A85A2C)', shadow: '0 6px 16px rgba(194,112,61,.32)', initial: 's' },
};

function AiInsightSkeleton() {
  return (
    <div
      className="rounded-(--radius-card) border border-[#EAD2BC] p-6 animate-pulse"
      style={{ background: 'linear-gradient(135deg,#FBEFE4,#F6E2D2)', minHeight: 88 }}
    >
      <div className="flex items-center gap-4">
        <div className="h-11.5 w-11.5 rounded-[13px] shrink-0" style={{ background: 'rgba(194,112,61,.2)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded-full" style={{ background: 'rgba(194,112,61,.2)' }} />
          <div className="h-4 w-3/4 rounded-full" style={{ background: 'rgba(194,112,61,.15)' }} />
        </div>
      </div>
    </div>
  );
}

async function AiInsightLoader({ clientId }: { clientId: number }) {
  const insight = await getAiInsight(clientId);
  return <AiInsightCard insight={insight} />;
}

async function getAiInsight(clientId: number): Promise<string> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/analyst`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        question: 'Shrň hlavní marketingový problém klienta jednou větou.',
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return 'Analytik momentálně není dostupný.';
    const data = await res.json() as { answer?: string };
    return data.answer ?? 'Analytik momentálně není dostupný.';
  } catch {
    return 'Analytik momentálně není dostupný.';
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; client?: string; from?: string; to?: string }>;
}) {
  const { range: rawRange, client: rawClient, from: rawFrom, to: rawTo } = await searchParams;

  const parsedClient = Number(rawClient);
  const clientId = VALID_CLIENT_IDS.includes(parsedClient as typeof VALID_CLIENT_IDS[number])
    ? (parsedClient as typeof VALID_CLIENT_IDS[number])
    : 1;

  const hasCustom =
    rawFrom && rawTo &&
    ISO_RE.test(rawFrom) && ISO_RE.test(rawTo) &&
    rawFrom <= rawTo;

  let start: string, end: string, displayPeriod: string;
  if (hasCustom) {
    start = rawFrom;
    end = rawTo;
    const fmt = (s: string) =>
      new Date(s + 'T00:00:00').toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
    displayPeriod = `${fmt(start)} – ${fmt(end)}`;
  } else {
    const parsedDays = Number(rawRange);
    const days = VALID_DAYS.includes(parsedDays) ? parsedDays : 30;
    ({ start, end } = computeDateRange(days));
    displayPeriod = `${days} dní`;
  }

  const [kpi, series, sources, client, allClients] = await Promise.all([
    getKpiWithTrend(clientId, start, end),
    getTimeSeries(clientId, start, end),
    getSourcesBreakdown(clientId, start, end),
    getClient(clientId),
    getClients(),
  ]);

  const { current: c, delta: d } = kpi;
  const colors = CLIENT_COLORS[clientId] ?? CLIENT_COLORS[1];

  const kpiCards = [
    { label: 'Návštěvy', value: formatNumber(c.visits), delta: d.visits_pct, metric: 'visits' as const, sparkKey: 'visits' as const },
    { label: 'Náklady', value: formatCurrency(c.cost), delta: d.cost_pct, metric: 'cost' as const, sparkKey: 'cost' as const },
    { label: 'Konverze', value: formatNumber(c.conversions), delta: d.conversions_pct, metric: 'conversions' as const, sparkKey: 'conversions' as const },
    { label: 'Hodnota konv.', value: formatCurrency(c.conversion_value), delta: d.conversion_value_pct, metric: 'conversion_value' as const, sparkKey: 'conversion_value' as const },
    { label: 'PNO', value: formatPercent(c.pno), delta: d.pno_pct, metric: 'pno' as const, sparkKey: 'pno' as const },
  ];

  return (
    <div className="mx-auto max-w-310 px-6 py-7">

      {/* Client header */}
      <div className="flex flex-wrap items-end justify-between gap-5 mb-5">
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[14px] font-heading text-[22px] font-bold text-white"
            style={{ background: colors.bg, boxShadow: colors.shadow }}
          >
            {colors.initial}
          </div>
          <div>
            <h1 className="font-heading text-[clamp(26px,4vw,34px)] font-semibold leading-tight text-espresso">
              {client.name}
            </h1>
            <p className="mt-0.5 text-[14.5px] text-ink-soft">
              {client.domain} ·{' '}
              <span className="font-semibold text-green-dk">Aktivní klient</span>
              {' '}· období {displayPeriod}
            </p>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <ClientSwitcher clients={allClients} currentId={clientId} />
          </Suspense>
          <Suspense fallback={null}>
            <RangeSwitcher />
          </Suspense>
        </div>
      </div>

      {/* AI Insight — streams in independently so DB data renders immediately */}
      <Suspense fallback={<AiInsightSkeleton />}>
        <AiInsightLoader clientId={clientId} />
      </Suspense>

      {/* ↕ bigger gap before KPI section */}
      <div className="mt-10">

        {/* KPI Cards */}
        <section aria-label="Klíčové metriky">
          <div className="grid grid-cols-2 gap-3 sm:gap-4.5 md:grid-cols-3 lg:grid-cols-5">
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
        <section aria-label="Grafy výkonu" className="mt-4.5 grid grid-cols-1 gap-4.5 md:grid-cols-2">
          <TimeSeriesChart data={series} />
          <CostValueChart data={series} />
        </section>

        {/* PNO full width */}
        <div className="mt-4.5">
          <PnoChart data={series} targetPno={client.target_pno} />
        </div>

        {/* Sources table */}
        <div className="mt-4.5">
          <SourcesTable channels={sources} targetPno={client.target_pno} />
        </div>

      </div>
    </div>
  );
}
