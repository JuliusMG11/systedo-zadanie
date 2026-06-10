// src/components/dashboard/AiInsightCard.tsx
import Link from 'next/link';

interface Props {
  insight: string;
}

export default function AiInsightCard({ insight }: Props) {
  return (
    <div
      className="rounded-(--radius-card) border border-[#EAD2BC] p-4 sm:p-6 shadow-(--shadow-card) relative overflow-hidden flex flex-col gap-4 sm:gap-5 sm:flex-row sm:items-center sm:justify-between"
      style={{ background: 'linear-gradient(135deg,#FBEFE4,#F6E2D2)' }}
    >
      {/* Glow orb */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-45 w-45"
        style={{ background: 'radial-gradient(circle,rgba(194,112,61,.22),transparent 70%)' }}
        aria-hidden
      />

      <div className="flex items-start gap-4 max-w-2xl">
        {/* AI orb */}
        <div
          className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-[13px]"
          style={{
            background: 'linear-gradient(150deg,#C2703D,#A85A2C)',
            boxShadow: '0 6px 16px rgba(194,112,61,.35)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v3M7 8h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9.5" cy="13" r="1.3" fill="#fff"/>
            <circle cx="14.5" cy="13" r="1.3" fill="#fff"/>
          </svg>
        </div>

        <div>
          <p className="font-heading text-[12.5px] font-semibold uppercase tracking-[0.12em] text-walnut mb-1.5">
            AI insight
          </p>
          <p className="font-heading text-[16px] sm:text-[18px] font-semibold leading-snug text-espresso">
            {insight}
          </p>
        </div>
      </div>

      <Link
        href="/ai-analytik"
        className="shrink-0 inline-flex items-center rounded-pill bg-walnut px-5 py-3 font-heading text-[15px] font-semibold text-white transition-all hover:bg-terra-dk hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-walnut/50"
        style={{ boxShadow: '0 6px 16px rgba(194,112,61,.28)' }}
      >
        Zeptat se analytika
      </Link>
    </div>
  );
}
