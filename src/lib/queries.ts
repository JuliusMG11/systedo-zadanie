// src/lib/queries.ts
import { sql } from '@/lib/db';

export type KpiRow = {
  visits: number;
  cost: number;
  conversions: number;
  conversion_value: number;
  pno: number;
};

export type KpiWithTrend = {
  current: KpiRow;
  previous: KpiRow;
  delta: {
    visits_pct: number;
    cost_pct: number;
    conversions_pct: number;
    conversion_value_pct: number;
    pno_pct: number;
  };
};

export type TimeSeriesPoint = {
  date: string;
  visits: number;
  conversions: number;
  cost: number;
  conversion_value: number;
  pno: number;
};

export type ChannelRow = {
  channel: string;
  visits: number;
  cost: number;
  conversions: number;
  conversion_value: number;
  pno: number;
};

export type ClientRow = {
  id: number;
  name: string;
  domain: string;
  target_pno: number;
};

export type AnalystContext = {
  client: ClientRow;
  periods: {
    last7: KpiRow;
    last30: KpiWithTrend;
    last90: KpiRow;
  };
  by_channel_30d: ChannelRow[];
  trend_30d: TimeSeriesPoint[];
};

function getDateRanges(days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(today);
  const start = new Date(today);
  start.setDate(today.getDate() - days + 1);

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - days + 1);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return {
    start: fmt(start),
    end: fmt(end),
    prevStart: fmt(prevStart),
    prevEnd: fmt(prevEnd),
  };
}

export function computeDateRange(days: number): { start: string; end: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = today.toISOString().slice(0, 10);
  const start = new Date(today.getTime() - (days - 1) * 86400000).toISOString().slice(0, 10);
  return { start, end };
}

function parseKpi(row: Record<string, string | null>): KpiRow {
  const cost = parseFloat(row.cost ?? '0');
  const conv_val = parseFloat(row.conversion_value ?? '0');
  return {
    visits: parseInt(row.visits ?? '0'),
    cost,
    conversions: parseInt(row.conversions ?? '0'),
    conversion_value: conv_val,
    pno: conv_val === 0 ? 0 : (cost / conv_val) * 100,
  };
}

async function fetchKpi(clientId: number, start: string, end: string): Promise<KpiRow> {
  const { rows } = await sql`
    SELECT
      COALESCE(SUM(visits), 0)::text           AS visits,
      COALESCE(SUM(cost), 0)::text             AS cost,
      COALESCE(SUM(conversions), 0)::text      AS conversions,
      COALESCE(SUM(conversion_value), 0)::text AS conversion_value
    FROM metrics_daily
    WHERE client_id = ${clientId}
      AND date BETWEEN ${start} AND ${end}
  `;
  return parseKpi(rows[0] as Record<string, string>);
}

export async function getKpiWithTrend(
  clientId: number,
  start: string,
  end: string
): Promise<KpiWithTrend> {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const rangeDays = Math.round((endMs - startMs) / 86400000) + 1;
  const prevEndDate = new Date(startMs - 86400000).toISOString().slice(0, 10);
  const prevStartDate = new Date(startMs - rangeDays * 86400000).toISOString().slice(0, 10);
  const [current, previous] = await Promise.all([
    fetchKpi(clientId, start, end),
    fetchKpi(clientId, prevStartDate, prevEndDate),
  ]);

  const pct = (cur: number, prev: number) =>
    prev === 0 ? 0 : ((cur - prev) / prev) * 100;

  return {
    current,
    previous,
    delta: {
      visits_pct: pct(current.visits, previous.visits),
      cost_pct: pct(current.cost, previous.cost),
      conversions_pct: pct(current.conversions, previous.conversions),
      conversion_value_pct: pct(current.conversion_value, previous.conversion_value),
      pno_pct: pct(current.pno, previous.pno),
    },
  };
}

export async function getTimeSeries(
  clientId: number,
  start: string,
  end: string
): Promise<TimeSeriesPoint[]> {
  const { rows } = await sql`
    SELECT
      date::text,
      SUM(visits)::text            AS visits,
      SUM(conversions)::text       AS conversions,
      SUM(cost)::text              AS cost,
      SUM(conversion_value)::text  AS conversion_value
    FROM metrics_daily
    WHERE client_id = ${clientId}
      AND date BETWEEN ${start} AND ${end}
    GROUP BY date
    ORDER BY date
  `;
  return rows.map((r) => {
    const cost = parseFloat((r as Record<string, string>).cost);
    const conv_val = parseFloat((r as Record<string, string>).conversion_value);
    return {
      date: (r as Record<string, string>).date,
      visits: parseInt((r as Record<string, string>).visits),
      conversions: parseInt((r as Record<string, string>).conversions),
      cost,
      conversion_value: conv_val,
      pno: conv_val === 0 ? 0 : (cost / conv_val) * 100,
    };
  });
}

export async function getSourcesBreakdown(
  clientId: number,
  start: string,
  end: string
): Promise<ChannelRow[]> {
  const { rows } = await sql`
    SELECT
      channel,
      SUM(visits)::text            AS visits,
      SUM(cost)::text              AS cost,
      SUM(conversions)::text       AS conversions,
      SUM(conversion_value)::text  AS conversion_value
    FROM metrics_daily
    WHERE client_id = ${clientId}
      AND date BETWEEN ${start} AND ${end}
    GROUP BY channel
    ORDER BY SUM(visits) DESC
  `;
  return rows.map((r) => {
    const cost = parseFloat((r as Record<string, string>).cost);
    const conv_val = parseFloat((r as Record<string, string>).conversion_value);
    return {
      channel: (r as Record<string, string>).channel,
      visits: parseInt((r as Record<string, string>).visits),
      cost,
      conversions: parseInt((r as Record<string, string>).conversions),
      conversion_value: conv_val,
      pno: conv_val === 0 ? 0 : (cost / conv_val) * 100,
    };
  });
}

export async function getClient(clientId: number): Promise<ClientRow> {
  const { rows } = await sql`
    SELECT id, name, domain, target_pno::float AS target_pno
    FROM clients WHERE id = ${clientId}
  `;
  return rows[0] as ClientRow;
}

export async function getClients(): Promise<ClientRow[]> {
  const { rows } = await sql`
    SELECT id, name, domain, target_pno::float AS target_pno
    FROM clients ORDER BY id
  `;
  return rows as ClientRow[];
}

export async function getAnalystContext(clientId: number): Promise<AnalystContext> {
  const { start: s7, end: e7 } = getDateRanges(7);
  const { start: s30, end: e30 } = getDateRanges(30);
  const { start: s90, end: e90 } = getDateRanges(90);

  const [client, last7, last30, last90, by_channel_30d, trend_30d_full] =
    await Promise.all([
      getClient(clientId),
      fetchKpi(clientId, s7, e7),
      getKpiWithTrend(clientId, s30, e30),
      fetchKpi(clientId, s90, e90),
      getSourcesBreakdown(clientId, s30, e30),
      getTimeSeries(clientId, s30, e30),
    ]);

  // Thin the 30-day series to every 3rd day to keep the snapshot compact
  const trend_30d = trend_30d_full.filter((_, i) => i % 3 === 0);

  return { client, periods: { last7, last30, last90 }, by_channel_30d, trend_30d };
}
