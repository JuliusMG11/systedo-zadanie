export const article = {
  slug: 'oriesky-seminka',
  title: 'Ořechy a semínka: průvodce superpotravinami',
  excerpt:
    'Proč jsou vlašské ořechy, chia semínka a mandlové maslo základem zdravé stravy? Průvodce výběrem, skladováním a přípravou od mionelo.cz.',
  publishedAt: '2025-10-15',
  updatedAt: '2026-01-20',
  author: 'mionelo.cz',
  category: 'Zdravá výživa',
  coverImage: '/images/oriesky-hero.jpg',
  coverAlt: 'Mísa smíšených ořechů a semínek na dřevěném podnosu',
  readingTime: '7 min',
  toc: [
    { id: 'proc-jist-orechy', label: 'Proč jíst ořechy každý den?' },
    { id: 'vlasske-orechy', label: 'Vlašské ořechy — král omega-3' },
    { id: 'mandle', label: 'Mandle — pro srdce i nervový systém' },
    { id: 'seminka', label: 'Semínka: malá, ale výživná' },
    { id: 'chia', label: 'Chia semínka' },
    { id: 'konopna', label: 'Konopná semínka' },
    { id: 'susene-ovoce', label: 'Sušené ovoce: přirozená sladkost' },
    { id: 'jak-zaradit', label: 'Jak je zařadit do jídelníčku' },
  ],
};

export type ArticleData = typeof article;
