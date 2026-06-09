# 07 — AI Agent (Gemini)

Úkol 3: **AI Marketingový analytik** — chat nad daty klienta, který umí
diagnostikovat problémy (pokles návštěv, růst PNO) a navrhnout konkrétní kroky.

## Princip

Klient nikdy nemluví s Gemini přímo. Tok je:

```
klient (chat) ──POST──► /api/analyst ──► getAnalystContext() ──► Postgres
                                  │
                                  └──► Gemini (server-side, s daty v promptu)
                                  ◄──── text + doporučení
```

Klíč `GEMINI_API_KEY` zůstává na serveru. Klient dostává jen výslednou odpověď.

## Dvě varianty napojení na data

### A) Snapshot v kontextu (doporučeno pro demo)

Před voláním modelu si server načte **agregovaný snapshot** (KPI za 7/30/90 dní,
trendy, breakdown kanálů, PNO vs. cíl) a vloží ho do promptu jako JSON. Model
nepotřebuje DB znát — má všechna potřebná čísla. Spolehlivé, levné, rychlé.

### B) Function calling (volitelné „wow")

Modelu předáš nástroje (`get_kpi`, `get_timeseries`, `get_sources`), které sám
volá podle dotazu. Působivější, ale složitější (orchestrace tool callů, víc
round-tripů). Implementuj jen pokud zbyde čas — A) je plnohodnotné řešení.

## System prompt (`lib/ai/prompt.ts`)

```ts
export const SYSTEM_PROMPT = `
Jsi seniorní výkonnostní marketér. Analyzuješ data e-shopu mionelo.cz
(ořechy, semínka, sušené ovoce). Odpovídej česky, věcně a stručně.

Pravidla:
- Vycházej VÝHRADNĚ z dodaných dat. Nic si nevymýšlej.
- Když identifikuješ problém, podlož ho čísly (uveď % změnu a období).
- Vždy zakonči 2–4 konkrétními, akčními doporučeními.
- PNO nad cílovou hodnotou = problém; vysvětli příčinu (náklady vs. obrat).
- Pokud data na otázku nestačí, řekni to.
`;

export function buildUserPrompt(question: string, snapshot: unknown) {
  return `DATA KLIENTA (JSON):\n${JSON.stringify(snapshot, null, 2)}\n\n` +
         `DOTAZ: ${question}`;
}
```

## Route handler (`app/api/analyst/route.ts`)

```ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAnalystContext } from '@/lib/queries';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/ai/prompt';

export const runtime = 'nodejs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  if (typeof question !== 'string' || question.length > 500) {
    return NextResponse.json({ error: 'Neplatný dotaz' }, { status: 400 });
  }

  const snapshot = await getAnalystContext(1);   // client_id = 1 (mionelo)

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent(buildUserPrompt(question, snapshot));
  return NextResponse.json({ answer: result.response.text() });
}
```

> Model `gemini-1.5-flash` je rychlý a levný a pro tuto analýzu dostačuje.
> Pro náročnější uvažování lze přepnout na `gemini-1.5-pro`. Ověř aktuální
> dostupné modely v dokumentaci Gemini API před nasazením.

## Snapshot pro AI (`getAnalystContext`)

Vrací kompaktní objekt, ze kterého model snadno čte:

```ts
{
  client: { name, domain, target_pno },
  periods: {
    last7:  { visits, cost, conversions, conversion_value, pno },
    last30: { ... , delta_vs_prev: { visits_pct, pno_pct, ... } },
    last90: { ... }
  },
  by_channel_30d: [ { channel, visits, cost, conversions, pno }, ... ],
  trend_30d: [ { date, visits, conversions, pno }, ... ]   // zředěno např. po 3 dnech
}
```

Drž snapshot malý (agregace, ne všech 540 řádků) → nižší cena tokenů i latence.

## UI chování

- **Rychlé otázky (chips):** „Proč klesají návštěvy?", „Jak snížit PNO?",
  „Shrň výkon za poslední měsíc", „Co zlepšit?".
- Stav „přemýšlí" (skeleton bubliny), pak vykreslení odpovědi.
- Odpověď může obsahovat číslovaný `RecommendationList`.
- **Auto-insight na dashboardu:** stejná route s předdefinovaným dotazem
  „Shrň hlavní problém jednou větou" → text do `AiInsightCard`.

## Náklady & limity

- Cachuj snapshot (revalidace např. á 1 h) — data se v demu nemění často.
- Rate limit na route (viz `docs/11-security.md`), limit délky dotazu (500 zn.).
- Ošetři chybu Gemini (timeout / quota) → vlídná hláška, ne 500 bez kontextu.
