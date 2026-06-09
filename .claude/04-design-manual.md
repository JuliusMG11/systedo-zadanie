# 04 — Design Manual

Design systém vychází z charakteru klienta **mionelo.cz**: přírodní, vřelý,
prémiový — ale pro nástroj zároveň datově čistý a profesionální.

## Barvy

| Token | Hex | Použití |
|---|---|---|
| `cream` | `#FAF6EF` | hlavní pozadí |
| `espresso` | `#2E241D` | primární text, nadpisy |
| `walnut` | `#C2703D` | primární akcent, CTA, user bubliny |
| `leaf` | `#5B8A5A` | sekundární akcent, pozitivní trend |
| `clay-soft` | `#F0E4D6` | jemné oddělovače, hover karet |
| `white` | `#FFFFFF` | povrch karet |
| `positive` | `#3F8F5E` | trend ↑ (dobrý) |
| `negative` | `#C0413B` | trend ↓ (špatný) / vysoké PNO |
| `warning` | `#D98A3D` | hraniční stav / semafor oranžová |

> Pozor na sémantiku trendu: u **PNO a Nákladů** je růst negativní (červená),
> u **Návštěv, Konverzí, Hodnoty** je růst pozitivní (zelená). Barva trendu se
> řídí významem metriky, ne směrem šipky.

## Typografie

- **Nadpisy:** `Fraunces` (serif) — důvěryhodný, „food/editorial" charakter.
- **Text & UI:** `Inter` (sans-serif) — vysoká čitelnost, čísla v tabulkách.

| Styl | Velikost / line-height | Váha |
|---|---|---|
| H1 | 40–48px / 1.1 | 600 |
| H2 | 28–32px / 1.2 | 600 |
| H3 | 20–22px / 1.3 | 600 |
| Body | 16–18px / 1.6 | 400 |
| Small / popisky | 13–14px / 1.4 | 500 |
| KPI číslo | 32–40px / 1.0 | 600, tabular-nums |

Pro čísla v KPI a tabulkách použij `font-variant-numeric: tabular-nums`.

## Prostor & tvary

- Rádius karet: **16px**; tlačítka: **pill (9999px)**.
- Stíny: jemné, nízký kontrast — `0 1px 3px rgba(46,36,29,.08)`.
- Mřížka: 4px základ; mezery mezi sekcemi 32–48px.
- Max šířka obsahu článku ~720px; dashboard plná šířka s `padding` 24px.

## Komponentové vzory

**KPI karta**
```
┌─────────────────────────────┐
│ Návštěvy            ▁▂▃▅▃▂   │  ← sparkline vpravo nahoře
│ 12 480                      │  ← KPI číslo (tabular-nums)
│ ↓ 8,2 %  vs. předchozí      │  ← trend badge (zde červená)
└─────────────────────────────┘
```

**Trend badge** — pill, barva podle sémantiky metriky, šipka + procento.

**Stavový semafor (AI analytik)** — kruh `positive/warning/negative`
+ krátký popis stavu účtu (např. „Pozor: PNO nad cílem").

## Stavy & interakce

- Hover karty: jemné zvednutí + `clay-soft` okraj.
- Tlačítka: walnut → tmavší při hoveru, `focus-visible` outline `leaf`.
- Loading: skeleton bloky v barvě `clay-soft`.
- Prázdné stavy: vlídný text + ikona lístku.

## Tón obsahu

- Dashboard/AI: věcný, stručný, česky, „vykání" klientovi.
- Článek: vřelý, edukativní, v duchu mionelo blogu (zdraví, příroda, chuť).
