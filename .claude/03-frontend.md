# 03 — Frontend

## Volba frameworku: proč Next.js (App Router)

| Požadavek | Jak ho Next.js řeší |
|---|---|
| Technické SEO | SSR/SSG → crawler dostane plné HTML, ne prázdný SPA shell |
| Metadata pro každou stránku | nativní Metadata API + `generateMetadata()` |
| `sitemap.xml`, `robots.txt` | generované přes `app/sitemap.ts`, `app/robots.ts` |
| Rychlost (Core Web Vitals) | RSC, streaming, `next/image`, automatický code-splitting |
| Bezpečné AI volání | Route Handlers / Server Actions drží klíče na serveru |
| Nasazení | nulová konfigurace na Vercelu + nativní Vercel Postgres |

Alternativy zvážené: **Astro** (skvělé pro statický obsah, ale interaktivní
dashboard a chat by stejně potřebovaly „islands" a serverovou vrstvu),
**čisté HTML/CSS/JS** (rychlé pro článek, ale ručně řešené SEO, žádný typový
model dat, slabé DX u dashboardu). Next.js pokrývá všechny tři úkoly jedním
nástrojem bez kompromisu v SEO.

## Styling: Tailwind primárně, SCSS jen výjimečně

Zadání zmiňuje SCSS i Tailwind — doporučená kombinace **není mít obojí naplno**,
to zbytečně duplikuje systém tokenů. Volba:

- **Tailwind CSS v4 jako hlavní engine.** Design tokeny (barvy, rádiusy,
  typografie z design manuálu) definujeme jednou v `@theme` v `globals.css`.
  Utility třídy = rychlý, konzistentní vývoj přesně podle design manuálu.
- **SCSS Modules (`*.module.scss`) jen tam, kde Tailwind drhne** — komplexní
  keyframe animace, generované gradient masky grafů, pseudo-prvky. Drží se to
  u konkrétní komponenty a nemíchá se to do globálního stylu.

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-cream: #FAF6EF;
  --color-espresso: #2E241D;
  --color-walnut: #C2703D;
  --color-leaf: #5B8A5A;
  --radius-card: 16px;
  --font-heading: "Fraunces", serif;
  --font-body: "Inter", sans-serif;
}
```

## Komponenty (mapováno na design)

**Sdílené**
- `Navbar` — sticky, logo vlevo, odkazy Dashboard / Článek / AI Analytik.
- `Breadcrumbs` — drobečková navigace (důležité i pro SEO článku).
- `Button` (pill), `Card`, `Badge` (trend ↑/↓), `Tag`.

**Dashboard**
- `KpiCard` — velké číslo, popisek, trend badge, mini sparkline.
- `TimeSeriesChart` — návštěvy + konverze (dual axis).
- `CostValueChart` — náklady vs. hodnota konverze.
- `PnoChart` — vývoj PNO s referenční linií cíle.
- `SourcesTable` — top zdroje / měsíční přehled.
- `AiInsightCard` — generovaný insight + CTA na analytika.

**Článek**
- `ArticleHero`, `Toc` (obsah), `TipBox`, `RelatedCards`, `ProductCta`.

**AI analytik**
- `ChatWindow`, `MessageBubble` (user vs. AI), `QuickQuestions` (chips),
  `RecommendationList`, `ClientStatusCard` (semafor).

## Knihovny

- **Grafy:** Recharts (deklarativní, dobře se renderuje s RSC daty jako props).
- **Ikony:** lucide-react.
- **Fonty:** `next/font` (Fraunces + Inter) — bez layout shiftu, self-hosted.
- **Formátování:** `Intl.NumberFormat('cs-CZ', …)` pro měnu/čísla/procenta.

## Responsivita

Mobile-first. Breakpointy Tailwindu (`sm`/`md`/`lg`). KPI karty: 1 sloupec
na mobilu → 2–3 na tabletu → 5 na desktopu. Grafy s `ResponsiveContainer`.
Chat na celou výšku viewportu se „sticky" inputem dole.

## Accessibility

- Sémantické HTML (`<main>`, `<nav>`, `<article>`, `<table>`).
- Kontrast textu min. WCAG AA (espresso na cream prochází).
- Focus-visible stavy, `aria-label` u ikonových tlačítek.
- Grafy mají textovou alternativu (tabulka dat / `aria` popis).
