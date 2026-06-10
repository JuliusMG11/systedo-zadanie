import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { article } from '@/content/clanky/oriesky-seminka';
import ArticleHero from '@/components/article/ArticleHero';
import Toc from '@/components/article/Toc';
import RelatedCards from '@/components/article/RelatedCards';

export function generateStaticParams() {
  return [{ slug: article.slug }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== article.slug) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const url = `${siteUrl}/article/${slug}`;
  const coverAbsolute = `${siteUrl}${article.coverImage}`;

  return {
    title: article.title,
    description: article.excerpt,
    keywords: ['ořechy', 'semínka', 'zdravá strava', 'omega-3', 'chia', 'mandle', 'superfoods', 'mionelo'],
    authors: [{ name: 'Apex', url: 'https://apex.com' }],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description: article.excerpt,
      images: [{ url: coverAbsolute, width: 1200, height: 630, alt: article.coverAlt }],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      section: article.category,
      tags: ['ořechy', 'semínka', 'zdravá výživa'],
      locale: 'cs_CZ',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [coverAbsolute],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== article.slug) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const pageUrl = `${siteUrl}/article/${slug}`;

  const coverAbsolute = `${siteUrl}${article.coverImage}`;

  const blogPostingLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: coverAbsolute,
    inLanguage: 'cs',
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    articleSection: article.category,
    keywords: 'ořechy, semínka, zdravá strava, omega-3, chia, mandle, superfoods',
    author: {
      '@type': 'Organization',
      name: 'Apex',
      url: 'https://apex.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Apex',
      url: 'https://apex.com',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/images/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    url: pageUrl,
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Domů', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Inspirace', item: `${siteUrl}/article` },
      { '@type': 'ListItem', position: 3, name: article.title, item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-[1240px] px-6">
        <nav className="pt-[22px] pb-4 font-heading text-[13.5px] font-medium text-ink-faint flex flex-wrap gap-1.5 items-center">
          <Link href="/" className="text-ink-soft transition-colors hover:text-walnut">Domů</Link>
          <span className="opacity-60">/</span>
          <Link href="/article" className="text-ink-soft transition-colors hover:text-walnut">Inspirace</Link>
          <span className="opacity-60">/</span>
          <span className="text-espresso">{article.title}</span>
        </nav>
      </div>

      {/* Article hero (within max-width) */}
      <div className="mx-auto max-w-[1240px] px-6">
        <ArticleHero article={article} />
      </div>

      {/* Full-width hero image */}
      <div className="mx-auto max-w-[1240px] px-6 mb-2">
        <div
          className="relative w-full rounded-(--radius-card) overflow-hidden"
          style={{ aspectRatio: '21/9', minHeight: 'clamp(160px, 42vw, 440px)' }}
        >
          <Image
            src="/images/nuts-seeds-mix.webp"
            alt={article.coverAlt}
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 1240px) 100vw, 1240px"
          />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="mx-auto max-w-[1240px] px-6 pb-16">
        <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">

          {/* TOC sidebar — desktop sticky, mobile at bottom */}
          <aside className="hidden lg:block">
            <div className="sticky top-[calc(68px+22px)]">
              <Toc items={article.toc} />
            </div>
          </aside>

          {/* Prose */}
          <article>
            <div className="prose-article">

              <section id="proc-jist-orechy">
                <h2>Proč jíst ořechy každý den?</h2>
                <p>
                  Ořechy patří mezi nejkomplexnější přírodní potraviny. Poskytují zdravé tuky,
                  bílkoviny, vlákninu, vitamíny (E, B-komplex) a minerály jako hořčík, zinek a selen.
                  Pravidelná konzumace <strong>hrsti ořechů denně</strong> je spojena se sníženým
                  rizikem srdečních onemocnění a lepší kontrolou hmotnosti.
                </p>
                <p>
                  V nabídce <Link href="/" className="text-terra-dk underline decoration-[#e0bfa3] underline-offset-[3px] font-semibold hover:decoration-walnut">mionelo.cz</Link> najdete
                  přes 40 druhů ořechů a semínek — od klasických vlašských po exotické macadamie.
                  Vše bez přidaného cukru, soli ani konzervantů.
                </p>
              </section>

              {/* Pull quote */}
              <blockquote
                className="border-l-[3px] border-walnut pl-4.5 sm:pl-5.5 font-heading font-medium text-[18px] sm:text-[22px] leading-[1.4] text-espresso"
              >
                Hrst ořechů denně dokáže pro vaše zdraví víc, než byste čekali — a chutná výborně.
              </blockquote>

              <section id="vlasske-orechy">
                <h2>Vlašské ořechy — král omega-3</h2>
                <p>
                  Vlašské ořechy jsou jedinečným zdrojem rostlinných <strong>omega-3 mastných kyselin</strong>
                  (ALA). Jedna porce (30 g, přibližně 7 půlených jader) pokryje doporučený denní příjem ALA.
                  Studie naznačují pozitivní vliv na kognitivní funkce, náladu i kardiovaskulární zdraví.
                </p>
                <h3>Jak je skladovat</h3>
                <p>
                  Díky vysokému obsahu tuků jsou vlašské ořechy náchylné k žluknutí. Uchovávejte je
                  v temnu, chladu (lednice) a spotřebujte do 3 měsíců po otevření. Celá jádra v
                  skořápce vydrží déle.
                </p>
              </section>

              {/* Illustration — nuts */}
              <figure style={{ margin: 0 }}>
                <div className="relative rounded-(--radius-card) overflow-hidden" style={{ aspectRatio: '2/1' }}>
                  <Image
                    src="/images/macadamia-nuts.webp"
                    alt="Macadamia ořechy v misce — prémiový produkt mionelo.cz"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 720px"
                  />
                </div>
                <figcaption className="mt-2.5 font-heading text-[13.5px] text-ink-faint">
                  Macadamia ořechy z nabídky{' '}
                  <a href="https://www.mionelo.cz/orechy" className="text-walnut hover:text-terra-dk underline-offset-2 underline" target="_blank" rel="noopener noreferrer">mionelo.cz</a>
                  {' '}— máslovitá chuť a vysoký podíl mononenasycených tuků.
                </figcaption>
              </figure>

              <section id="mandle">
                <h2>Mandle — pro srdce i nervový systém</h2>
                <p>
                  Mandle excelují obsahem <strong>vitamínu E</strong> (jeden z nejsilnějších
                  antioxidantů), hořčíku a vápníku. Jsou také relativně bohaté na bílkoviny —
                  6 g na 30g porci — a skvěle zasytí jako svačina.
                </p>
                <p>
                  Mandlové maslo z{' '}
                  <a href="https://www.mionelo.cz/masla-a-kremy" className="text-terra-dk underline decoration-[#e0bfa3] underline-offset-[3px] font-semibold hover:decoration-walnut" target="_blank" rel="noopener noreferrer">
                    nabídky mionelo.cz
                  </a>{' '}
                  je nejprodávanějším produktem. Vyrábíme ho výhradně z pražených
                  mandlí bez přídavků.
                </p>
              </section>

              {/* Tip box */}
              <div
                className="flex gap-4 rounded-(--radius-card) border border-[#cfe0cb] p-[20px]"
                style={{ background: 'var(--color-green-tint)' }}
              >
                <div
                  className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[11px]"
                  style={{ background: 'var(--color-leaf)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" fill="#fff"/>
                  </svg>
                </div>
                <div>
                  <p className="font-heading font-semibold text-[15px] text-green-dk mb-1">Tip pro každý den</p>
                  <p className="text-[15.5px] leading-relaxed" style={{ color: '#3a4a39' }}>
                    Denní doporučená porce je 30 g ořechů nebo 15–20 g semínek. Větší množství zvyšuje
                    kalorický příjem bez proporcionálního nutričního zisku. Nejlépe jako svačina mezi jídly.
                  </p>
                </div>
              </div>

              <section id="seminka">
                <h2>Semínka: malá, ale výživná</h2>
                <p>
                  Semínka bývají nedoceněnou složkou zdravé stravy. Přitom gram za gram nabízejí
                  srovnatelné nebo i vyšší nutriční hodnoty než ořechy. V{' '}
                  <a href="https://www.mionelo.cz/seminka" className="text-terra-dk underline decoration-[#e0bfa3] underline-offset-[3px] font-semibold hover:decoration-walnut" target="_blank" rel="noopener noreferrer">kategorii semínek na mionelo.cz</a>{' '}
                  najdete přes 20 druhů — ideální pro přidávání do <strong>jogurtů, smoothies, salátů nebo domácí granoly</strong>.
                </p>
                <h3>Chia semínka</h3>
                <p>
                  Chia semínka (šalvěj hispánská) absorbují až desetinásobek své hmotnosti ve vodě
                  a tvoří gel. Jsou bohatá na omega-3, vlákninu a vápník. Oblíbená příprava:
                  chia pudink (3 lžíce semínek, 200 ml rostlinného mléka, přes noc do lednice).
                </p>
                <h3>Konopná semínka</h3>
                <p>
                  Konopná semínka obsahují všechny esenciální aminokyseliny a ideální poměr omega-6
                  k omega-3 (3:1). Mají jemnou oříškovou chuť a neobsahují THC. Posypte jimi
                  avokádový toast nebo přidejte do proteinového smoothie.
                </p>
              </section>

              {/* Illustration — seeds */}
              <figure style={{ margin: 0 }}>
                <div className="relative rounded-(--radius-card) overflow-hidden" style={{ aspectRatio: '2/1' }}>
                  <Image
                    src="/images/flax-seeds.webp"
                    alt="Lněná semínka hnědá v misce — bohatý zdroj omega-3 a vlákniny"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 720px"
                  />
                </div>
                <figcaption className="mt-2.5 font-heading text-[13.5px] text-ink-faint">
                  Lněná semínka z nabídky{' '}
                  <a href="https://www.mionelo.cz/seminka" className="text-walnut hover:text-terra-dk underline underline-offset-2" target="_blank" rel="noopener noreferrer">mionelo.cz</a>
                  {' '}— výborná do jogurtu, smoothie nebo domácí granoly.
                </figcaption>
              </figure>

              <section id="jak-zaradit">
                <h2>Jak je zařadit do jídelníčku</h2>
                <ul>
                  <li><strong>Snídaně:</strong> müsli nebo ovesná kaše s vlašskými ořechy a chia semínky.</li>
                  <li><strong>Svačina:</strong> hrst mandlí nebo kešu (30 g) — zasytí a nepřetěžuje trávení.</li>
                  <li><strong>Oběd:</strong> salát posypaný dýňovými semínky pro křupavost a extra hořčík.</li>
                  <li><strong>Dezert:</strong> raw kuličky z datlí, kakaa a vlašských ořechů — bez pečení.</li>
                </ul>
              </section>

            </div>

            {/* Mobile TOC */}
            <div className="mt-10 lg:hidden">
              <Toc items={article.toc} />
            </div>

            {/* CTA box */}
            <div
              className="my-10 sm:my-14 flex flex-wrap items-center justify-between gap-5 rounded-[18px] sm:rounded-lg p-6 sm:p-8 md:p-10"
              style={{ background: 'linear-gradient(135deg,#2E241D,#43342a)', color: '#fff' }}
            >
              <div>
                <h3 className="text-[20px] sm:text-[26px] font-heading font-semibold text-white">
                  Sledujte výkon marketingu v reálném čase
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed max-w-[46ch]" style={{ color: 'rgba(255,255,255,.7)' }}>
                  Dashboard a AI analytik vám ukáží, co táhne prodeje a kde ztrácíte peníze.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-pill bg-walnut px-5 py-3 font-heading text-[15px] font-semibold text-white transition-all hover:bg-terra-dk hover:-translate-y-px"
                  style={{ boxShadow: '0 6px 16px rgba(194,112,61,.35)' }}
                >
                  Otevřít dashboard
                </Link>
                <Link
                  href="/ai-analytik"
                  className="inline-flex items-center rounded-pill border border-white/20 bg-white/10 px-5 py-3 font-heading text-[15px] font-semibold text-white transition-all hover:bg-white/20"
                >
                  Zeptat se AI analytika
                </Link>
              </div>
            </div>

            <RelatedCards />
          </article>
        </div>
      </div>

      <style>{`
        .prose-article { font-size: 15.5px; line-height: 1.72; color: #3c3026; }
        .prose-article > * + * { margin-top: 24px; }
        .prose-article h2 { font-family: var(--font-heading); font-size: 22px; font-weight: 600; color: #2E241D; margin-top: 48px; scroll-margin-top: 92px; letter-spacing: -0.02em; }
        .prose-article h3 { font-family: var(--font-heading); font-size: 18px; font-weight: 600; color: #2E241D; margin-top: 32px; scroll-margin-top: 92px; letter-spacing: -0.02em; }
        .prose-article p { color: #3c3026; }
        .prose-article ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .prose-article ul li { position: relative; padding-left: 26px; }
        .prose-article ul li::before { content:''; position: absolute; left: 4px; top: 10px; width: 7px; height: 7px; border-radius: 50%; background: #5B8A5A; }
        .prose-article strong { color: #2E241D; }
        @media (min-width: 640px) {
          .prose-article { font-size: 17.5px; line-height: 1.75; max-width: 68ch; }
          .prose-article > * + * { margin-top: 32px; }
          .prose-article h2 { font-size: 27px; margin-top: 64px; }
          .prose-article h3 { font-size: 20px; margin-top: 40px; }
          .prose-article ul { gap: 11px; }
          .prose-article ul li { padding-left: 30px; }
          .prose-article ul li::before { top: 11px; width: 8px; height: 8px; }
        }
      `}</style>
    </>
  );
}
