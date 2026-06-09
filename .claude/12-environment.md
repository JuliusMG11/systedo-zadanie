# 12 — Environment

Přehled proměnných prostředí. V repu je `.env.example` (bez hodnot),
reálné hodnoty žijí v `.env.local` (lokálně) a ve Vercel Settings (produkce).

## `.env.example`

```bash
# --- Databáze (Vercel Postgres / Neon) ---
# Automaticky injektované Vercelem po propojení DB s projektem.
# Lokálně získáš přes `vercel env pull .env.local`.
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_PRISMA_URL=

# --- AI ---
# Server-side klíč k Gemini API. BEZ prefixu NEXT_PUBLIC_!
GEMINI_API_KEY=

# --- Web ---
# Použito pro canonical/OG URL a sitemap. Bez koncového lomítka.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Tabulka

| Proměnná | Veřejná? | Kde se nastaví | Účel |
|---|---|---|---|
| `POSTGRES_URL` | ne | Vercel (auto) | připojení k DB (pooled) |
| `POSTGRES_URL_NON_POOLING` | ne | Vercel (auto) | migrace/seed |
| `GEMINI_API_KEY` | ne | ručně | volání Gemini z API route |
| `NEXT_PUBLIC_SITE_URL` | ano | ručně | absolutní URL pro SEO/OG |

## Pravidla

- Pouze `NEXT_PUBLIC_*` proměnné se dostanou do klientského bundlu — vše ostatní
  zůstává na serveru.
- Lokálně: `cp .env.example .env.local` a doplnit hodnoty.
- Po propojení Postgres na Vercelu stáhnout DB proměnné `vercel env pull`.
- Nikdy necommitovat `.env.local`.
