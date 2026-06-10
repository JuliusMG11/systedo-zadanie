import type { Metadata } from 'next';
import AiShell from '@/components/ai/AiShell';
import { getClients, getKpiWithTrend, computeDateRange } from '@/lib/queries';
import type { KpiRow } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI Marketingový analytik',
  description:
    'Zeptejte se AI analytika na výkon klienta — návštěvy, PNO, reklamu. Odpověď podložená reálnými daty.',
};

export default async function AiAnalytikPage() {
  const clients = await getClients();
  const { start, end } = computeDateRange(30);

  const statsArr = await Promise.all(
    clients.map(async (c) => {
      const kpi = await getKpiWithTrend(c.id, start, end);
      return { clientId: c.id, kpi: kpi.current };
    })
  );

  const clientStats: Record<number, KpiRow> = {};
  for (const s of statsArr) clientStats[s.clientId] = s.kpi;

  return (
    <AiShell
      clients={clients}
      defaultClientId={clients[0]?.id ?? 1}
      clientStats={clientStats}
    />
  );
}
