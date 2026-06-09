import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import ChatWindow from '@/components/ai/ChatWindow';
import Breadcrumbs from '@/components/nav/Breadcrumbs';

export const metadata: Metadata = {
  title: 'AI Marketingový analytik',
  description:
    'Zeptejte se AI analytika na výkon mionelo.cz — návštěvy, PNO, reklamu. Odpověď podložená reálnými daty.',
};

export default function AiAnalytikPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Breadcrumbs
        crumbs={[
          { label: 'mionelo.cz', href: '/' },
          { label: 'AI Analytik' },
        ]}
      />

      <div className="mb-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-espresso flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-walnut" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-espresso">
            AI Marketingový analytik
          </h1>
          <p className="text-sm text-espresso/50 mt-1">
            Analytik mionelo.cz · Odpovídá na základě dat z posledních 90 dní
          </p>
        </div>
      </div>

      <ChatWindow />
    </div>
  );
}
