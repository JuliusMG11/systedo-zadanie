// src/lib/db.ts
// @vercel/postgres uses api.*.neon.tech HTTP gateway which fails locally.
// @neondatabase/serverless connects to the standard pooler endpoint directly.
import { neon } from '@neondatabase/serverless';

export async function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  const db = neon(process.env.DATABASE_URL ?? process.env.POSTGRES_URL!);
  const rows = await db(strings, ...values);
  return { rows };
}
