# 09 — Deployment (Vercel + Postgres)

## Předpoklady

- Účet na Vercelu, repozitář na GitHubu.
- Klíč k Gemini API.

## Postup nasazení

### 1. Import projektu
- Vercel → **Add New → Project** → vyber GitHub repo.
- Framework preset se detekuje jako **Next.js** (žádná extra konfigurace).

### 2. Vytvoření databáze
- Ve Vercel dashboardu: **Storage → Create Database → Postgres** (Neon).
- Propoj databázi s projektem → Vercel automaticky nastaví env proměnné
  `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` atd.

### 3. Environment proměnné
V **Project → Settings → Environment Variables** přidej:

| Klíč | Prostředí | Zdroj |
|---|---|---|
| `GEMINI_API_KEY` | Production, Preview | ručně |
| `NEXT_PUBLIC_SITE_URL` | All | `https://<domena>` |
| `POSTGRES_*` | All | automaticky z propojené DB |

`GEMINI_API_KEY` **bez** prefixu `NEXT_PUBLIC_` → zůstane jen na serveru.

### 4. Migrace + seed
Lokálně proti produkční DB (jednorázově) nebo přes Vercel CLI:

```bash
vercel env pull .env.local      # stáhne POSTGRES_* lokálně
npm run db:migrate
npm run db:seed
```

> Alternativně dočasná chráněná route `/api/admin/seed` (smazat po nasazení).
> Doporučení: spusť z lokálu, nenech seed v produkční code-path.

### 5. Deploy
- Push do `main` → Vercel automaticky buildí a nasazuje.
- Každý PR dostane **Preview deployment** (vlastní URL) — ideální na review.

## CI/CD model

- `main` → Production.
- ostatní větve / PR → Preview.
- Build běží `next build`; chyby TS/ESLint shodí build (žádaný stav).

## Po nasazení — checklist

- [ ] Tři stránky veřejně dostupné a prolinkované.
- [ ] Dashboard zobrazuje data (DB naplněna).
- [ ] AI analytik odpovídá (Gemini klíč funguje).
- [ ] `/sitemap.xml` a `/robots.txt` dostupné.
- [ ] `NEXT_PUBLIC_SITE_URL` ukazuje na produkční doménu (kvůli OG/canonical).
- [ ] Lighthouse na produkci v pořádku.

## README requirement (ze zadání)

Repo musí jít spustit podle README i bez nasazení — viz kořenový `README.md`
sekce „Rychlý start". Pokud nebude veřejná URL, recenzent spustí lokálně:
`migrate → seed → dev`.

## Poznámka k regionu

Vercel Postgres (Neon) zvol v regionu blízko funkcí (EU, např. Frankfurt),
ať je latence DB ↔ serverless funkce nízká.
