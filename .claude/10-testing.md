# 10 — Testing

Rozsah testů je úměrný demo projektu: pokrýt **logiku, kde se dá rozbít číslo**,
a **kritické cesty uživatele**, ne 100% coverage.

## Pyramida

```
        E2E (Playwright)        ← málo, kritické toky
      Integrace (route, DB)     ← API + dotazy
    Unit (výpočty, formátování) ← nejvíc, nejlevnější
```

## 1. Unit testy (Vitest)

Cíl: čistá logika bez I/O.

- **Výpočty metrik:** PNO, konverzní poměr, % změna vůči předchozímu období,
  ošetření dělení nulou (`conversion_value = 0`).
- **Formátování:** `Intl` měna/čísla/procenta pro `cs-CZ`.
- **Sémantika trendu:** že u PNO/Nákladů je růst „negativní" a obarví se červeně.

```ts
import { describe, it, expect } from 'vitest';
import { calcPno, pctChange } from '@/lib/utils';

describe('calcPno', () => {
  it('vrací PNO v procentech', () => {
    expect(calcPno(2500, 10000)).toBeCloseTo(25);
  });
  it('ošetří nulový obrat', () => {
    expect(calcPno(2500, 0)).toBe(0);
  });
});
```

## 2. Integrační testy

- **Dotazy nad DB:** proti testovací Postgres (lokální kontejner nebo Neon
  branch) — naseeduj malý vzorek, ověř agregace a rozsahy období.
- **API route `/api/analyst`:** mock Gemini klienta; ověř validaci vstupu
  (prázdný dotaz, >500 znaků → 400) a tvar odpovědi.

## 3. E2E (Playwright)

Kritické toky:
- Načtení `/dashboard` → vidím 5 KPI karet s čísly.
- Přepínač období → čísla se změní.
- Z dashboardu klik na „Zeptat se AI analytika" → jsem na `/ai-analytik`.
- V chatu kliknu rychlou otázku → přijde odpověď (mock route).
- Navigace mezi všemi třemi stránkami funguje (požadavek zadání na prolinkování).

```ts
test('dashboard zobrazí KPI a proklik na analytika', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByText('Návštěvy')).toBeVisible();
  await page.getByRole('link', { name: /AI analytik/i }).click();
  await expect(page).toHaveURL(/ai-analytik/);
});
```

## 4. Kvalita & SEO

- **Lighthouse CI** (nebo ruční) na produkční/preview URL: Performance, SEO,
  Accessibility, Best Practices. Cíl SEO ≥ 95.
- **Rich Results Test** na JSON-LD článku.
- **Žádné chyby v konzoli** na žádné ze stránek.

## 5. CI

GitHub Actions: na PR spustit `lint` + `typecheck` + `vitest`. Playwright
volitelně proti preview deployi (Vercel preview URL z PR).

## Co netestovat (vědomě)

- Vzhled grafů pixel-by-pixel.
- Přesné formulace AI odpovědí (jsou nedeterministické) — testuj jen, že
  endpoint vrátí neprázdný text a respektuje validaci.
