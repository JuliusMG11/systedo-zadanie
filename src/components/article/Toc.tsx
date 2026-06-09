interface TocItem {
  id: string;
  label: string;
}

interface Props {
  items: TocItem[];
}

export default function Toc({ items }: Props) {
  return (
    <nav
      aria-label="Obsah článku"
      className="rounded-[var(--radius-card)] bg-clay-soft/50 border border-clay-soft p-5 mb-8 lg:mb-0"
    >
      <h2 className="font-heading text-base font-semibold text-espresso mb-3">
        Obsah
      </h2>
      <ol className="space-y-2 text-sm">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-espresso/60 hover:text-walnut transition-colors flex gap-2"
            >
              <span className="text-walnut font-medium shrink-0">{i + 1}.</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
