// src/components/nav/Breadcrumbs.tsx
import Link from 'next/link';

export type Crumb = { label: string; href?: string };

interface BreadcrumbsProps {
  crumbs: Crumb[];
}

export default function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol
        className="flex flex-wrap items-center gap-1 text-sm text-espresso/60"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {crumbs.map((crumb, idx) => (
          <li
            key={idx}
            className="flex items-center gap-1"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {idx > 0 && <span aria-hidden="true">/</span>}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:text-walnut transition-colors"
                itemProp="item"
              >
                <span itemProp="name">{crumb.label}</span>
              </Link>
            ) : (
              <span className="text-espresso font-medium" itemProp="name" aria-current="page">
                {crumb.label}
              </span>
            )}
            <meta itemProp="position" content={String(idx + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
