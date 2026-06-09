# 01 — Project Overview

## Cíl

Vytvořit veřejně dostupný web, kde každý ze tří úkolů žije na samostatné,
navzájem prolinkované stránce. Web demonstruje přístup k AI-asistovanému vývoji:
práci s reálnou datovou vrstvou, tvorbu SEO obsahu a napojení LLM na vlastní data.

## Rozsah (3 úkoly)

1. **Dashboard výkonu** — přehled metrik klienta (Návštěvy, Náklady, Konverze,
   Hodnota konverze, PNO) s historií a rychlou orientací. Data čtena z Postgres.
2. **Článek pro mionelo.cz** — publikovatelný článek se správnou webovou
   strukturou a interními odkazy (v rámci článku i na ostatní stránky webu).
3. **AI Marketingový analytik** — chatový nástroj, který nad daty klienta
   identifikuje problémy (pokles návštěv, růst PNO) a navrhuje konkrétní kroky.

## Mimo rozsah (vědomě)

- Autentizace uživatelů / více klientů (demo má jednoho klienta).
- Reálné napojení na Google Ads / GA4 (data jsou realistická, ale syntetická).
- CMS pro články (článek je statický MDX/komponenta).

## Fáze projektu

### Fáze 0 — Setup (0,5 dne)
- Inicializace Next.js (App Router, TypeScript), Tailwind v4, ESLint/Prettier.
- Vytvoření Vercel projektu + Vercel Postgres databáze.
- `.env.example`, základní layout, navigace mezi 3 stránkami.

### Fáze 1 — Datová vrstva (1 den)
- Návrh schématu (`clients`, `metrics_daily`) — viz `docs/05-database.md`.
- Migrace + seed skript s konzistentním 90denním trendem.
- Dotazovací funkce (agregace KPI, časové řady, breakdown podle kanálu).

### Fáze 2 — Dashboard (1 den)
- KPI karty s trendem a sparkline, hlavní grafy, tabulka zdrojů.
- Přepínač časového období (7/30/90 dní, rok), server-side fetch.
- AI insight karta s prolinkem na analytika.

### Fáze 3 — Článek + SEO (1 den)
- Obsah článku ve stylu mionelo blogu, struktura H1–H3, interní odkazy.
- Metadata API, JSON-LD `BlogPosting`, breadcrumbs, OG tagy.
- `sitemap.ts`, `robots.ts`, optimalizace obrázků.

### Fáze 4 — AI analytik (1–1,5 dne)
- API route → Gemini, injektování agregovaných dat do kontextu.
- Chatové UI, rychlé otázky, render doporučení.
- (Volitelně) function calling pro dotazování dat modelem.

### Fáze 5 — Tvrzení, testy, deploy (0,5–1 den)
- Lighthouse / Core Web Vitals, základní testy, bezpečnostní review.
- Produkční deploy na Vercel, README s postupem spuštění.

## Definition of Done

- [ ] Tři stránky veřejně dostupné a prolinkované.
- [ ] Dashboard čte data z Postgres a zobrazuje historii.
- [ ] Článek má korektní strukturu, metadata a interní odkazy.
- [ ] AI analytik vrací relevantní odpovědi nad reálnými daty.
- [ ] Lighthouse SEO ≥ 95, žádné chyby v konzoli.
- [ ] README umožní spuštění z čistého repa.
