# Mionelo Marketing Suite

Demo web vytvořený jako úkol pro pozici **AI Vibecoder**. Tři propojené stránky,
které ukazují práci s daty, obsahem a AI nad ukázkovým klientem **mionelo.cz**
(e-shop s ořechy, semínky, sušeným ovocem a superpotravinami).

| Stránka | Cesta | Úkol |
|---|---|---|
| Přehled výkonu (dashboard) | `/dashboard` | Úkol 1 — metriky klienta z Postgres |
| Článek pro mionelo.cz | `/clanek/[slug]` | Úkol 2 — SEO článek s interními odkazy |
| AI Marketingový analytik | `/ai-analytik` | Úkol 3 — AI agent nad daty (Gemini) |

## Stack (krátce)

- **Next.js (App Router)** — SSR/SSG kvůli technickému SEO, nativní nasazení na Vercel.
- **Tailwind CSS v4** — design tokeny z design manuálu; SCSS Modules jen výjimečně.
- **Vercel Postgres (Neon)** — ukázková výkonová data klienta.
- **Gemini API** — AI analytik volaný server-side (API route).
- **Vercel** — hosting, DB, env proměnné, CI/CD z Gitu.

Zdůvodnění volby je v [`docs/03-frontend.md`](docs/03-frontend.md).

## Rychlý start

```bash
git clone <repo-url> && cd mionelo-marketing-suite
cp .env.example .env.local      # doplň POSTGRES_* a GEMINI_API_KEY
npm install
npm run db:migrate              # vytvoří tabulky
npm run db:seed                 # naplní ukázková data (90 dní)
npm run dev                     # http://localhost:3000
```

## Dokumentace

| # | Dokument | Obsah |
|---|---|---|
| 01 | [Project overview](docs/01-project-overview.md) | Cíle, rozsah, fáze projektu |
| 02 | [Architecture](docs/02-architecture.md) | Struktura repa, tok dat |
| 03 | [Frontend](docs/03-frontend.md) | Next.js, Tailwind vs. SCSS, komponenty |
| 04 | [Design manual](docs/04-design-manual.md) | Barvy, typografie, tokeny, komponenty |
| 05 | [Database](docs/05-database.md) | Schéma, vztahy, dotazy |
| 06 | [Migrations & seed](docs/06-migrations-seed.md) | DDL + generování ukázkových dat |
| 07 | [AI agent](docs/07-ai-agent.md) | Integrace Gemini, prompt, function calling |
| 08 | [SEO](docs/08-seo.md) | Metadata, sitemap, JSON-LD, Core Web Vitals |
| 09 | [Deployment](docs/09-deployment.md) | Vercel + Postgres, env, CI/CD |
| 10 | [Testing](docs/10-testing.md) | Unit, integrace, E2E, Lighthouse |
| 11 | [Security](docs/11-security.md) | Klíče, validace, hlavičky, rate limiting |
| 12 | [Environment](docs/12-environment.md) | Přehled env proměnných |

## Licence

Demo projekt pro účely výběrového řízení.
