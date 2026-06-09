# 05 — Database Architecture

Databáze: **Vercel Postgres** (běží na Neon). Přístup přes `@vercel/postgres`
s parametrizovanými dotazy (tagged template `sql\`…\``), nikdy konkatenace.

## Schéma

```
clients (1) ───< (N) metrics_daily
```

### Tabulka `clients`

| Sloupec | Typ | Popis |
|---|---|---|
| `id` | `SERIAL PK` | identifikátor |
| `name` | `TEXT` | název klienta („mionelo.cz") |
| `domain` | `TEXT UNIQUE` | doména |
| `target_pno` | `NUMERIC(5,2)` | cílové PNO v % (referenční linie v grafu) |
| `created_at` | `TIMESTAMPTZ` | založení |

### Tabulka `metrics_daily`

Denní metriky **po kanálech** (channel), aby šlo dělat jak souhrn, tak breakdown
zdrojů návštěvnosti.

| Sloupec | Typ | Popis |
|---|---|---|
| `id` | `SERIAL PK` | |
| `client_id` | `INT FK → clients.id` | majitel řádku |
| `date` | `DATE` | den |
| `channel` | `TEXT` | `organic`, `cpc`, `social`, `direct`, `email`, `referral` |
| `visits` | `INT` | návštěvy |
| `cost` | `NUMERIC(10,2)` | náklady (CZK) |
| `conversions` | `INT` | konverze |
| `conversion_value` | `NUMERIC(10,2)` | hodnota konverze = obrat (CZK) |

Unikátní klíč `(client_id, date, channel)` → idempotentní seed (UPSERT).

## Odvozené metriky (nepukládáme, počítáme v dotazu)

- **PNO** = `SUM(cost) / NULLIF(SUM(conversion_value), 0) * 100` (v %).
- **Konverzní poměr** = `SUM(conversions) / NULLIF(SUM(visits),0) * 100`.
- **Průměrná hodnota konverze** = `SUM(conversion_value)/NULLIF(SUM(conversions),0)`.

Ukládat jen surová, aditivní čísla; poměry dopočítávat → žádná nekonzistence.

## Indexy

```sql
CREATE INDEX idx_metrics_client_date ON metrics_daily (client_id, date);
```

Pokrývá filtr podle období i řazení dle data; pro demo objem (≈ 90 dní × 6 kanálů
× 1 klient ≈ 540 řádků) je to s rezervou dostatečné.

## Reprezentativní dotazy (`lib/queries.ts`)

**Souhrn KPI za období + trend vůči předchozímu stejně dlouhému období:**
```sql
SELECT
  SUM(visits)            AS visits,
  SUM(cost)              AS cost,
  SUM(conversions)       AS conversions,
  SUM(conversion_value)  AS conversion_value,
  SUM(cost) / NULLIF(SUM(conversion_value),0) * 100 AS pno
FROM metrics_daily
WHERE client_id = $1 AND date BETWEEN $2 AND $3;
```

**Časová řada (denní agregace přes kanály):**
```sql
SELECT date,
       SUM(visits) AS visits,
       SUM(conversions) AS conversions,
       SUM(cost) AS cost,
       SUM(conversion_value) AS conversion_value
FROM metrics_daily
WHERE client_id = $1 AND date BETWEEN $2 AND $3
GROUP BY date ORDER BY date;
```

**Top zdroje za období:**
```sql
SELECT channel,
       SUM(visits) AS visits,
       SUM(cost) AS cost,
       SUM(conversions) AS conversions,
       SUM(cost)/NULLIF(SUM(conversion_value),0)*100 AS pno
FROM metrics_daily
WHERE client_id = $1 AND date BETWEEN $2 AND $3
GROUP BY channel ORDER BY visits DESC;
```

## Připojení (`lib/db.ts`)

```ts
import { sql } from '@vercel/postgres';
export { sql };
// Použití: const { rows } = await sql`SELECT ...`;
```

`@vercel/postgres` čte `POSTGRES_URL` z prostředí automaticky (Vercel je injektuje
po propojení DB s projektem). Lokálně se tytéž proměnné stáhnou přes `vercel env pull`.
