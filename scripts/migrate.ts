// scripts/migrate.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL ?? process.env.POSTGRES_URL!);

const MIGRATIONS = [
  '0001_init.sql',
  '0002_chat.sql',
];

async function migrate() {
  for (const file of MIGRATIONS) {
    const ddl = readFileSync(join(process.cwd(), 'migrations', file), 'utf8');
    const statements = ddl.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      // eslint-disable-next-line no-await-in-loop
      await sql([stmt] as unknown as TemplateStringsArray);
    }
    console.log(`✅ ${file}`);
  }
  console.log('Migration complete');
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
