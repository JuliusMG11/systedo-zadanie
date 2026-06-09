# 11 — Security

Demo projekt, ale ukázat bezpečnostní hygienu se hodí — zvlášť kolem AI a DB.

## 1. Tajné klíče

- `GEMINI_API_KEY` a `POSTGRES_*` **jen na serveru**, nikdy s prefixem
  `NEXT_PUBLIC_`. Volání Gemini probíhá výhradně v Route Handleru.
- Žádné klíče v repu. `.env*` v `.gitignore`, do repa jen `.env.example`.
- Klíče spravovat ve Vercel Environment Variables, ne v kódu.

## 2. Vstupy & SQL injection

- Všechny dotazy parametrizované přes `@vercel/postgres` (`sql\`… ${param} …\``)
  — žádná konkatenace uživatelského vstupu do SQL.
- Vstup do AI route validovat: typ `string`, max délka (např. 500 znaků),
  ořezat whitespace; jinak `400`.
- Rozsahy období (`range`) brát z whitelistu (`7|30|90|year`), ne libovolně.

## 3. Prompt injection (AI)

- System prompt drží model „jen v datech" a v roli analytika.
- Uživatelský dotaz je **data**, ne instrukce — nikdy z něj neodvozovat akce
  (žádné mazání dat, žádné externí volání řízené textem od uživatele).
- Snapshot dat se serializuje serverem; uživatel neovlivní, jaká data se pošlou.

## 4. Rate limiting & zneužití

- Limit na `/api/analyst` (např. 10 req/min/IP) — chrání náklady na Gemini.
  Lze přes Vercel KV / Upstash Ratelimit, nebo jednoduchý in-memory limit
  pro demo (s vědomím, že je per-instance).
- Limit délky dotazu = ochrana proti token-flood.

## 5. HTTP hlavičky

V `next.config.js` nastavit bezpečnostní hlavičky:

```js
headers: async () => [{
  source: '/(.*)',
  headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ],
}]
```

- CSP zvážit (přísnější) — pozor na inline JSON-LD a Recharts; nasadit `report-only`
  a doladit, ať nic nerozbije.
- HTTPS řeší Vercel automaticky.

## 6. Data & soukromí

- Data jsou syntetická (žádné osobní údaje) → nízké riziko.
- AI route neloguje plné dotazy s citlivým obsahem (zde irelevantní, ale princip).
- DB přístup jen ze serverových funkcí, ne z klienta.

## 7. Závislosti

- `npm audit` v CI; držet Next.js a `@google/generative-ai` aktuální.
- Minimum balíčků — menší attack surface.

## Checklist

- [ ] Žádný tajný klíč v repu ani v `NEXT_PUBLIC_*`.
- [ ] Parametrizované SQL všude.
- [ ] Validace + rate limit na AI route.
- [ ] Bezpečnostní hlavičky nasazené.
- [ ] `npm audit` bez high/critical.
