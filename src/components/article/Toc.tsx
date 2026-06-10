interface TocItem {
  id: string;
  label: string;
}

interface Props {
  items: TocItem[];
}

export default function Toc({ items }: Props) {
  return (
    <nav aria-label="Obsah článku">
      {/* Desktop: vertical with border-left */}
      <div className="hidden lg:block">
        <p className="font-heading text-[12.5px] font-semibold uppercase tracking-widest text-ink-faint mb-3.5">
          Obsah článku
        </p>
        <ul className="flex flex-col gap-0.5 border-l-2 border-clay-soft">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="block border-l-2 border-transparent py-1.5 pl-4 text-[14px] text-ink-soft transition-all hover:border-walnut hover:text-walnut -ml-0.5"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile: pill chips */}
      <div className="lg:hidden border-t border-clay-soft pt-5 mt-2">
        <p className="font-heading text-[12.5px] font-semibold uppercase tracking-widest text-ink-faint mb-3">
          Obsah článku
        </p>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-pill border border-clay-soft bg-white px-3.5 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-walnut hover:text-walnut"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
