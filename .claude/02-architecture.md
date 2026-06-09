# 02 — Architecture

## Vysokoúrovňový pohled

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel (Edge/Node)                     │
│                                                               │
│   Next.js App Router                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│   │  /dashboard  │  │ /clanek/[..]  │  │   /ai-analytik    │  │
│   │  (RSC, SSR)  │  │  (SSG/ISR)    │  │  (client + API)   │  │
│   └──────┬───────┘  └──────────────┘  └─────────┬────────┘  │
│          │ server query                          │ POST       │
│          ▼                                        ▼            │
│   ┌─────────────────────┐              ┌────────────────────┐ │
│   │  lib/queries.ts     │              │ /api/analyst route │ │
│   │  (@vercel/postgres) │◄─────────────│ agregace + prompt  │ │
│   └──────────┬──────────┘              └─────────┬──────────┘ │
└──────────────┼───────────────────────────────────┼───────────┘
               ▼                                     ▼
      ┌──────────────────┐                  ┌─────────────────┐
      │ Vercel Postgres  │                  │   Gemini API    │
      │     (Neon)       │                  │  (server-side)  │
      └──────────────────┘                  └─────────────────┘
```

## Klíčová rozhodnutí

- **Server Components jako default.** Data se načítají na serveru, klient
  dostává hotové HTML → lepší SEO a rychlejší první vykreslení.
- **AI volání pouze server-side.** `GEMINI_API_KEY` nikdy neopouští server.
  Klient mluví jen s vlastní `/api/analyst` route.
- **Jediný zdroj pravdy pro dotazy.** Všechny SQL dotazy žijí v `lib/queries.ts`,
  takže je sdílí dashboard i AI analytik (konzistence čísel).

## Struktura repozitáře

```
mionelo-marketing-suite/
├── app/
│   ├── layout.tsx              # root layout, navigace, <html lang="cs">
│   ├── page.tsx                # rozcestník
│   ├── globals.css             # Tailwind v4 + @theme tokeny
│   ├── sitemap.ts              # generovaný sitemap.xml
│   ├── robots.ts               # generovaný robots.txt
│   ├── dashboard/
│   │   └── page.tsx            # úkol 1 (RSC)
│   ├── clanek/
│   │   └── [slug]/page.tsx     # úkol 2 (SSG) + generateMetadata
│   ├── ai-analytik/
│   │   └── page.tsx            # úkol 3 (client component chat)
│   └── api/
│       └── analyst/route.ts    # POST → Gemini
├── components/
│   ├── nav/                    # Navbar, Breadcrumbs
│   ├── dashboard/              # KpiCard, TimeSeriesChart, PnoChart, SourcesTable
│   ├── article/               # Toc, TipBox, RelatedCards
│   └── ai/                     # ChatWindow, MessageBubble, QuickQuestions
├── lib/
│   ├── db.ts                   # připojení (@vercel/postgres)
│   ├── queries.ts              # agregace KPI, časové řady, breakdown
│   ├── ai/
│   │   ├── client.ts           # Gemini klient
│   │   ├── prompt.ts           # system prompt + serializace dat
│   │   └── tools.ts            # (volitelně) function calling
│   └── utils.ts                # formátování čísel/měny/%
├── scripts/
│   ├── migrate.ts              # spuštění migrací
│   └── seed.ts                 # generování ukázkových dat
├── migrations/
│   └── 0001_init.sql
├── content/
│   └── clanky/                 # MDX/data článků
├── docs/                       # tato dokumentace
└── tests/
```

## Tok dat — dashboard

1. RSC `app/dashboard/page.tsx` zavolá `getKpiSummary(range)` a `getTimeSeries(range)`.
2. `lib/queries.ts` spustí parametrizované SQL nad `metrics_daily`.
3. Komponenty (`KpiCard`, grafy) dostanou data jako props a renderují se na serveru.

## Tok dat — AI analytik

1. Klient pošle dotaz na `POST /api/analyst`.
2. Route si načte agregovaný snapshot dat (`getAnalystContext()`).
3. Snapshot + dotaz se vloží do promptu, zavolá se Gemini.
4. Odpověď (text + případná doporučení) se vrátí klientovi a vykreslí.
