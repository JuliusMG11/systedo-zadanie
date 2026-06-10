import type { ArticleData } from '@/content/clanky/oriesky-seminka';

interface Props {
  article: ArticleData;
}

export default function ArticleHero({ article }: Props) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="pb-8">
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <span
          className="inline-flex items-center rounded-pill px-3.25 py-1.5 font-heading text-[13px] font-medium border"
          style={{ background: 'var(--color-terra-tint)', color: 'var(--color-terra-dk)', borderColor: '#e9d2bd' }}
        >
          {article.category}
        </span>
        <span className="text-[14px] text-ink-faint">{formattedDate}</span>
        <span className="text-[14px] text-ink-faint">· {article.readingTime} čtení</span>
      </div>

      {/* Title */}
      <h1 className="font-heading font-semibold text-espresso leading-[1.05] tracking-[-0.02em]"
        style={{ fontSize: 'clamp(26px,5.2vw,50px)', maxWidth: 'min(20ch, 95vw)' }}>
        {article.title}
      </h1>

      {/* Lead */}
      <p className="mt-4 text-ink-soft leading-[1.55]" style={{ fontSize: 'clamp(16px,2.2vw,21px)', maxWidth: 'min(60ch, 95vw)' }}>
        {article.excerpt}
      </p>

      {/* Byline */}
      <div className="mt-6 flex items-center gap-3 text-[14px] text-ink-soft">
        <span
          className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full font-heading text-[13px] font-bold text-white"
          style={{ background: 'linear-gradient(150deg,#6FA46B,#467045)' }}
        >
          {article.author.slice(0, 2).toUpperCase()}
        </span>
        <span>Redakce <strong className="font-heading text-espresso">{article.author}</strong></span>
      </div>
    </header>
  );
}
