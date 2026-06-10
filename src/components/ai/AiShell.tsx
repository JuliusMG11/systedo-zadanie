'use client';

import { useState, useRef, useEffect } from 'react';
import { SendHorizonal } from 'lucide-react';
import MessageBubble, { type Message } from './MessageBubble';
import type { ClientRow, KpiRow } from '@/lib/queries';
import { formatPercent } from '@/lib/utils';

interface Props {
  clients: ClientRow[];
  defaultClientId: number;
  clientStats: Record<number, KpiRow>;
}

const CLIENT_COLORS: Record<number, string> = {
  1: 'linear-gradient(150deg,#6FA46B,#467045)',
  2: 'linear-gradient(150deg,#5B8BC4,#3A6BA0)',
  3: 'linear-gradient(150deg,#C2703D,#A85A2C)',
};

const CLIENT_INITIALS: Record<string, string> = {
  'mionelo.cz': 'm',
  'getryze.app': 'r',
  'gostreak.app': 's',
};

function formatVisits(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace('.', ',')} mil.`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',')} tis.`;
  return String(Math.round(n));
}

function getStatus(pno: number, targetPno: number) {
  if (pno <= targetPno) {
    return {
      label: 'Dobrý stav',
      color: '#467045',
      glow: 'rgba(71,112,69,.5)',
      dot: 'green',
      desc: `PNO je pod cílem (${formatPercent(targetPno)}). Výkon je stabilní.`,
    };
  }
  if (pno <= targetPno * 1.3) {
    return {
      label: 'Vyžaduje pozornost',
      color: '#D99026',
      glow: 'rgba(217,144,38,.5)',
      dot: 'amber',
      desc: `PNO přesahuje cíl ${formatPercent(targetPno)}. Doporučujeme zásah do 7 dní.`,
    };
  }
  return {
    label: 'Kritický stav',
    color: '#C0463B',
    glow: 'rgba(192,70,59,.5)',
    dot: 'red',
    desc: `PNO výrazně překračuje cíl ${formatPercent(targetPno)}. Nutný okamžitý zásah.`,
  };
}

function makeWelcome(clientName: string): Message {
  return {
    role: 'assistant',
    content: `Dobrý den! Jsem váš AI marketingový analytik pro ${clientName}. Mohu vám pomoci analyzovat výkon, identifikovat problémy a navrhnout konkrétní kroky. Na co se chcete zeptat?`,
  };
}

