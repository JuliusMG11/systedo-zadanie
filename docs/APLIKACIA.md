# Apex Marketing Suite — Dokumentácia aplikácie

Apex Marketing Suite je webová aplikácia postavená na Next.js 16, určená pre marketingové tímy e-commerce klientov. Umožňuje sledovať výkon kampaní, publikovať obsah a získavať okamžité odpovede od AI analytika — všetko na jednom mieste.

Aplikácia aktuálne spravuje troch klientov: **mionelo.cz**, **getryze.app** a **gostreak.app**.

---

## 1. Dashboard výkonu

**URL:** `/dashboard`

Dashboard poskytuje kompletný prehľad marketingových metrík zvoleného klienta za vybrané časové obdobie.

### Čo nájdete na dashboarde

- **5 KPI kariet** — Návštevy, Náklady, Konverzie, Hodnota konverzií a PNO (Podiel nákladov na obrate). Každá karta zobrazuje aktuálnu hodnotu, percentuálny trend oproti predchádzajúcemu obdobiu a sparkline graf.
- **Graf vývoja v čase** — Čiarový graf návštevnosti a hodnoty konverzií po dňoch.
- **Graf nákladov vs. hodnoty** — Stĺpcový graf porovnávajúci vynaložené náklady s dosiahnutou hodnotou konverzií.
- **Graf PNO** — Čiarový graf podielu nákladov s referenčnou líniou cieľového PNO klienta.
- **Tabuľka zdrojov** — Rozpad výkonu podľa marketingových kanálov (Google Ads, Meta, SEO, Email, Direct) vrátane farebného indikátora plnenia PNO.
- **AI insight** — Automaticky generovaný komentár od Gemini AI zhrňujúci hlavný marketingový problém klienta.

### Prepínače

| Prepínač | Popis |
|---|---|
| Klient | Prepína medzi mionelo.cz, getryze.app a gostreak.app |
| Časové obdobie | 7 dní / 30 dní / 90 dní / 365 dní |

Oba prepínače používajú `useTransition()` — počas načítavania dát sa zobrazí animovaný spinner priamo v tlačidle, bez zaseknutia UI.

### Technológie

- Next.js 16 App Router, React Server Components
- PostgreSQL (Neon) — tabuľky `clients` a `metrics_daily`
- Recharts — interaktívne grafy
- Gemini 2.5 Flash — generovanie AI insightov

---

## 2. Článok pre mionelo.cz

**URL:** `/article/oriesky-seminka`

Plnohodnotná blogová stránka s článkom optimalizovaným pre SEO, určeným pre zákazníkov e-shopu mionelo.cz. Článok pojednáva o zdravotných benefitoch orechov a semienok.

### Štruktúra stránky

- **Breadcrumb navigácia** — Domov → Inšpirácia → Článok
- **Hero sekcia** — Nadpis, perex, byline s menom autora a dátumom publikácie, odhadovaný čas čítania
- **Hero fotografia** — Produktová fotografia zmesi orechov a semienok z mionelo.cz
- **Dvojstĺpcový layout** — Ľavý stĺpec: obsah článku (TOC), pravý stĺpec: samotný text
- **Obsah článku (TOC)** — Na desktope sticky sidebar, na mobile horizontálne čipy. Obsahuje kotvy na všetky sekcie.
- **Prose obsah** — Štrukturovaný text s nadpismi H2/H3, odstavce, zoznamy, pull quote, tip box
- **Produktové fotografie** — Dve ilustračné fotografie z CDN mionelo.cz (macadamia orechy a ľanové semienka) s popiskami a odkazmi na kategórie
- **CTA box** — Výzva na otvorenie dashboardu a AI analytika
- **Súvisiace články** — Sekcia s ďalšími odporúčanými článkami

### Interné odkazy

