// scripts/seed.ts
import { join } from 'node:path';
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL ?? process.env.POSTGRES_URL!);

const CHANNELS = [
  ['organic',  0.42, 0.0,  0.022],
  ['cpc',      0.24, 6.5,  0.028],
  ['social',   0.14, 2.2,  0.012],
  ['direct',   0.10, 0.0,  0.030],
  ['email',    0.06, 0.4,  0.045],
  ['referral', 0.04, 0.0,  0.018],
] as const;

function rnd(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

interface ClientProfile {
  name: string;
  domain: string;
  target_pno: number;
  days: number;
  baseVisits: number;
  aov: number;
  story: 'decline' | 'growth' | 'stable';
}

const CLIENTS: ClientProfile[] = [
  { name: 'mionelo.cz',   domain: 'mionelo.cz',   target_pno: 25, days: 90,  baseVisits: 1400, aov: 720, story: 'decline' },
  { name: 'Rohlik.cz',    domain: 'rohlik.cz',    target_pno: 20, days: 180, baseVisits: 3800, aov: 290, story: 'growth'  },
  { name: 'Alza.cz',      domain: 'alza.cz',      target_pno: 30, days: 365, baseVisits: 950,  aov: 149, story: 'stable'  },
];

function storyMultiplier(story: ClientProfile['story'], t: number): number {
  if (story === 'decline') return t > 0.66 ? 1 - (t - 0.66) * 0.9 : 1;
  if (story === 'growth')  return 0.6 + t * 0.8;
  return 0.92 + Math.sin(t * Math.PI * 4) * 0.08;
}

async function seedClient(profile: ClientProfile): Promise<number> {
  const rows = await sql`
    INSERT INTO clients (name, domain, target_pno)
    VALUES (${profile.name}, ${profile.domain}, ${profile.target_pno})
    RETURNING id
  `;
  const clientId = (rows[0] as { id: number }).id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cpcInflationRate = profile.story === 'growth' ? 0.3 : 0.45;

  for (let d = profile.days - 1; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const iso = date.toISOString().slice(0, 10);
    const t = (profile.days - 1 - d) / (profile.days - 1);
    const trend = storyMultiplier(profile.story, t);
    const cpcInflation = 1 + t * cpcInflationRate;
    const weekend = [0, 6].includes(date.getDay()) ? 0.82 : 1;
    const baseVisits = profile.baseVisits * trend * weekend * rnd(0.92, 1.08);

    for (const [channel, share, cpc, cr] of CHANNELS) {
      const visits = Math.round(baseVisits * share);
      const conversions = Math.max(0, Math.round(visits * cr * rnd(0.85, 1.15)));
      const conversion_value = parseFloat((conversions * profile.aov * rnd(0.9, 1.1)).toFixed(2));
      const cost = parseFloat((visits * cpc * cpcInflation * rnd(0.9, 1.1)).toFixed(2));

      await sql`
        INSERT INTO metrics_daily (client_id, date, channel, visits, cost, conversions, conversion_value)
        VALUES (${clientId}, ${iso}, ${channel}, ${visits}, ${cost}, ${conversions}, ${conversion_value})
        ON CONFLICT (client_id, date, channel) DO UPDATE
          SET visits = EXCLUDED.visits, cost = EXCLUDED.cost,
              conversions = EXCLUDED.conversions, conversion_value = EXCLUDED.conversion_value
      `;
    }
  }

  console.log(`✅ ${profile.name}: ${profile.days} days`);
  return clientId;
}

async function seed() {
  await sql`TRUNCATE clients RESTART IDENTITY CASCADE`;
  for (const profile of CLIENTS) await seedClient(profile);
  console.log('Seed complete');
}

seed().catch((e) => { console.error(e); process.exit(1); });
