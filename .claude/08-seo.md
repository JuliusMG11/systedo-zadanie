# 08 — SEO Implementation

Technické SEO je hlavní důvod volby Next.js. Cílová stránka pro SEO je především
**článek** (úkol 2), ale principy platí pro celý web.

## 1. Server rendering

- Článek: **SSG** (`generateStaticParams`) → předrenderované HTML.
- Dashboard/AI: dynamické, ale stále SSR shell (ne prázdný SPA root).
- Žádný obsah „dořešený až JS na klientovi" pro indexovatelné stránky.

## 2. Metadata API

Globální default v `app/layout.tsx` + per-page `generateMetadata()`.

```ts
// app/clanek/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  const url = `https://<domena>/clanek/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.cover, width: 1200, height: 630 }],
      publishedTime: article.publishedAt,
    },
    twitter: { card: 'summary_large_image' },
  };
}
```

`app/layout.tsx`:
```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://<domena>'),
  title: { default: 'Mionelo Marketing Suite', template: '%s · Mionelo' },
  robots: { index: true, follow: true },
};
// <html lang="cs"> v layoutu!
```

## 3. Strukturovaná data (JSON-LD)

Pro článek schéma `BlogPosting`, navíc `BreadcrumbList`.

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: article.title,
  description: article.excerpt,
  image: article.cover,
  datePublished: article.publishedAt,
  author: { '@type': 'Organization', name: 'mionelo.cz' },
  publisher: { '@type': 'Organization', name: 'Fruits du Paradis s.r.o.' },
  mainEntityOfPage: url,
})}} />
```

## 4. sitemap.xml & robots.txt

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://<domena>';
  const articles = await getAllArticleSlugs();
  return [
    { url: base, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/dashboard`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/ai-analytik`, changeFrequency: 'monthly', priority: 0.6 },
    ...articles.map((s) => ({ url: `${base}/clanek/${s}`, priority: 0.7 })),
  ];
}
```

```ts
// app/robots.ts
import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://<domena>/sitemap.xml',
  };
}
```

## 5. Sémantika & interní prolinkování (požadavek úkolu 2)

- Jeden `<h1>` na stránku, logická hierarchie `h2`/`h3`.
- `<article>`, `<nav>`, `<main>`, breadcrumbs s `aria-label="breadcrumb"`.
- **Interní odkazy v článku** (`next/link`): v textu na produktové kategorie
  (např. *sušené ovoce*, *ořechy*) a na ostatní stránky webu (Dashboard, AI
  analytik, další články). Odkazy mají popisný anchor text, ne „klikni zde".
- Sekce „Související články" + CTA do produktů na konci.

## 6. Obrázky & výkon (Core Web Vitals)

- `next/image` — automatický `srcset`, lazy loading, povinný `alt`.
- Hero článku s `priority` (LCP prvek), ostatní lazy.
- `next/font` (self-host) → žádný layout shift (CLS), žádný third-party fetch.
- Cíl: LCP < 2,5 s, CLS < 0,1, INP < 200 ms.

## 7. Kontrola

- `next build` → ověř, že článek je staticky vygenerovaný.
- Lighthouse SEO ≥ 95; Rich Results Test pro JSON-LD.
- `/sitemap.xml` a `/robots.txt` reálně dostupné po deployi.
- Žádné `noindex` omylem na produkci.
