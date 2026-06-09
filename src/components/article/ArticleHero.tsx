import type { ArticleData } from '@/content/clanky/oriesky-seminka';

interface Props {
  article: ArticleData;
}

export default function ArticleHero({ article }: Props) {
  return (
    <header className="mb-10">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-espresso/50">
        <span className="rounded-pill bg-walnut/10 px-3 py-1 text-xs font-medium text-walnut">
          {article.category}
        </span>
        <span>{article.readingTime} čtení</span>
        <time dateTime={article.publishedAt}>
          {new Date(article.publishedAt).toLocaleDateString('cs-CZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </time>
      </div>
      <h1 className="font-heading text-4xl font-semibold leading-tight text-espresso sm:text-5xl">
        {article.title}
      </h1>
      <p className="mt-4 text-lg text-espresso/60 leading-relaxed max-w-2xl">
        {article.excerpt}
      </p>
      <div
        className="mt-8 h-64 rounded-[var(--radius-card)] bg-clay-soft flex items-center justify-center text-espresso/30 text-sm"
        role="img"
        aria-label={article.coverAlt}
      >
        {article.coverAlt}
      </div>
    </header>
  );
}