const QUICK_CHIPS = [
  {
    label: 'Proč klesají návštěvy?',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4l5 5 3-3 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Jak snížit PNO?',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Shrň výkon za poslední měsíc',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Co zlepšit jako první?',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2a4 4 0 0 0-2.3 7.3c.3.2.5.6.5 1V11h3.6v-.7c0-.4.2-.8.5-1A4 4 0 0 0 8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6.5 13.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function AiShell({ clients, defaultClientId, clientStats }: Props) {
  const [selectedClientId, setSelectedClientId] = useState(defaultClientId);
  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? clients[0];
  const kpi = clientStats[selectedClientId];
  const status = kpi && selectedClient
    ? getStatus(kpi.pno, selectedClient.target_pno)
    : null;

  const [messages, setMessages] = useState<Message[]>([makeWelcome(selectedClient?.name ?? 'klienta')]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) {
        setClientOpen(false);
      }
    }
    if (clientOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [clientOpen]);

  function switchClient(id: number) {
    if (id === selectedClientId) { setClientOpen(false); return; }
    const client = clients.find((c) => c.id === id);
    setSelectedClientId(id);
    setMessages([makeWelcome(client?.name ?? 'klienta')]);
    setClientOpen(false);
  }

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: question.trim() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/analyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), clientId: selectedClientId }),
      });
      const data = await res.json() as { answer?: string; error?: string };
      const content = data.answer ?? data.error ?? 'Omlouváme se, nastala chyba.';
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Omlouváme se, analytik momentálně není dostupný.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  const initials = CLIENT_INITIALS[selectedClient?.domain ?? ''] ?? selectedClient?.name?.[0] ?? '?';
  const clientBg = CLIENT_COLORS[selectedClientId] ?? CLIENT_COLORS[1];

  return (
    <div
      className="mx-auto flex gap-5 px-4 sm:px-6 pb-6 relative"
      style={{ maxWidth: '1240px', height: 'calc(100vh - 68px)' }}
    >
      {/* ─── Sidebar ─── */}
      <aside className={`
        flex-col gap-4 overflow-y-auto pb-4 pt-4.5
        absolute inset-y-0 left-0 z-20 w-75 bg-cream px-4 sm:px-0
        transition-transform duration-200
        ${sidebarOpen ? 'flex translate-x-0' : '-translate-x-full'}
        lg:relative lg:flex lg:w-78 lg:translate-x-0 lg:bg-transparent lg:shrink-0
      `}>

        {/* Client selector */}
        <div className="relative" ref={clientDropdownRef}>
          <button
            onClick={() => setClientOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 rounded-(--radius-card) border border-clay-soft bg-white px-4.5 py-3.5 shadow-(--shadow-card) transition-all hover:border-walnut/40"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] font-heading text-[13px] font-bold text-white"
              style={{ background: clientBg }}
            >
              {initials}
            </span>
            <div className="flex-1 text-left">
              <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint leading-none mb-0.5">Projekt</p>
              <p className="font-heading text-[14px] font-semibold text-espresso leading-tight">{selectedClient?.name ?? '—'}</p>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              className={`text-ink-faint transition-transform duration-200 shrink-0 ${clientOpen ? 'rotate-180' : ''}`}
            >
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {clientOpen && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1.5 rounded-[14px] border border-clay-soft bg-white py-1.5 shadow-lg">
              {clients.map((c) => {
                const isSelected = c.id === selectedClientId;
                const bg = CLIENT_COLORS[c.id] ?? CLIENT_COLORS[1];
                const init = CLIENT_INITIALS[c.domain] ?? c.name[0];
                return (
                  <button
                    key={c.id}
                    onClick={() => switchClient(c.id)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left font-heading text-[14px] font-medium transition-colors ${
                      isSelected ? 'bg-bg-warm text-espresso' : 'text-ink-soft hover:bg-bg-warm hover:text-espresso'
                    }`}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] font-heading text-[13px] font-bold text-white"
                      style={{ background: bg }}
                    >
                      {init}
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

        {/* Status card */}
        <div className="rounded-(--radius-card) border border-clay-soft bg-white p-5.5 shadow-(--shadow-card)">
          <div className="mb-3.5 flex items-center justify-between">
            <h3 className="font-heading text-[15px] font-semibold text-espresso">Stav klienta</h3>
            {/* Stoplight */}
            <div className="flex gap-1.5">
              <span
                className="h-2.75 w-2.75 rounded-full"
                style={status?.dot === 'red'
                  ? { background: '#C0463B', boxShadow: '0 0 0 3px #fde8e7' }
                  : { background: 'var(--color-clay-soft)' }}
              />
              <span
                className="h-2.75 w-2.75 rounded-full"
                style={status?.dot === 'amber'
                  ? { background: '#D99026', boxShadow: '0 0 0 3px #f7e8cf' }
                  : { background: 'var(--color-clay-soft)' }}
              />
              <span
                className="h-2.75 w-2.75 rounded-full"
                style={status?.dot === 'green'
                  ? { background: '#467045', boxShadow: '0 0 0 3px #d4ecd3' }
                  : { background: 'var(--color-clay-soft)' }}
              />
            </div>
          </div>

          {status ? (
            <>
              <div className="flex items-center gap-2 font-heading text-[15px] font-semibold" style={{ color: status.color }}>
                <span
                  className="h-2.25 w-2.25 rounded-full"
                  style={{
                    background: status.color,
                    animation: 'pulse-status 2s infinite',
                    boxShadow: `0 0 0 0 ${status.glow}`,
                  }}
                />
                {status.label}
              </div>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">{status.desc}</p>
              <div className="mt-3.5 grid grid-cols-2 gap-2">
                {[
                  {
                    label: 'PNO',
                    value: formatPercent(kpi!.pno),
                    color: kpi!.pno > selectedClient!.target_pno ? '#C0463B' : '#467045',
                  },
                  { label: 'Návštěvy', value: formatVisits(kpi!.visits) },
                  { label: 'Konverze', value: String(Math.round(kpi!.conversions)) },
                  { label: 'Cíl PNO', value: formatPercent(selectedClient!.target_pno) },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-sm bg-bg-warm px-2.75 py-2.25">
                    <p className="font-heading text-[11px] font-medium text-ink-faint">{label}</p>
                    <p className="mt-0.5 font-heading text-[16px] font-bold" style={{ color: color ?? 'var(--color-espresso)' }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-20 animate-pulse rounded-sm bg-bg-warm" />
          )}
        </div>

        {/* Quick chips */}
        <div>
          <p className="mb-2 ml-1 font-heading text-[12.5px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
            Rychlé otázky
          </p>
          <div className="flex flex-col gap-2">
            {QUICK_CHIPS.map(({ label, icon }) => (
              <button
                key={label}
                disabled={loading}
                onClick={() => sendMessage(label)}
                className="flex items-center gap-2.5 rounded-[13px] border border-clay-soft bg-white px-3.75 py-3.25 text-left font-body text-[14px] font-medium text-espresso transition-colors hover:border-walnut hover:bg-terra-tint disabled:cursor-not-allowed disabled:opacity-40"
                style={{ lineHeight: 1.3 }}
              >
                <span className="shrink-0 text-walnut">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-espresso/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Chat ─── */}
      <section className="flex min-h-0 flex-col pb-4 pt-4.5 flex-1 min-w-0">

        {/* Chat header */}
        <div className="mb-1.5 flex items-center gap-3 border-b border-clay-soft pb-3.5">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(150deg,#C2703D,#A85A2C)',
              boxShadow: '0 5px 14px rgba(194,112,61,.32)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v3M7 8h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9.5" cy="13" r="1.3" fill="#fff"/>
              <circle cx="14.5" cy="13" r="1.3" fill="#fff"/>
            </svg>
          </div>
          <div>
            <h2 className="font-heading text-[18px] font-semibold text-espresso">AI Marketingový analytik</h2>
            <p className="text-[12.5px] text-ink-faint">{selectedClient?.domain ?? '—'} · data z posledních 90 dní</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-heading text-[13px] font-semibold text-green-dk">
              <span className="h-2 w-2 rounded-full bg-leaf" />
              Online
            </div>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Zobrazit panel"
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-clay-soft bg-white text-espresso transition-colors hover:bg-bg-warm lg:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="2.5" rx="1.25" fill="currentColor"/>
                <rect x="2" y="6.75" width="8" height="2.5" rx="1.25" fill="currentColor"/>
                <rect x="2" y="11.5" width="12" height="2.5" rx="1.25" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-1.5 py-5.5 flex flex-col gap-5.5">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {loading && (
            <div className="flex gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
                style={{ background: 'linear-gradient(150deg,#6FA46B,#467045)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v3M7 8h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="rounded-2xl rounded-tl-[5px] border border-clay-soft bg-white px-4 py-3 shadow-(--shadow-card) flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-espresso/30 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <form onSubmit={handleSubmit} className="pt-3.5">
          <div
            className="flex items-end gap-2.5 rounded-[18px] border border-clay-soft bg-white px-4.5 py-2 shadow-(--shadow-card) focus-within:border-walnut transition-colors"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
              }}
              placeholder="Napište svůj dotaz…"
              rows={1}
              maxLength={500}
              disabled={loading}
              aria-label="Dotaz pro AI analytika"
              className="flex-1 resize-none bg-transparent py-2.25 font-body text-[15px] text-espresso placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
              style={{ maxHeight: '120px', lineHeight: 1.5 }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Odeslat dotaz"
              className="mb-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-walnut text-white transition-all hover:bg-terra-dk disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <SendHorizonal size={16} />
            </button>
          </div>
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[12.5px] text-ink-faint">
            <span className="h-1.75 w-1.75 rounded-full bg-leaf" />
            Odpovídá na základě reálných dat · {selectedClient?.domain ?? '—'}
          </p>
        </form>
      </section>

      <style>{`
        @keyframes pulse-status {
          0%   { box-shadow: 0 0 0 0 currentColor }
          70%  { box-shadow: 0 0 0 7px transparent }
          100% { box-shadow: 0 0 0 0 transparent }
        }
      `}</style>
    </div>
  );
}
