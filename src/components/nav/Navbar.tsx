// src/components/nav/Navbar.tsx
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clanek/oriesky-seminka', label: 'Článek' },
  { href: '/ai-analytik', label: 'AI Analytik' },
] as const;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-clay-soft bg-white/90 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        aria-label="Hlavní navigace"
      >
        <Link
          href="/"
          className="font-heading text-lg font-semibold text-espresso hover:text-walnut transition-colors"
        >
          mionelo<span className="text-walnut">.</span>cz
        </Link>
        <ul className="flex items-center gap-2" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-pill px-4 py-2 text-sm font-medium text-espresso transition-colors hover:bg-clay-soft hover:text-walnut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
