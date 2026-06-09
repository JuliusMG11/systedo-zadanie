// scripts/seed.ts
import { join } from 'node:path';
import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load .env.local for local development (Vercel injects these in CI/production)
config({ path: join(process.cwd(), '.env.local') });

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
