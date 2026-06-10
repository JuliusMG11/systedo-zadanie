import type { MetadataRoute } from 'next';
import { article } from '@/content/clanky/oriesky-seminka';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return [
    { url: base, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/dashboard`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/ai-analytik`, changeFrequency: 'monthly', priority: 0.7 },
    {
      url: `${base}/article/${article.slug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
      lastModified: new Date(article.updatedAt),
    },
  ];
}
