# Mionelo Marketing Suite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a three-page Next.js demo app (Dashboard, SEO Article, AI Analyst) over Vercel Postgres + Gemini API for the mionelo.cz client.

**Architecture:** App Router RSC for dashboard (server-fetched data), SSG for article page (SEO), client component chat for AI analyst with a Next.js Route Handler calling Gemini server-side. Single `lib/queries.ts` is the one source of truth for all DB queries.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS v4, @vercel/postgres, @google/generative-ai, Recharts, lucide-react, next/font (Fraunces + Inter), Vitest, tsx.

---

## File Map

```
/
├── app/
│   ├── layout.tsx               # root layout, fonts, navbar, <html lang="cs">
│   ├── page.tsx                 # redirect → /dashboard
│   ├── globals.css              # Tailwind v4 @import + @theme tokens
│   ├── sitemap.ts               # /sitemap.xml
│   ├── robots.ts                # /robots.txt
│   ├── dashboard/page.tsx       # RSC — fetches all KPI/chart/sources data
│   ├── clanek/[slug]/page.tsx   # SSG — article + generateMetadata + JSON-LD
│   ├── ai-analytik/page.tsx     # client page wrapping ChatWindow
│   └── api/analyst/route.ts     # POST → getAnalystContext → Gemini
├── components/
│   ├── nav/Navbar.tsx           # sticky nav, 3 links
│   ├── nav/Breadcrumbs.tsx      # structured breadcrumbs (SEO)
│   ├── dashboard/
│   │   ├── KpiCard.tsx          # big number + trend badge + sparkline
│   │   ├── TimeSeriesChart.tsx  # visits + conversions dual-axis area chart
│   │   ├── CostValueChart.tsx   # cost vs conversion_value bar chart
│   │   ├── PnoChart.tsx         # PNO line + reference line at target
│   │   ├── SourcesTable.tsx     # channel breakdown table
│   │   └── AiInsightCard.tsx    # one-sentence AI summary + CTA
│   ├── article/
│   │   ├── ArticleHero.tsx      # hero with title, date, category
│   │   ├── Toc.tsx              # table of contents sidebar
│   │   └── RelatedCards.tsx     # "related articles" row at bottom
│   └── ai/
│       ├── MessageBubble.tsx    # user vs AI bubble
│       ├── QuickQuestions.tsx   # chip buttons with preset questions
│       └── ChatWindow.tsx       # full client chat UI (state + fetch)
├── lib/
│   ├── db.ts                    # re-exports sql from @vercel/postgres
│   ├── queries.ts               # all SQL + TypeScript types
│   ├── ai/prompt.ts             # SYSTEM_PROMPT + buildUserPrompt
│   └── utils.ts                 # formatNumber, formatCurrency, formatPercent, calcPno, pctChange, trendIsGood
├── content/clanky/
│   └── oriesky-seminka.ts       # article content (title, body, metadata)
├── migrations/0001_init.sql     # CREATE TABLE clients + metrics_daily
├── scripts/
│   ├── migrate.ts               # runs 0001_init.sql
│   └── seed.ts                  # 90 days × 6 channels synthetic data
├── tests/unit/utils.test.ts     # Vitest tests for lib/utils.ts
├── vitest.config.ts
├── .env.example
├── next.config.ts               # security headers
└── postcss.config.mjs           # @tailwindcss/postcss
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `.env.example`
- Create: `vitest.config.ts`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/juliuspetrik/Documents/Github/systedo-zadanie
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --yes
```

Expected: project files created, `npm install` completed.

- [ ] **Step 2: Install all dependencies**

```bash
npm install @vercel/postgres @google/generative-ai recharts lucide-react
npm install --save-dev tsx vitest @vitejs/plugin-react @types/node
```

- [ ] **Step 3: Upgrade Tailwind to v4 and configure PostCSS**

```bash
npm install tailwindcss@^4 @tailwindcss/postcss@^4
```

Replace `postcss.config.mjs` with:

```js
// postcss.config.mjs
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
export default config;
```

Delete `tailwind.config.ts` if it was generated (v4 uses CSS-only config).

- [ ] **Step 4: Write next.config.ts with security headers**

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 5: Write .env.example**

