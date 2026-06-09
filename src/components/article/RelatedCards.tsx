import Link from 'next/link';

const RELATED = [
  {
    href: '/dashboard',
    title: 'Dashboard výkonu mionelo.cz',
    desc: 'Klíčové metriky, trendy návštěvnosti a PNO v přehledném dashboardu.',
    tag: 'Analytika',
  },
  {
    href: '/ai-analytik',
    title: 'AI Marketingový analytik',
    desc: 'Zeptejte se AI na konkrétní problém vašeho e-shopu — dostanete odpověď za sekundy.',
    tag: 'AI nástroj',
  },
];

export default function RelatedCards() {
  return (
    <section aria-label="Související obsah" className="mt-12 border-t border-clay-soft pt-8">
      <h2 className="font-heading text-xl font-semibold text-espresso mb-6">
        Mohlo by vás zajímat
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {RELATED.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-[var(--radius-card)] border border-clay-soft bg-white p-5 shadow-[var(--shadow-card)] hover:border-walnut/30 hover:shadow-md transition-all"
          >
            <span className="text-xs font-medium text-walnut mb-2 block">{item.tag}</span>
            <h3 className="font-heading font-semibold text-espresso group-hover:text-walnut transition-colors mb-1">
              {item.title}
            </h3>
            <p className="text-sm text-espresso/60">{item.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