Článok obsahuje kontextové odkazy na:
- [mionelo.cz/orechy](https://www.mionelo.cz/orechy) — kategória orechov
- [mionelo.cz/seminka](https://www.mionelo.cz/seminka) — kategória semienok
- [mionelo.cz/masla-a-kremy](https://www.mionelo.cz/masla-a-kremy) — mandľové maslo

### SEO

- `generateMetadata` — dynamický title, description, keywords, canonical URL
- Open Graph tagy vrátane obrázka, `publishedTime`, `modifiedTime`, sekcie a tagov
- Twitter Card
- **JSON-LD štruktúrované dáta** — `BlogPosting` + `BreadcrumbList` (Schema.org)
- Publisher a autor: `Apex` / `apex.com`

### Technológie

- Next.js 16 App Router, staticky generovaná stránka (`generateStaticParams`)
- Next.js `Image` — optimalizácia obrázkov (WebP, `fill`, `priority`)
- Tailwind CSS v4 — vlastný dizajnový systém (Space Grotesk + Hanken Grotesk)

---

## 3. AI Analytik

**URL:** `/ai-analytik`

Konverzačné rozhranie poháňané umelou inteligenciou, kde môžete klásť otázky o marketingových dátach klienta a dostávať okamžité, kontextové odpovede.

### Ako to funguje

1. Používateľ napíše otázku do textového poľa (napr. *„Prečo rastú náklady?"*)
2. Otázka sa odošle na API endpoint `/api/analyst`
3. Server načíta aktuálny snapshot metrík z databázy (Neon)
4. Snapshot sa spolu s otázkou odošle do Gemini 2.5 Flash API
5. AI odpoveď sa zobrazí v chat rozhraní

### Rozhranie

- **Ľavý panel** — Stavová karta analytika (indikátor online/offline), 4 metrické dlaždice (PNO, Konverzie, Návštevy, Náklady), rýchle otázky (chips)
- **Pravý panel** — Chat s bublinami správ, typing indikátor (3 bodky), textové pole s tlačidlom Odoslať
- Správy používateľa: terra/hnedé bubliny (vpravo)
- Odpovede AI: biele bubliny s tieňom (vľavo)

### API endpoint

`POST /api/analyst`

| Parameter | Typ | Popis |
|---|---|---|
| `question` | `string` | Otázka od používateľa (max 500 znakov) |

**Odpoveď:**
```json
{ "answer": "Text odpovede od AI analytika." }
```

### Bezpečnosť

- Validácia vstupnej dĺžky (max 500 znakov)
- API kľúč Gemini uložený ako environment variable (`GEMINI_API_KEY`)
- Runtime: `nodejs` (nie Edge)

### Technológie

- Gemini 2.5 Flash (`@google/generative-ai`)
- Next.js Route Handler (`app/api/analyst/route.ts`)
- React `useState` + `fetch` na strane klienta

---

## Spustenie lokálne

```bash
# Inštalácia závislostí
npm install

# Spustenie dev servera
npm run dev
```

Aplikácia beží na [http://localhost:3000](http://localhost:3000).

### Požadované environment variables (`.env.local`)

| Premenná | Popis |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `GEMINI_API_KEY` | API kľúč pre Google Gemini |
| `NEXT_PUBLIC_SITE_URL` | Verejná URL aplikácie (pre SEO metadata) |

---

## Prečo Next.js?

Pri výbere frameworku sme zvažovali tri hlavné možnosti: **Next.js**, Remix a čistý React (Vite SPA). Rozhodli sme sa pre Next.js z nasledujúcich dôvodov:

### 1. React Server Components — rýchlosť bez kompromisov

Dashboardová stránka načítava dáta z PostgreSQL na serveri a posiela klientovi hotový HTML. Prehliadač nezobrazuje loading spinner — dáta sú prítomné okamžite. Zároveň sme využili **Suspense streaming**: AI insight sa generuje asynchrónne (Gemini API môže trvať 2–4 sekundy), zatiaľ čo zvyšok stránky — KPI karty, grafy, tabuľka — sa renderia okamžite. Toto je architektúra, ktorú čistý SPA neumožňuje.

### 2. App Router — súborový routing bez konfigurácie

Každý priečinok je route. `/dashboard`, `/ai-analytik`, `/article/[slug]` vznikli vytvorením súboru `page.tsx`. Žiadny router config, žiadne switch/case. Pre aplikáciu s viacerými stránkami a dynamickými segmentami (slug článku) je to zásadná úspora času.

### 3. Unified stack — frontend aj backend v jednom repozitári

API endpoint `/api/analyst` (komunikácia s Gemini) beží priamo v Next.js ako Route Handler. Databázové queries, AI logika aj UI sú v jednom projekte, jednom type systéme (TypeScript), jednom deploymente. Alternatíva — separátny Express/FastAPI backend — by pridala ďalší repozitár, ďalšie CI/CD a latenciu navyše.

### 4. Vercel — natívne nasadenie bez DevOps

Next.js a Vercel sú od rovnakého tímu. `git push` → automatický build → preview URL → produkčný deploy. Edge caching pre statické stránky (článok), serverless pre API endpointy, environment variables v UI. Pre marketingový produkt, kde rýchlosť iterácie je kľúčová, je to rozhodujúca výhoda.

### 5. SEO out-of-the-box

Článok pre mionelo.cz vyžaduje SSG (staticky generovaná stránka), OpenGraph tagy, JSON-LD štruktúrované dáta a optimalizáciu obrázkov. V Next.js sú tieto funkcie vstavaté (`generateMetadata`, `generateStaticParams`, `next/image`). V čistom SPA by každá z týchto funkcií znamenala ďalšiu knižnicu.

### Zhrnutie rozhodnutia

| Kritérium | Next.js | Remix | React SPA |
|---|---|---|---|
| Server rendering | ✅ RSC + Streaming | ✅ | ❌ |
| SEO podpora | ✅ vstavaná | ✅ | ⚠️ knižnice |
| API backend | ✅ Route Handlers | ✅ | ❌ separátny server |
| Vercel deployment | ✅ natívny | ⚠️ | ⚠️ |
| Ekosystém / komunita | ✅ najväčší | ⚠️ menší | ✅ |
| Vhodnosť pre tento projekt | ✅✅ | ✅ | ❌ |

Next.js bol zvolený ako framework, ktorý pokrýva všetky požiadavky projektu — výkon, SEO, AI integráciu aj backend — bez zbytočnej komplexity.

---

## Technologický stack

| Technológia | Verzia | Účel |
|---|---|---|
| Next.js | 16 | App Router, SSR, SSG |
| React | 19 | UI komponenty |
| TypeScript | 5 | Typová bezpečnosť |
| Tailwind CSS | 4 | Štýlovanie |
| Neon (PostgreSQL) | — | Databáza |
| Recharts | 2 | Grafy |
| Gemini | 2.5 Flash | AI analytik |
| Vercel | — | Hosting a nasadenie |