```bash
# .env.example
# Vercel Postgres (Neon) — auto-injected by Vercel, pull locally with: vercel env pull .env.local
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=

# Gemini API — server-side only, NO NEXT_PUBLIC_ prefix!
GEMINI_API_KEY=

# Canonical base URL for SEO/OG (no trailing slash)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 6: Write vitest.config.ts**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 7: Add npm scripts to package.json**

Add these scripts (merge with existing):
```json
{
  "scripts": {
    "db:migrate": "tsx scripts/migrate.ts",
    "db:seed": "tsx scripts/seed.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 15 project with Tailwind v4, Vitest, security headers"
```

---

## Task 2: Global CSS & Design Tokens

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx` (fonts only — full layout in Task 8)

- [ ] **Step 1: Write globals.css with Tailwind v4 @theme tokens**

Replace the full file:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-cream: #FAF6EF;
  --color-espresso: #2E241D;
  --color-walnut: #C2703D;
  --color-leaf: #5B8A5A;
  --color-clay-soft: #F0E4D6;
  --color-positive: #3F8F5E;
  --color-negative: #C0413B;
  --color-warning: #D98A3D;

  /* Typography */
  --font-heading: var(--font-fraunces), Georgia, serif;
  --font-body: var(--font-inter), system-ui, sans-serif;

  /* Radius */
  --radius-card: 16px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(46, 36, 29, 0.08);
}

body {
  background-color: var(--color-cream);
  color: var(--color-espresso);
  font-family: var(--font-body);
}

.font-tabular {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 2: Verify build runs without errors**

```bash
npm run build 2>&1 | tail -20
```

Expected: no TypeScript or Tailwind errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css postcss.config.mjs
git commit -m "feat: configure Tailwind v4 design tokens (cream/espresso/walnut palette)"
```

---

## Task 3: Utils + Unit Tests

**Files:**
- Create: `lib/utils.ts`
- Create: `tests/unit/utils.test.ts`

- [ ] **Step 1: Write failing tests first**

```ts
// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  calcPno,
  pctChange,
  trendIsGood,
} from '@/lib/utils';

describe('formatNumber', () => {
  it('formats integer with Czech locale (space thousands separator)', () => {
    const result = formatNumber(12480);
    expect(result).toContain('12');
    expect(result).toContain('480');
  });
});

describe('formatCurrency', () => {
  it('formats CZK currency', () => {
    expect(formatCurrency(10000)).toContain('10');
    expect(formatCurrency(10000)).toContain('Kč');
  });
});

describe('formatPercent', () => {
  it('formats percent with 1 decimal by default', () => {
    expect(formatPercent(25)).toContain('25');
    expect(formatPercent(25)).toContain('%');
  });
});

describe('calcPno', () => {
  it('calculates PNO as cost/conversion_value * 100', () => {
    expect(calcPno(2500, 10000)).toBeCloseTo(25);
  });
  it('returns 0 when conversion_value is 0 (no division by zero)', () => {
    expect(calcPno(2500, 0)).toBe(0);
  });
  it('returns 0 when both are 0', () => {
    expect(calcPno(0, 0)).toBe(0);
  });
});

describe('pctChange', () => {
  it('calculates percentage change correctly', () => {
    expect(pctChange(110, 100)).toBeCloseTo(10);
  });
  it('handles negative change', () => {
    expect(pctChange(90, 100)).toBeCloseTo(-10);
  });
  it('returns 0 when previous is 0', () => {
    expect(pctChange(100, 0)).toBe(0);
  });
});

describe('trendIsGood', () => {
  it('visits: positive change is good', () => {
    expect(trendIsGood('visits', 5)).toBe(true);
    expect(trendIsGood('visits', -5)).toBe(false);
  });
  it('cost: positive change is BAD (higher cost = worse)', () => {
    expect(trendIsGood('cost', 5)).toBe(false);
    expect(trendIsGood('cost', -5)).toBe(true);
  });
  it('pno: positive change is BAD (higher PNO = worse)', () => {
    expect(trendIsGood('pno', 5)).toBe(false);
    expect(trendIsGood('pno', -5)).toBe(true);
  });
  it('conversions: positive change is good', () => {
    expect(trendIsGood('conversions', 3)).toBe(true);
  });
  it('conversion_value: positive change is good', () => {
    expect(trendIsGood('conversion_value', 3)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL (module not found)**

```bash
npm test 2>&1 | tail -20
```

Expected: `Cannot find module '@/lib/utils'`

- [ ] **Step 3: Implement lib/utils.ts**

```ts
// lib/utils.ts
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('cs-CZ').format(Math.round(n));
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPercent(n: number, decimals = 1): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n / 100);
}

export function calcPno(cost: number, conversionValue: number): number {
  if (conversionValue === 0) return 0;
  return (cost / conversionValue) * 100;
}

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

type MetricKey = 'visits' | 'conversions' | 'conversion_value' | 'cost' | 'pno';

export function trendIsGood(metric: MetricKey, change: number): boolean {
  const lowerIsBetter = new Set<MetricKey>(['cost', 'pno']);
  return lowerIsBetter.has(metric) ? change < 0 : change > 0;
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test 2>&1 | tail -20
```

Expected: all 13 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/utils.ts tests/unit/utils.test.ts vitest.config.ts
git commit -m "feat: add utils (formatting, PNO, trend semantics) with unit tests"
```

---

## Task 4: Database Layer

**Files:**
- Create: `migrations/0001_init.sql`
- Create: `lib/db.ts`
- Create: `scripts/migrate.ts`

- [ ] **Step 1: Write migration SQL**

```sql
-- migrations/0001_init.sql
CREATE TABLE IF NOT EXISTS clients (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  domain      TEXT NOT NULL UNIQUE,
  target_pno  NUMERIC(5,2) NOT NULL DEFAULT 25.00,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS metrics_daily (
  id                SERIAL PRIMARY KEY,
  client_id         INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  channel           TEXT NOT NULL,
  visits            INTEGER NOT NULL,
  cost              NUMERIC(10,2) NOT NULL,
  conversions       INTEGER NOT NULL,
  conversion_value  NUMERIC(10,2) NOT NULL,
  UNIQUE (client_id, date, channel)
);

CREATE INDEX IF NOT EXISTS idx_metrics_client_date
  ON metrics_daily (client_id, date);
```

- [ ] **Step 2: Write lib/db.ts**

```ts
// lib/db.ts
import { sql } from '@vercel/postgres';
export { sql };
```

- [ ] **Step 3: Write scripts/migrate.ts**

```ts
// scripts/migrate.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sql } from '@vercel/postgres';

async function migrate() {
  const ddl = readFileSync(join(process.cwd(), 'migrations/0001_init.sql'), 'utf8');
  await sql.query(ddl);
  console.log('✅ Migrace dokončena');
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 4: Run migration**

```bash
npm run db:migrate
```

Expected: `✅ Migrace dokončena`

- [ ] **Step 5: Commit**

```bash
git add migrations/ lib/db.ts scripts/migrate.ts
git commit -m "feat: database schema (clients + metrics_daily) and migrate script"
```

---

## Task 5: Seed Script

**Files:**
- Create: `scripts/seed.ts`

- [ ] **Step 1: Write scripts/seed.ts**

```ts
// scripts/seed.ts
import { sql } from '@vercel/postgres';

const CHANNELS = [
  ['organic',  0.42, 0.0,  0.022],
  ['cpc',      0.24, 6.5,  0.028],
  ['social',   0.14, 2.2,  0.012],
  ['direct',   0.10, 0.0,  0.030],
  ['email',    0.06, 0.4,  0.045],
  ['referral', 0.04, 0.0,  0.018],
] as const;

const DAYS = 90;
const AOV = 720;

function rnd(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

async function seed() {
  await sql`DELETE FROM metrics_daily`;
  await sql`DELETE FROM clients`;

  const { rows } = await sql`
    INSERT INTO clients (name, domain, target_pno)
    VALUES ('mionelo.cz', 'mionelo.cz', 25.00)
    RETURNING id
  `;
  const clientId = rows[0].id as number;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = DAYS - 1; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const iso = date.toISOString().slice(0, 10);

    const t = (DAYS - 1 - d) / (DAYS - 1); // 0 → 1 over time
    const decline = t > 0.66 ? 1 - (t - 0.66) * 0.9 : 1;
    const cpcInflation = 1 + t * 0.45;
    const weekend = [0, 6].includes(date.getDay()) ? 0.82 : 1;
    const baseVisits = 1400 * decline * weekend * rnd(0.92, 1.08);

    for (const [channel, share, cpc, cr] of CHANNELS) {
      const visits = Math.round(baseVisits * share);
      const conversions = Math.max(0, Math.round(visits * cr * rnd(0.85, 1.15)));
      const conversion_value = parseFloat((conversions * AOV * rnd(0.9, 1.1)).toFixed(2));
      const cost = parseFloat((visits * cpc * cpcInflation * rnd(0.9, 1.1)).toFixed(2));

      await sql`
        INSERT INTO metrics_daily
          (client_id, date, channel, visits, cost, conversions, conversion_value)
        VALUES (${clientId}, ${iso}, ${channel}, ${visits}, ${cost}, ${conversions}, ${conversion_value})
        ON CONFLICT (client_id, date, channel) DO UPDATE
          SET visits = EXCLUDED.visits,
              cost = EXCLUDED.cost,
              conversions = EXCLUDED.conversions,
              conversion_value = EXCLUDED.conversion_value
      `;
    }
  }

  console.log(`✅ Seed: client ${clientId}, ${DAYS} days × ${CHANNELS.length} channels`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Run seed**

```bash
npm run db:seed
```

Expected: `✅ Seed: client 1, 90 days × 6 channels`

- [ ] **Step 3: Commit**

```bash
git add scripts/seed.ts
git commit -m "feat: seed script with 90-day synthetic story (visits decline, PNO rising)"
```

---

## Task 6: SQL Queries

**Files:**
- Create: `lib/queries.ts`

- [ ] **Step 1: Write lib/queries.ts**

```ts
// lib/queries.ts
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

type Range = 7 | 30 | 90 | 365;

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
  days: Range
): Promise<KpiWithTrend> {
  const { start, end, prevStart, prevEnd } = getDateRanges(days);
  const [current, previous] = await Promise.all([
    fetchKpi(clientId, start, end),
    fetchKpi(clientId, prevStart, prevEnd),
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
  days: Range
): Promise<TimeSeriesPoint[]> {
  const { start, end } = getDateRanges(days);
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
  days: Range
): Promise<ChannelRow[]> {
  const { start, end } = getDateRanges(days);
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

export async function getAnalystContext(clientId: number): Promise<AnalystContext> {
  const { start: s7, end: e7 } = getDateRanges(7);
  const { start: s90, end: e90 } = getDateRanges(90);

  const [client, last7, last30, last90, by_channel_30d, trend_30d_full] =
    await Promise.all([
      getClient(clientId),
      fetchKpi(clientId, s7, e7),
      getKpiWithTrend(clientId, 30),
      fetchKpi(clientId, s90, e90),
      getSourcesBreakdown(clientId, 30),
      getTimeSeries(clientId, 30),
    ]);

  // Thin the 30-day series to every 3rd day to keep the snapshot compact
  const trend_30d = trend_30d_full.filter((_, i) => i % 3 === 0);

  return { client, periods: { last7, last30, last90 }, by_channel_30d, trend_30d };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only unrelated pre-existing errors).

- [ ] **Step 3: Commit**

```bash
git add lib/queries.ts lib/db.ts
git commit -m "feat: SQL queries — KPI with trend, time series, sources breakdown, analyst context"
```

---

## Task 7: Gemini AI Integration

**Files:**
- Create: `lib/ai/prompt.ts`
- Create: `app/api/analyst/route.ts`

- [ ] **Step 1: Write lib/ai/prompt.ts**

```ts
// lib/ai/prompt.ts
export const SYSTEM_PROMPT = `
Jsi seniorní výkonnostní marketér. Analyzuješ data e-shopu mionelo.cz
(ořechy, semínka, sušené ovoce, superpotravinami). Odpovídej česky, věcně a stručně.

Pravidla:
- Vycházej VÝHRADNĚ z dodaných dat. Nic si nevymýšlej.
- Když identifikuješ problém, podlož ho čísly (uveď % změnu a období).
- Vždy zakonči 2–4 konkrétními, akčními doporučeními číslovaným seznamem.
- PNO nad cílovou hodnotou (${'{'}target_pno}%) = problém; vysvětli příčinu.
- Pokud data na otázku nestačí, řekni to.
`.trim();

export function buildUserPrompt(question: string, snapshot: unknown): string {
  return `DATA KLIENTA (JSON):\n${JSON.stringify(snapshot, null, 2)}\n\nDOTAZ: ${question}`;
}
```

- [ ] **Step 2: Write app/api/analyst/route.ts**

```ts
// app/api/analyst/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAnalystContext } from '@/lib/queries';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/ai/prompt';

export const runtime = 'nodejs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ALLOWED_RANGES = new Set(['7', '30', '90', 'year']);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { question?: unknown; range?: unknown };

    if (typeof body.question !== 'string' || body.question.trim().length === 0) {
      return NextResponse.json({ error: 'Neplatný dotaz' }, { status: 400 });
    }
    if (body.question.length > 500) {
      return NextResponse.json({ error: 'Dotaz je příliš dlouhý (max 500 znaků)' }, { status: 400 });
    }

    const snapshot = await getAnalystContext(1); // client_id = 1 (mionelo)

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(
      buildUserPrompt(body.question.trim(), snapshot)
    );

    return NextResponse.json({ answer: result.response.text() });
  } catch (err) {
    console.error('[analyst route]', err);
    return NextResponse.json(
      { error: 'Omlouváme se, analytik momentálně není dostupný.' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/ai/ app/api/analyst/route.ts
git commit -m "feat: Gemini analyst API route with input validation and error handling"
```

---

## Task 8: Root Layout, Navigation & Home Redirect

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/nav/Navbar.tsx`
- Create: `components/nav/Breadcrumbs.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write components/nav/Navbar.tsx**

```tsx
// components/nav/Navbar.tsx
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clanek/oriesky-seminka', label: 'Článek' },
  { href: '/ai-analytik', label: 'AI Analytik' },
] as const;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-clay-soft bg-white/90 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        aria-label="Hlavní navigace"
      >
        <Link
          href="/"
          className="font-heading text-lg font-semibold text-espresso hover:text-walnut transition-colors"
        >
          mionelo<span className="text-walnut">.</span>cz
        </Link>
        <ul className="flex items-center gap-2" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-pill px-4 py-2 text-sm font-medium text-espresso transition-colors hover:bg-clay-soft hover:text-walnut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Write components/nav/Breadcrumbs.tsx**

```tsx
// components/nav/Breadcrumbs.tsx
import Link from 'next/link';

export type Crumb = { label: string; href?: string };

interface BreadcrumbsProps {
  crumbs: Crumb[];
}

export default function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol
        className="flex flex-wrap items-center gap-1 text-sm text-espresso/60"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {crumbs.map((crumb, idx) => (
          <li
            key={idx}
            className="flex items-center gap-1"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {idx > 0 && <span aria-hidden="true">/</span>}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:text-walnut transition-colors"
                itemProp="item"
              >
                <span itemProp="name">{crumb.label}</span>
              </Link>
            ) : (
              <span className="text-espresso font-medium" itemProp="name" aria-current="page">
                {crumb.label}
              </span>
            )}
            <meta itemProp="position" content={String(idx + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 3: Write app/layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/nav/Navbar';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Mionelo Marketing Suite',
    template: '%s · Mionelo',
  },
  description: 'Marketingový přehled výkonu pro mionelo.cz — e-shop s ořechy, semínky a superpotravinami.',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream text-espresso">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Write app/page.tsx (redirect to dashboard)**

```tsx
// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
```

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx components/nav/
git commit -m "feat: root layout with Fraunces+Inter fonts, sticky navbar, breadcrumbs component"
```

---

## Task 9: KPI Card Component

**Files:**
- Create: `components/dashboard/KpiCard.tsx`

- [ ] **Step 1: Write components/dashboard/KpiCard.tsx**

The sparkline uses Recharts `AreaChart` in a tiny 80×32 bounding box without axes.

```tsx
// components/dashboard/KpiCard.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/KpiCard.tsx
git commit -m "feat: KpiCard with sparkline, trend badge, and semantic color coding"
```

---

## Task 10: Dashboard Charts

**Files:**
- Create: `components/dashboard/TimeSeriesChart.tsx`
- Create: `components/dashboard/CostValueChart.tsx`
- Create: `components/dashboard/PnoChart.tsx`

- [ ] **Step 1: Write components/dashboard/TimeSeriesChart.tsx**

```tsx
// components/dashboard/TimeSeriesChart.tsx
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
              formatter={(value: number, name: string) => [
                name === 'Návštěvy' ? formatNumber(value) : value,
                name,
              ]}
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
```

- [ ] **Step 2: Write components/dashboard/CostValueChart.tsx**

```tsx
// components/dashboard/CostValueChart.tsx
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
              formatter={(value: number) => formatCurrency(value)}
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
```

- [ ] **Step 3: Write components/dashboard/PnoChart.tsx**

```tsx
// components/dashboard/PnoChart.tsx
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
      <div aria-label="Graf vývoje PNO" style={{ height: 220 }}>
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
              formatter={(v: number) => [`${v} %`, 'PNO']}
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
```

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/TimeSeriesChart.tsx components/dashboard/CostValueChart.tsx components/dashboard/PnoChart.tsx
git commit -m "feat: dashboard charts — time series, cost/value bars, PNO with reference line"
```

---

## Task 11: Sources Table & AI Insight Card

**Files:**
- Create: `components/dashboard/SourcesTable.tsx`
- Create: `components/dashboard/AiInsightCard.tsx`

- [ ] **Step 1: Write components/dashboard/SourcesTable.tsx**

```tsx
// components/dashboard/SourcesTable.tsx
import { formatNumber, formatCurrency, formatPercent, trendIsGood } from '@/lib/utils';
import type { ChannelRow } from '@/lib/queries';

const CHANNEL_LABELS: Record<string, string> = {
  organic: 'Organické vyhledávání',
  cpc: 'Placená reklama (CPC)',
  social: 'Sociální sítě',
  direct: 'Přímá návštěva',
  email: 'E-mail',
  referral: 'Referral',
};

interface Props {
  channels: ChannelRow[];
  targetPno: number;
}

export default function SourcesTable({ channels, targetPno }: Props) {
  return (
    <div className="rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] overflow-hidden">
      <div className="px-6 py-5 border-b border-clay-soft">
        <h2 className="font-heading text-lg font-semibold text-espresso">
          Přehled zdrojů (30 dní)
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Přehled zdrojů návštěvnosti">
          <thead>
            <tr className="border-b border-clay-soft text-left">
              {['Kanál', 'Návštěvy', 'Náklady', 'Konverze', 'PNO'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 font-medium text-espresso/50 text-xs uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channels.map((row) => {
              const pnoGood = trendIsGood('pno', row.pno - targetPno) || row.pno <= targetPno;
              return (
                <tr
                  key={row.channel}
                  className="border-b border-clay-soft/50 hover:bg-cream transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-espresso">
                    {CHANNEL_LABELS[row.channel] ?? row.channel}
                  </td>
                  <td className="px-6 py-4 font-tabular text-espresso">
                    {formatNumber(row.visits)}
                  </td>
                  <td className="px-6 py-4 font-tabular text-espresso">
                    {formatCurrency(row.cost)}
                  </td>
                  <td className="px-6 py-4 font-tabular text-espresso">
                    {formatNumber(row.conversions)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-pill px-2 py-0.5 text-xs font-medium font-tabular ${
                        pnoGood
                          ? 'bg-positive/10 text-positive'
                          : 'bg-negative/10 text-negative'
                      }`}
                    >
                      {formatPercent(row.pno)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write components/dashboard/AiInsightCard.tsx**

```tsx
// components/dashboard/AiInsightCard.tsx
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface Props {
  insight: string;
}

export default function AiInsightCard({ insight }: Props) {
  return (
    <div className="rounded-[var(--radius-card)] bg-espresso p-6 text-white shadow-[var(--shadow-card)] flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-walnut" />
        <span className="text-sm font-medium text-white/70">AI Analytik</span>
      </div>
      <p className="text-base leading-relaxed">{insight}</p>
      <Link
        href="/ai-analytik"
        className="inline-flex w-fit items-center rounded-pill bg-walnut px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-walnut/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
      >
        Zeptat se AI analytika
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/SourcesTable.tsx components/dashboard/AiInsightCard.tsx
git commit -m "feat: sources breakdown table and AI insight card"
```

---

## Task 12: Dashboard Page

**Files:**
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: Write app/dashboard/page.tsx**

```tsx
// app/dashboard/page.tsx
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

// Revalidate every hour; data doesn't change more often in this demo
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
```

- [ ] **Step 2: Start dev server and verify dashboard loads**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000/dashboard | grep -c "Návštěvy"
```

Expected: returns `1` or more (heading found in HTML).

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/
git commit -m "feat: dashboard RSC page with 5 KPI cards, 3 charts, sources table, and AI insight"
```

---

## Task 13: Article Content & Components

**Files:**
- Create: `content/clanky/oriesky-seminka.ts`
- Create: `components/article/ArticleHero.tsx`
- Create: `components/article/Toc.tsx`
- Create: `components/article/RelatedCards.tsx`

- [ ] **Step 1: Write content/clanky/oriesky-seminka.ts**

```ts
// content/clanky/oriesky-seminka.ts
export const article = {
  slug: 'oriesky-seminka',
  title: 'Ořechy a semínka: průvodce superpotravinami',
  excerpt:
    'Proč jsou vlašské ořechy, chia semínka a mandlové maslo základem zdravé stravy? Průvodce výběrem, skladováním a přípravou od mionelo.cz.',
  publishedAt: '2025-10-15',
  updatedAt: '2026-01-20',
  author: 'mionelo.cz',
  category: 'Zdravá výživa',
  coverImage: '/images/oriesky-hero.jpg',
  coverAlt: 'Mísa smíšených ořechů a semínek na dřevěném podnosu',
  readingTime: '7 min',
  toc: [
    { id: 'proc-jist-orechy', label: 'Proč jíst ořechy každý den?' },
    { id: 'vlasske-orechy', label: 'Vlašské ořechy — král omega-3' },
    { id: 'mandle', label: 'Mandle — pro srdce i nervový systém' },
    { id: 'seminka', label: 'Semínka: malá, ale výživná' },
    { id: 'chia', label: 'Chia semínka' },
    { id: 'konopna', label: 'Konopná semínka' },
    { id: 'susene-ovoce', label: 'Sušené ovoce: přirozená sladkost' },
    { id: 'jak-zaradit', label: 'Jak je zařadit do jídelníčku' },
  ],
};

export type ArticleData = typeof article;
```

- [ ] **Step 2: Write components/article/ArticleHero.tsx**

```tsx
// components/article/ArticleHero.tsx
import type { ArticleData } from '@/content/clanky/oriesky-seminka';

interface Props {
  article: ArticleData;
}

export default function ArticleHero({ article }: Props) {
  return (
    <header className="mb-10">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-espresso/50">
        <span className="rounded-pill bg-walnut/10 px-3 py-1 text-xs font-medium text-walnut">
          {article.category}
        </span>
        <span>{article.readingTime} čtení</span>
        <time dateTime={article.publishedAt}>
          {new Date(article.publishedAt).toLocaleDateString('cs-CZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </time>
      </div>
      <h1 className="font-heading text-4xl font-semibold leading-tight text-espresso sm:text-5xl">
        {article.title}
      </h1>
      <p className="mt-4 text-lg text-espresso/60 leading-relaxed max-w-2xl">
        {article.excerpt}
      </p>
      {/* Hero image placeholder — replace with next/image when real image is available */}
      <div
        className="mt-8 h-64 rounded-[var(--radius-card)] bg-clay-soft flex items-center justify-center text-espresso/30 text-sm"
        role="img"
        aria-label={article.coverAlt}
      >
        {article.coverAlt}
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Write components/article/Toc.tsx**

```tsx
// components/article/Toc.tsx
interface TocItem {
  id: string;
  label: string;
}

interface Props {
  items: TocItem[];
}

export default function Toc({ items }: Props) {
  return (
    <nav
      aria-label="Obsah článku"
      className="rounded-[var(--radius-card)] bg-clay-soft/50 border border-clay-soft p-5 mb-8 lg:mb-0"
    >
      <h2 className="font-heading text-base font-semibold text-espresso mb-3">
        Obsah
      </h2>
      <ol className="space-y-2 text-sm">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-espresso/60 hover:text-walnut transition-colors flex gap-2"
            >
              <span className="text-walnut font-medium shrink-0">{i + 1}.</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 4: Write components/article/RelatedCards.tsx**

```tsx
// components/article/RelatedCards.tsx
import Link from 'next/link';

const RELATED = [
  {
    href: '/dashboard',
    title: 'Dashboard výkonu mionelo.cz',
    desc: 'Klíčové metriky, trendy návštěvnosti a PNO v přehledném dashboardu.',
    tag: 'Analytika',
  },
  {
    href: '/ai-analytik',
    title: 'AI Marketingový analytik',
    desc: 'Zeptejte se AI na konkrétní problém vašeho e-shopu — dostanete odpověď za sekundy.',
    tag: 'AI nástroj',
  },
];

export default function RelatedCards() {
  return (
    <section aria-label="Související obsah" className="mt-12 border-t border-clay-soft pt-8">
      <h2 className="font-heading text-xl font-semibold text-espresso mb-6">
        Mohlo by vás zajímat
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {RELATED.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-[var(--radius-card)] border border-clay-soft bg-white p-5 shadow-[var(--shadow-card)] hover:border-walnut/30 hover:shadow-md transition-all"
          >
            <span className="text-xs font-medium text-walnut mb-2 block">{item.tag}</span>
            <h3 className="font-heading font-semibold text-espresso group-hover:text-walnut transition-colors mb-1">
              {item.title}
            </h3>
            <p className="text-sm text-espresso/60">{item.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add content/ components/article/
git commit -m "feat: article content data, hero, table of contents, and related cards"
```

---

## Task 14: Article Page

**Files:**
- Create: `app/clanek/[slug]/page.tsx`

- [ ] **Step 1: Write app/clanek/[slug]/page.tsx**

```tsx
// app/clanek/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { article } from '@/content/clanky/oriesky-seminka';
import ArticleHero from '@/components/article/ArticleHero';
import Toc from '@/components/article/Toc';
import RelatedCards from '@/components/article/RelatedCards';
import Breadcrumbs from '@/components/nav/Breadcrumbs';

export function generateStaticParams() {
  return [{ slug: article.slug }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== article.slug) return {};

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/clanek/${slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.coverImage, width: 1200, height: 630, alt: article.coverAlt }],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== article.slug) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const pageUrl = `${siteUrl}/clanek/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Organization', name: 'mionelo.cz', url: 'https://mionelo.cz' },
    publisher: { '@type': 'Organization', name: 'mionelo.cz' },
    mainEntityOfPage: pageUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Breadcrumbs
          crumbs={[
            { label: 'mionelo.cz', href: '/' },
            { label: 'Články', href: '/clanek' },
            { label: article.title },
          ]}
        />

        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
          {/* Main article content */}
          <article className="max-w-2xl">
            <ArticleHero article={article} />

            <div className="lg:hidden mb-8">
              <Toc items={article.toc} />
            </div>

            <div className="prose prose-slate max-w-none space-y-6 text-espresso leading-relaxed">

              <section id="proc-jist-orechy">
                <h2 className="font-heading text-2xl font-semibold text-espresso mt-8 mb-3">
                  Proč jíst ořechy každý den?
                </h2>
                <p>
                  Ořechy patří mezi nejkomplexnější přírodní potraviny. Poskytují zdravé tuky,
                  bílkoviny, vlákninu, vitamíny (E, B-komplex) a minerály jako hořčík, zinek a selen.
                  Pravidelná konzumace <strong>hrsti ořechů denně</strong> je spojena se sníženým
                  rizikem srdečních onemocnění a lepší kontrolou hmotnosti.
                </p>
                <p>
                  V nabídce <Link href="/" className="text-walnut hover:underline">mionelo.cz</Link> najdete
                  přes 40 druhů ořechů a semínek — od klasických vlašských po exotické macadamie.
                  Vše bez přidaného cukru, soli ani konzervantů.
                </p>
              </section>

              <section id="vlasske-orechy">
                <h2 className="font-heading text-2xl font-semibold text-espresso mt-8 mb-3">
                  Vlašské ořechy — král omega-3
                </h2>
                <p>
                  Vlašské ořechy jsou jedinečným zdrojem rostlinných <strong>omega-3 mastných kyselin</strong>
                  (ALA). Jedna porce (30 g, přibližně 7 půlených jader) pokryje doporučený denní příjem ALA.
                  Studie naznačují pozitivní vliv na kognitivní funkce, náladu i kardiovaskulární zdraví.
                </p>
                <h3 className="font-heading text-lg font-semibold text-espresso mt-5 mb-2">
                  Jak je skladovat
                </h3>
                <p>
                  Díky vysokému obsahu tuků jsou vlašské ořechy náchylné k žluknutí. Uchovávejte je
                  v temnu, chladu (lednice) a spotřebujte do 3 měsíců po otevření. Celá jádra v
                  skořápce vydrží déle.
                </p>
              </section>

              <section id="mandle">
                <h2 className="font-heading text-2xl font-semibold text-espresso mt-8 mb-3">
                  Mandle — pro srdce i nervový systém
                </h2>
                <p>
                  Mandle excelují obsahem <strong>vitamínu E</strong> (jeden z nejsilnějších
                  antioxidantů), hořčíku a vápníku. Jsou také relativně bohaté na bílkoviny —
                  6 g na 30g porci — a skvěle zasytí jako svačina.
                </p>
                <p>
                  Mandlové maslo z naší{' '}
                  <Link href="/dashboard" className="text-walnut hover:underline">
                    výkonnostní sekce
                  </Link>{' '}
                  je nejprodávanějším produktem mionelo.cz. Vyrábíme ho výhradně z pražených
                  mandlí bez přídavků.
                </p>
              </section>

              <section id="seminka">
                <h2 className="font-heading text-2xl font-semibold text-espresso mt-8 mb-3">
                  Semínka: malá, ale výživná
                </h2>
                <p>
                  Semínka bývají nedoceněnou složkou zdravé stravy. Přitom gram za gram nabízejí
                  srovnatelné nebo i vyšší nutriční hodnoty než ořechy. Jsou ideální pro
                  přidávání do{' '}
                  <strong>jogurtů, smoothies, salátů nebo domácí granoly</strong>.
                </p>
              </section>

              <section id="chia">
                <h3 className="font-heading text-xl font-semibold text-espresso mt-6 mb-2">
                  Chia semínka
                </h3>
                <p>
                  Chia semínka (šalvěj hispánská) absorbují až desetinásobek své hmotnosti ve vodě
                  a tvoří gel. Jsou bohatá na omega-3, vlákninu a vápník. Oblíbená příprava:
                  chia pudink (3 lžíce semínek, 200 ml rostlinného mléka, přes noc do lednice).
                </p>
              </section>

              <section id="konopna">
                <h3 className="font-heading text-xl font-semibold text-espresso mt-6 mb-2">
                  Konopná semínka
                </h3>
                <p>
                  Konopná semínka obsahují všechny esenciální aminokyseliny a ideální poměr omega-6
                  k omega-3 (3:1). Mají jemnou oříškovou chuť a neobsahují THC. Posypte jimi
                  avokádový toast nebo přidejte do proteinového smoothie.
                </p>
              </section>

              <section id="susene-ovoce">
                <h2 className="font-heading text-2xl font-semibold text-espresso mt-8 mb-3">
                  Sušené ovoce: přirozená sladkost
                </h2>
                <p>
                  Sušené ovoce je přirozeně koncentrovaným zdrojem energie, vlákniny a minerálů.
                  Ideální jako náhrada rafinovaného cukru v pečení nebo jako rychlá svačina při
                  sportu. V mionelo nabízíme <strong>sušené datle, meruňky, švestky i brusinky</strong>{' '}
                  bez přidaného cukru a siřičitanů.
                </p>
                <p className="text-espresso/60 text-sm mt-2">
                  Tip: přirozená sladkost datlí je skvělou náhradou cukru v raw dezertních kulích
                  z ořechů a kakaového prášku.
                </p>
              </section>

              <section id="jak-zaradit">
                <h2 className="font-heading text-2xl font-semibold text-espresso mt-8 mb-3">
                  Jak je zařadit do jídelníčku
                </h2>
                <ul className="list-disc list-inside space-y-2 text-espresso">
                  <li>
                    <strong>Snídaně:</strong> müsli nebo ovesná kaše s vlašskými ořechy a chia semínky.
                  </li>
                  <li>
                    <strong>Svačina:</strong> hrst mandlí nebo kešu (30 g) — zasytí a nepřetěžuje trávení.
                  </li>
                  <li>
                    <strong>Oběd:</strong> salát posypaný dýňovými semínky pro křupavost a extra hořčík.
                  </li>
                  <li>
                    <strong>Dezert:</strong> raw kuličky z datlí, kakaa a vlašských ořechů — bez pečení.
                  </li>
                </ul>

                <div className="mt-6 rounded-[var(--radius-card)] border-l-4 border-walnut bg-walnut/5 p-4 text-sm text-espresso">
                  <strong>Denní doporučená porce:</strong> 30 g ořechů nebo 15–20 g semínek.
                  Větší množství zvyšuje kalorický příjem bez proporcionálního nutričního zisku.
                </div>

                <p className="mt-4">
                  Chcete vědět, které produkty mionelo.cz táhnou prodeje nejvíce? Podívejte se na
                  náš{' '}
                  <Link href="/dashboard" className="text-walnut hover:underline font-medium">
                    dashboard výkonu
                  </Link>{' '}
                  nebo se zeptejte{' '}
                  <Link href="/ai-analytik" className="text-walnut hover:underline font-medium">
                    AI marketingového analytika
                  </Link>
                  .
                </p>
              </section>
            </div>

            <RelatedCards />
          </article>

          {/* Sidebar TOC (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Toc items={article.toc} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/clanek/
git commit -m "feat: SSG article page with JSON-LD, OG tags, TOC sidebar, internal links"
```

---

## Task 15: AI Analyst Chat UI

**Files:**
- Create: `components/ai/MessageBubble.tsx`
- Create: `components/ai/QuickQuestions.tsx`
- Create: `components/ai/ChatWindow.tsx`
- Create: `app/ai-analytik/page.tsx`

- [ ] **Step 1: Write components/ai/MessageBubble.tsx**

```tsx
// components/ai/MessageBubble.tsx
import { Sparkles, User } from 'lucide-react';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-walnut text-white' : 'bg-espresso text-white'
        }`}
      >
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-walnut text-white rounded-tr-none'
            : 'bg-white text-espresso shadow-[var(--shadow-card)] rounded-tl-none'
        }`}
      >
        {message.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write components/ai/QuickQuestions.tsx**

```tsx
// components/ai/QuickQuestions.tsx
const QUESTIONS = [
  'Proč klesají návštěvy?',
  'Jak snížit PNO?',
  'Shrň výkon za posledních 30 dní.',
  'Co zlepšit jako první?',
];

interface Props {
  onSelect: (question: string) => void;
  disabled: boolean;
}

export default function QuickQuestions({ onSelect, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="rounded-pill border border-clay-soft bg-white px-4 py-2 text-xs font-medium text-espresso hover:border-walnut hover:text-walnut transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write components/ai/ChatWindow.tsx**

```tsx
// components/ai/ChatWindow.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { SendHorizonal } from 'lucide-react';
import MessageBubble, { type Message } from './MessageBubble';
import QuickQuestions from './QuickQuestions';

const WELCOME: Message = {
  role: 'assistant',
  content:
    'Dobrý den! Jsem váš AI marketingový analytik pro mionelo.cz. Mohu vám pomoci analyzovat výkon, identifikovat problémy a navrhnout konkrétní kroky. Na co se chcete zeptat?',
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: question.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/analyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json() as { answer?: string; error?: string };
      const content = data.answer ?? data.error ?? 'Omlouváme se, nastala chyba.';
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Omlouváme se, analytik momentálně není dostupný.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-h-[800px]">
      {/* Quick questions */}
      <QuickQuestions onSelect={sendMessage} disabled={loading} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-espresso text-white flex items-center justify-center shrink-0">
              <span className="text-xs">AI</span>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-[var(--shadow-card)] flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-espresso/30 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 pt-4 border-t border-clay-soft"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Napište svůj dotaz…"
          maxLength={500}
          disabled={loading}
          aria-label="Dotaz pro AI analytika"
          className="flex-1 rounded-pill border border-clay-soft bg-white px-5 py-3 text-sm text-espresso placeholder:text-espresso/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Odeslat dotaz"
          className="w-12 h-12 rounded-full bg-walnut text-white flex items-center justify-center hover:bg-walnut/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
        >
          <SendHorizonal size={18} />
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Write app/ai-analytik/page.tsx**

```tsx
// app/ai-analytik/page.tsx
import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import ChatWindow from '@/components/ai/ChatWindow';
import Breadcrumbs from '@/components/nav/Breadcrumbs';

export const metadata: Metadata = {
  title: 'AI Marketingový analytik',
  description:
    'Zeptejte se AI analytika na výkon mionelo.cz — návštěvy, PNO, reklamu. Odpověď podložená reálnými daty.',
};

export default function AiAnalytikPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Breadcrumbs
        crumbs={[
          { label: 'mionelo.cz', href: '/' },
          { label: 'AI Analytik' },
        ]}
      />

      <div className="mb-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-espresso flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-walnut" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-espresso">
            AI Marketingový analytik
          </h1>
          <p className="text-sm text-espresso/50 mt-1">
            Analytik mionelo.cz · Odpovídá na základě dat z posledních 90 dní
          </p>
        </div>
      </div>

      <ChatWindow />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/ai/ app/ai-analytik/
git commit -m "feat: AI analyst chat UI with quick questions, streaming bubbles, error handling"
```

---

## Task 16: SEO Files

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] **Step 1: Write app/sitemap.ts**

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { article } from '@/content/clanky/oriesky-seminka';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return [
    { url: base, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/dashboard`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/ai-analytik`, changeFrequency: 'monthly', priority: 0.7 },
    {
      url: `${base}/clanek/${article.slug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
      lastModified: new Date(article.updatedAt),
    },
  ];
}
```

- [ ] **Step 2: Write app/robots.ts**

```ts
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Verify sitemap and robots are accessible**

```bash
curl -s http://localhost:3000/sitemap.xml | head -5
curl -s http://localhost:3000/robots.txt
```

Expected: sitemap.xml contains URLs, robots.txt shows Allow rules.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat: sitemap.xml and robots.txt with all three pages"
```

---

## Task 17: Full Build & Verification

- [ ] **Step 1: Run full production build**

```bash
npm run build 2>&1 | tail -40
```

Expected: build completes with three routes static/dynamic as expected:
- `○ /dashboard` — dynamic (ISR)
- `● /clanek/oriesky-seminka` — static
- `○ /ai-analytik` — static (client)
- `○ /api/analyst` — dynamic

No TypeScript errors. No ESLint errors.

- [ ] **Step 2: Run unit tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Start production server and check all pages**

```bash
npm start &
sleep 3
curl -s http://localhost:3000/dashboard -o /dev/null -w "%{http_code}"
curl -s http://localhost:3000/clanek/oriesky-seminka -o /dev/null -w "%{http_code}"
curl -s http://localhost:3000/ai-analytik -o /dev/null -w "%{http_code}"
```

Expected: all return `200`.

- [ ] **Step 4: Check JSON-LD on article page**

```bash
curl -s http://localhost:3000/clanek/oriesky-seminka | grep -o 'BlogPosting'
```

Expected: `BlogPosting` appears in output.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Mionelo Marketing Suite — dashboard, article, AI analyst"
```

---

## Task 18: Deploy to Vercel

- [ ] **Step 1: Push to GitHub and trigger Vercel deploy**

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

Expected: Vercel picks up push and starts a build.

- [ ] **Step 2: Run DB migrate + seed against Vercel Postgres**

```bash
vercel env pull .env.local   # pulls POSTGRES_URL etc. from Vercel project
npm run db:migrate
npm run db:seed
```

Expected: `✅ Migrace dokončena`, `✅ Seed: client 1, 90 days × 6 channels`

- [ ] **Step 3: Verify production URLs**

```bash
curl -s https://<your-domain>/sitemap.xml | head -5
curl -s https://<your-domain>/robots.txt
```

Expected: both return content.

- [ ] **Step 4: Set NEXT_PUBLIC_SITE_URL in Vercel project settings**

In Vercel → Project → Settings → Environment Variables, add:
- Key: `NEXT_PUBLIC_SITE_URL`
- Value: `https://<your-vercel-domain>`
- Environment: Production, Preview

Redeploy to pick up the change.
