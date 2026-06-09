// src/components/dashboard/AiInsightCard.tsx
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface Props {
  insight: string;
}

export default function AiInsightCard({ insight }: Props) {
  return (
    <div className="rounded-[var(--radius-card)] bg-espresso p-6 text-white shadow-[var(--shadow-card)] flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-walnut" />
        <span className="text-sm font-medium text-white/70">AI Analytik</span>
      </div>
      <p className="text-base leading-relaxed">{insight}</p>
      <Link
        href="/ai-analytik"
        className="inline-flex w-fit items-center rounded-pill bg-walnut px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-walnut/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
      >
        Zeptat se AI analytika
      </Link>
    </div>
  );
}
