// src/lib/db.ts
// @vercel/postgres uses api.*.neon.tech HTTP gateway which fails locally.
// @neondatabase/serverless connects to the standard pooler endpoint directly.
import { neon } from '@neondatabase/serverless';

const _neon = neon(process.env.DATABASE_URL ?? process.env.POSTGRES_URL!);

export async function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  const rows = await _neon(strings, ...values);
  return { rows };
}
