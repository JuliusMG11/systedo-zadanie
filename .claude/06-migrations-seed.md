# 06 — Migrations & Seed Data

## Migrace

Jednoduchý přístup: SQL soubory v `migrations/`, spouštěné skriptem. Pro rozsah
demo projektu není potřeba těžký migrační framework (Prisma/Drizzle by šel, ale
přidává složitost). Pokud bys chtěl typovou bezpečnost, doporučená nadstavba je
**Drizzle** — viz poznámka na konci.

### `migrations/0001_init.sql`

```sql
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

### `scripts/migrate.ts`

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sql } from '@vercel/postgres';

async function migrate() {
  const ddl = readFileSync(join(process.cwd(), 'migrations/0001_init.sql'), 'utf8');
  await sql.query(ddl);
  console.log('✅ Migrace dokončena');
}
migrate().catch((e) => { console.error(e); process.exit(1); });
```

`package.json`:
```json
{
  "scripts": {
    "db:migrate": "tsx scripts/migrate.ts",
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

## Ukázková data — záměrný příběh

Data jsou syntetická, ale **konzistentní a vyprávějí příběh**, na kterém AI
analytik předvede hodnotu:

- 90 dní historie, 6 kanálů.
- **Návštěvy:** posledních ~30 dní mírný pokles (hlavně organic + cpc).
- **Náklady:** rostou (zvyšované CPC), zatímco hodnota konverze stagnuje.
- **Výsledek:** **PNO šplhá nad cílovou hodnotu (25 %)** → „ztrácíme návštěvy
  a zhoršuje se nám PNO, podívej se na klienta".

Díky tomu má dotaz „Proč klesají návštěvy?" reálnou oporu v datech.

### `scripts/seed.ts`

```ts
import { sql } from '@vercel/postgres';

const CHANNELS = [
  // [kanál, podíl návštěv, prům. CPC, baseline konv. poměr]
  ['organic',  0.42, 0.0,  0.022],
  ['cpc',      0.24, 6.5,  0.028],
  ['social',   0.14, 2.2,  0.012],
  ['direct',   0.10, 0.0,  0.030],
  ['email',    0.06, 0.4,  0.045],
  ['referral', 0.04, 0.0,  0.018],
] as const;

const DAYS = 90;
const AOV = 720;            // průměrná hodnota objednávky (CZK)
const rnd = (min: number, max: number) => Math.random() * (max - min) + min;

async function seed() {
  // čistý start
  await sql`DELETE FROM metrics_daily`;
  await sql`DELETE FROM clients`;

  const { rows } = await sql`
    INSERT INTO clients (name, domain, target_pno)
    VALUES ('mionelo.cz', 'mionelo.cz', 25.00)
    RETURNING id`;
  const clientId = rows[0].id;

  const today = new Date();
  for (let d = DAYS - 1; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const iso = date.toISOString().slice(0, 10);

    const t = (DAYS - 1 - d) / (DAYS - 1);          // 0 → 1 v čase
    const decline = t > 0.66 ? 1 - (t - 0.66) * 0.9 : 1;  // pokles v posledku
    const cpcInflation = 1 + t * 0.45;              // rostoucí náklady
    const weekend = [0, 6].includes(date.getDay()) ? 0.82 : 1;
    const baseVisits = 1400 * decline * weekend * rnd(0.92, 1.08);

    for (const [channel, share, cpc, cr] of CHANNELS) {
      const visits = Math.round(baseVisits * share);
      const conversions = Math.max(0, Math.round(visits * cr * rnd(0.85, 1.15)));
      const conversion_value = +(conversions * AOV * rnd(0.9, 1.1)).toFixed(2);
      const cost = +((visits * cpc * cpcInflation) * rnd(0.9, 1.1)).toFixed(2);

      await sql`
        INSERT INTO metrics_daily
          (client_id, date, channel, visits, cost, conversions, conversion_value)
        VALUES (${clientId}, ${iso}, ${channel}, ${visits}, ${cost},
                ${conversions}, ${conversion_value})
        ON CONFLICT (client_id, date, channel) DO UPDATE
          SET visits = EXCLUDED.visits, cost = EXCLUDED.cost,
              conversions = EXCLUDED.conversions,
              conversion_value = EXCLUDED.conversion_value`;
    }
  }
  console.log(`✅ Seed: klient ${clientId}, ${DAYS} dní × ${CHANNELS.length} kanálů`);
}
seed().catch((e) => { console.error(e); process.exit(1); });
```

## Idempotence

- `migrate` používá `IF NOT EXISTS` → bezpečně opakovatelné.
- `seed` maže a vkládá znovu + má `ON CONFLICT … DO UPDATE` → jeden výsledný stav
  bez ohledu na počet spuštění. Pro produkci by se seed nepouštěl.

## Poznámka — Drizzle (volitelná nadstavba)

Pokud bys chtěl typově bezpečné schéma a migrace generované z TS, nahraď ruční
SQL za Drizzle: definice tabulek v `schema.ts`, `drizzle-kit generate` + `migrate`.
Pro demo ale ruční SQL stačí a je transparentnější k revizi.
