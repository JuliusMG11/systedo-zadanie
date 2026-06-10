'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/article/oriesky-seminka', label: 'Článek' },
  { href: '/ai-analytik', label: 'AI Analytik' },
] as const;

function ApexMark({ size = 34 }: { size?: number }) {
  const r = Math.round(size * 0.29);
  const g = size * 0.65;
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: '#2E241D',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={g} height={g} viewBox="0 0 34 34" fill="none">
        <path d="M17 6 28 27H6L17 6Z" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round"/>
        <path d="M12.4 21.5 17 12.5l4.6 9" stroke="#C2703D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="17" cy="12.5" r="2.4" fill="#C2703D"/>
      </svg>
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-clay-soft"
      style={{ background: 'rgba(250,246,239,.88)', backdropFilter: 'saturate(140%) blur(12px)' }}
    >
      <nav
        className="mx-auto flex h-17 max-w-310 items-center justify-between px-6"
        aria-label="Hlavní navigace"
      >
        {/* Brand — Apex logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <ApexMark size={34} />
          <span
            className="font-heading font-bold text-espresso"
            style={{ fontSize: 22, letterSpacing: '-0.035em' }}
          >
            Apex
          </span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px] border border-clay-soft bg-white md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 6h14M3 10h14M3 14h14" stroke="#2E241D" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex" role="list">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`font-heading rounded-pill px-3.5 py-2 text-[15px] font-medium transition-colors ${
                    active
                      ? 'bg-espresso text-white'
                      : 'text-ink-soft hover:bg-bg-warm hover:text-espresso'
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-clay-soft bg-cream px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1" role="list">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`block font-heading rounded-[10px] px-4 py-3 text-[15px] font-medium transition-colors ${
                      active
                        ? 'bg-espresso text-white'
                        : 'text-ink-soft hover:bg-bg-warm hover:text-espresso'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
