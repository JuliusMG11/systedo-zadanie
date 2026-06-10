'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { ClientRow } from '@/lib/queries';

interface Props {
  clients: ClientRow[];
  currentId: number;
}

const CLIENT_INITIALS: Record<string, string> = {
  'mionelo.cz': 'm',
  'getryze.app': 'r',
  'gostreak.app': 's',
};

const CLIENT_COLORS: Record<number, { bg: string; shadow: string }> = {
  1: { bg: 'linear-gradient(150deg,#6FA46B,#467045)', shadow: '0 4px 10px rgba(91,138,90,.35)' },
  2: { bg: 'linear-gradient(150deg,#5B8BC4,#3A6BA0)', shadow: '0 4px 10px rgba(59,107,160,.35)' },
  3: { bg: 'linear-gradient(150deg,#C2703D,#A85A2C)', shadow: '0 4px 10px rgba(194,112,61,.35)' },
};

function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5 shrink-0" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5"/>
      <path d="M12.5 7A5.5 5.5 0 0 0 7 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function ClientSwitcher({ clients, currentId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isPending) setPendingId(null);
  }, [isPending]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as Element).closest('[data-client-switcher]')) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function switchClient(id: number) {
    if (id === currentId && !isPending) { setOpen(false); return; }
    const params = new URLSearchParams(searchParams.toString());
    params.set('client', String(id));
    setPendingId(id);
    setOpen(false);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const current = clients.find((c) => c.id === currentId) ?? clients[0];
  const colors = CLIENT_COLORS[currentId] ?? CLIENT_COLORS[1];
  const initials = CLIENT_INITIALS[current?.domain ?? ''] ?? current?.name?.[0] ?? '?';

  return (
    <div className="relative" data-client-switcher>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-[12px] border border-clay-soft bg-white px-3 py-2 font-heading text-[14px] font-medium text-espresso shadow-(--shadow-card) transition-all hover:border-walnut/40 hover:shadow-lg"
      >
        {/* Mini logo */}
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] font-heading text-[11px] font-bold text-white"
          style={{ background: colors.bg }}
        >
          {isPending && pendingId === currentId ? <Spinner /> : initials}
        </span>
        <span>{current?.name ?? '—'}</span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          className={`text-ink-faint transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-20 mt-2 min-w-[200px] rounded-[14px] border border-clay-soft bg-white py-1.5 shadow-(--shadow-lg)"
        >
          {clients.map((c) => {
            const isSelected = c.id === currentId;
            const isLoading = pendingId === c.id && isPending;
            const col = CLIENT_COLORS[c.id] ?? CLIENT_COLORS[1];
            const init = CLIENT_INITIALS[c.domain] ?? c.name[0];
            return (
              <button
                key={c.id}
                onClick={() => switchClient(c.id)}
                disabled={isPending}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left font-heading text-[14px] font-medium transition-colors disabled:cursor-wait ${
                  isSelected
                    ? 'bg-bg-warm text-espresso'
                    : 'text-ink-soft hover:bg-bg-warm hover:text-espresso'
                }`}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] font-heading text-[13px] font-bold text-white"
                  style={{ background: col.bg, boxShadow: col.shadow }}
                >
                  {isLoading ? <Spinner /> : init}
                </span>
                <span className="flex-1">{c.name}</span>
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-5" stroke="#467045" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
