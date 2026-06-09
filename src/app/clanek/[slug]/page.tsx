import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { article } from '@/content/clanky/oriesky-seminka';
import ArticleHero from '@/components/article/ArticleHero';
import Toc from '@/components/article/Toc';
import RelatedCards from '@/components/article/RelatedCards';
import Breadcrumbs from '@/components/nav/Breadcrumbs';

export function generateStaticParams() {
  return [{ slug: article.slug }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== article.slug) return {};

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/clanek/${slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.coverImage, width: 1200, height: 630, alt: article.coverAlt }],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== article.slug) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const pageUrl = `${siteUrl}/clanek/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Organization', name: 'mionelo.cz', url: 'https://mionelo.cz' },
    publisher: { '@type': 'Organization', name: 'mionelo.cz' },
    mainEntityOfPage: pageUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Breadcrumbs
          crumbs={[
            { label: 'mionelo.cz', href: '/' },
            { label: 'Články', href: '/clanek' },
            { label: article.title },
          ]}
        />

        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
          {/* Main article content */}
          <article className="max-w-2xl">
            <ArticleHero article={article} />

            <div className="lg:hidden mb-8">
              <Toc items={article.toc} />
            </div>

            <div className="prose prose-slate max-w-none space-y-6 text-espresso leading-relaxed">

              <section id="proc-jist-orechy">
                <h2 className="font-heading text-2xl font-semibold text-espresso mt-8 mb-3">
                  Proč jíst ořechy každý den?
                </h2>
                <p>
                  Ořechy patří mezi nejkomplexnější přírodní potraviny. Poskytují zdravé tuky,
                  bílkoviny, vlákninu, vitamíny (E, B-komplex) a minerály jako hořčík, zinek a selen.
                  Pravidelná konzumace <strong>hrsti ořechů denně</strong> je spojena se sníženým
                  rizikem srdečních onemocnění a lepší kontrolou hmotnosti.
                </p>
                <p>
                  V nabídce <Link href="/" className="text-walnut hover:underline">mionelo.cz</Link> najdete
                  přes 40 druhů ořechů a semínek — od klasických vlašských po exotické macadamie.
                  Vše bez přidaného cukru, soli ani konzervantů.
                </p>
              </section>

              <section id="vlasske-orechy">
                <h2 className="font-heading text-2xl font-semibold text-espresso mt-8 mb-3">
                  Vlašské ořechy — král omega-3
                </h2>
                <p>
                  Vlašské ořechy jsou jedinečným zdrojem rostlinných <strong>omega-3 mastných kyselin</strong>
                  (ALA). Jedna porce (30 g, přibližně 7 půlených jader) pokryje doporučený denní příjem ALA.
                  Studie naznačují pozitivní vliv na kognitivní funkce, náladu i kardiovaskulární zdraví.
                </p>
                <h3 className="font-heading text-lg font-semibold text-espresso mt-5 mb-2">
                  Jak je skladovat
                </h3>
                <p>
                  Díky vysokému obsahu tuků jsou vlašské ořechy náchylné k žluknutí. Uchovávejte je
                  v temnu, chladu (lednice) a spotřebujte do 3 měsíců po otevření. Celá jádra v
                  skořápce vydrží déle.
                </p>
              </section>

              <section id="mandle">
                <h2 className="font-heading text-2xl font-semibold text-espresso mt-8 mb-3">
                  Mandle — pro srdce i nervový systém
                </h2>
                <p>
                  Mandle excelují obsahem <strong>vitamínu E</strong> (jeden z nejsilnějších
                  antioxidantů), hořčíku a vápníku. Jsou také relativně bohaté na bílkoviny —
                  6 g na 30g porci — a skvěle zasytí jako svačina.
                </p>
                <p>
                  Mandlové maslo z naší{' '}
                  <Link href="/dashboard" className="text-walnut hover:underline">
                    výkonnostní sekce
                  </Link>{' '}
                  je nejprodávanějším produktem mionelo.cz. Vyrábíme ho výhradně z pražených
                  mandlí bez přídavků.
                </p>
              </section>

              <section id="seminka">
                <h2 className="font-heading text-2xl font-semibold text-espresso mt-8 mb-3">
                  Semínka: malá, ale výživná
                </h2>
                <p>
                  Semínka bývají nedoceněnou složkou zdravé stravy. Přitom gram za gram nabízejí
                  srovnatelné nebo i vyšší nutriční hodnoty než ořechy. Jsou ideální pro
                  přidávání do{' '}
                  <strong>jogurtů, smoothies, salátů nebo domácí granoly</strong>.
                </p>
              </section>

              <section id="chia">
                <h3 className="font-heading text-xl font-semibold text-espresso mt-6 mb-2">
                  Chia semínka
                </h3>
                <p>
                  Chia semínka (šalvěj hispánská) absorbují až desetinásobek své hmotnosti ve vodě
                  a tvoří gel. Jsou bohatá na omega-3, vlákninu a vápník. Oblíbená příprava:
                  chia pudink (3 lžíce semínek, 200 ml rostlinného mléka, přes noc do lednice).
                </p>
              </section>

              <section id="konopna">
                <h3 className="font-heading text-xl font-semibold text-espresso mt-6 mb-2">
                  Konopná semínka
                </h3>
                <p>
                  Konopná semínka obsahují všechny esenciální aminokyseliny a ideální poměr omega-6
                  k omega-3 (3:1). Mají jemnou oříškovou chuť a neobsahují THC. Posypte jimi
                  avokádový toast nebo přidejte do proteinového smoothie.
                </p>
              </section>

              <section id="susene-ovoce">
                <h2 className="font-heading text-2xl font-semibold text-espresso mt-8 mb-3">
                  Sušené ovoce: přirozená sladkost
                </h2>
                <p>
                  Sušené ovoce je přirozeně koncentrovaným zdrojem energie, vlákniny a minerálů.
                  Ideální jako náhrada rafinovaného cukru v pečení nebo jako rychlá svačina při
                  sportu. V mionelo nabízíme <strong>sušené datle, meruňky, švestky i brusinky</strong>{' '}
                  bez přidaného cukru a siřičitanů.
                </p>
                <p className="text-espresso/60 text-sm mt-2">
                  Tip: přirozená sladkost datlí je skvělou náhradou cukru v raw dezertních kulích
                  z ořechů a kakaového prášku.
                </p>
              </section>

              <section id="jak-zaradit">
                <h2 className="font-heading text-2xl font-semibold text-espresso mt-8 mb-3">
                  Jak je zařadit do jídelníčku
                </h2>
                <ul className="list-disc list-inside space-y-2 text-espresso">
                  <li>
                    <strong>Snídaně:</strong> müsli nebo ovesná kaše s vlašskými ořechy a chia semínky.
                  </li>
                  <li>
                    <strong>Svačina:</strong> hrst mandlí nebo kešu (30 g) — zasytí a nepřetěžuje trávení.
                  </li>
                  <li>
                    <strong>Oběd:</strong> salát posypaný dýňovými semínky pro křupavost a extra hořčík.
                  </li>
                  <li>
                    <strong>Dezert:</strong> raw kuličky z datlí, kakaa a vlašských ořechů — bez pečení.
                  </li>
                </ul>

                <div className="mt-6 rounded-[var(--radius-card)] border-l-4 border-walnut bg-walnut/5 p-4 text-sm text-espresso">
                  <strong>Denní doporučená porce:</strong> 30 g ořechů nebo 15–20 g semínek.
                  Větší množství zvyšuje kalorický příjem bez proporcionálního nutričního zisku.
                </div>

                <p className="mt-4">
                  Chcete vědět, které produkty mionelo.cz táhnou prodeje nejvíce? Podívejte se na
                  náš{' '}
                  <Link href="/dashboard" className="text-walnut hover:underline font-medium">
                    dashboard výkonu
                  </Link>{' '}
                  nebo se zeptejte{' '}
                  <Link href="/ai-analytik" className="text-walnut hover:underline font-medium">
                    AI marketingového analytika
                  </Link>
                  .
                </p>
              </section>
            </div>

            <RelatedCards />
          </article>

          {/* Sidebar TOC (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Toc items={article.toc} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
