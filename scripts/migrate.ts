// scripts/migrate.ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load .env.local for local development (Vercel injects these in CI/production)
config({ path: join(process.cwd(), '.env.local') });

async function migrate() {
  const ddl = readFileSync(join(process.cwd(), 'migrations/0001_init.sql'), 'utf8');
  await sql.query(ddl);
  console.log('✅ Migrace dokončena');
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
