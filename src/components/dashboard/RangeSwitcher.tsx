'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const RANGES = [
  { label: '7 dní', value: '7' },
  { label: '30 dní', value: '30' },
  { label: '90 dní', value: '90' },
  { label: 'Rok', value: '365' },
] as const;

function Spinner() {
  return (
    <span className="inline-block h-3 w-3 shrink-0">
      <svg viewBox="0 0 12 12" fill="none" className="animate-spin">
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5"/>
        <path d="M10.5 6A4.5 4.5 0 0 0 6 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </span>
  );
}

function formatCustomLabel(from: string, to: string): string {
  const fmt = (s: string) => {
    const d = new Date(s + 'T00:00:00');
    return `${d.getDate()}. ${d.getMonth() + 1}.`;
  };
  return `${fmt(from)} – ${fmt(to)}`;
}

export default function RangeSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fromParam = searchParams.get('from') ?? '';
  const toParam = searchParams.get('to') ?? '';
  const isCustomActive = !!(fromParam && toParam);
  const current = isCustomActive ? 'custom' : (searchParams.get('range') ?? '30');

  const today = new Date().toISOString().slice(0, 10);
  const [tempFrom, setTempFrom] = useState(fromParam);
  const [tempTo, setTempTo] = useState(toParam);

  useEffect(() => {
    if (!showPicker) {
      setTempFrom(fromParam);
      setTempTo(toParam);
    }
  }, [fromParam, toParam, showPicker]);

  useEffect(() => {
    if (!isPending) setPendingValue(null);
  }, [isPending]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPicker]);

  function setRange(value: string) {
    if (value === 'custom') {
      setShowPicker((v) => !v);
      return;
    }
    if (value === current && !isPending) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', value);
    params.delete('from');
    params.delete('to');
    setPendingValue(value);
    setShowPicker(false);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function applyCustom() {
    if (!tempFrom || !tempTo || tempFrom > tempTo) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('range');
    params.set('from', tempFrom);
    params.set('to', tempTo);
    setShowPicker(false);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative inline-flex flex-col items-end" ref={wrapperRef}>
      <div
        className="inline-flex rounded-pill border border-clay-soft p-1 gap-0.5"
        style={{ background: 'var(--color-bg-warm)' }}
      >
        {RANGES.map(({ label, value }) => {
          const isActive = current === value && !isPending;
          const isLoading = pendingValue === value && isPending;
          return (
            <button
              key={value}
              onClick={() => setRange(value)}
              disabled={isPending}
              className={`font-heading inline-flex items-center gap-1.5 rounded-pill px-2.5 sm:px-3.75 py-1.5 sm:py-2 text-[12px] sm:text-[13.5px] font-medium transition-all disabled:cursor-wait ${
                isActive || isLoading
                  ? 'bg-white text-espresso shadow-(--shadow-card)'
                  : 'bg-transparent text-ink-soft hover:text-espresso'
              }`}
            >
              {isLoading && <Spinner />}
              {label}
            </button>
          );
        })}

        <button
          onClick={() => setRange('custom')}
          disabled={isPending}
          className={`font-heading inline-flex items-center gap-1.5 rounded-pill px-2.5 sm:px-3.75 py-1.5 sm:py-2 text-[12px] sm:text-[13.5px] font-medium transition-all disabled:cursor-wait ${
            isCustomActive || showPicker
              ? 'bg-white text-espresso shadow-(--shadow-card)'
              : 'bg-transparent text-ink-soft hover:text-espresso'
          }`}
        >
          {isCustomActive ? formatCustomLabel(fromParam, toParam) : 'Vlastní'}
        </button>
      </div>

      {showPicker && (
        <div className="absolute right-0 top-full mt-2 z-20 rounded-[14px] border border-clay-soft bg-white p-4 shadow-lg flex flex-col sm:flex-row items-end gap-3">
          <div className="flex gap-3">
            <div>
              <label className="block font-heading text-[11px] font-semibold uppercase tracking-wide text-ink-faint mb-1.5">
                Od
              </label>
              <input
                type="date"
                value={tempFrom}
                max={tempTo || today}
                onChange={(e) => setTempFrom(e.target.value)}
                className="w-35 rounded-[9px] border border-clay-soft bg-bg-warm px-3 py-1.75 font-body text-[13px] text-espresso focus:outline-none focus:border-walnut transition-colors"
              />
            </div>
            <div>
              <label className="block font-heading text-[11px] font-semibold uppercase tracking-wide text-ink-faint mb-1.5">
                Do
              </label>
              <input
                type="date"
                value={tempTo}
                min={tempFrom}
                max={today}
                onChange={(e) => setTempTo(e.target.value)}
                className="w-35 rounded-[9px] border border-clay-soft bg-bg-warm px-3 py-1.75 font-body text-[13px] text-espresso focus:outline-none focus:border-walnut transition-colors"
              />
            </div>
          </div>
          <button
            onClick={applyCustom}
            disabled={!tempFrom || !tempTo || tempFrom > tempTo || isPending}
            className="shrink-0 rounded-[9px] bg-walnut px-4 py-1.75 font-heading text-[13px] font-semibold text-white transition-all hover:bg-terra-dk disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? <Spinner /> : 'Použít'}
          </button>
        </div>
      )}
    </div>
  );
}
