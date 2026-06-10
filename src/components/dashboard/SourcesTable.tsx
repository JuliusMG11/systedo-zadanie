// src/components/dashboard/SourcesTable.tsx
import { formatNumber, formatCurrency, formatPercent, trendIsGood } from '@/lib/utils';
import type { ChannelRow } from '@/lib/queries';

const CHANNEL_LABELS: Record<string, string> = {
  organic: 'Organické vyhledávání',
  cpc: 'Placená reklama (CPC)',
  social: 'Sociální sítě',
  direct: 'Přímá návštěva',
  email: 'E-mail',
  referral: 'Referral',
};

interface Props {
  channels: ChannelRow[];
  targetPno: number;
}

export default function SourcesTable({ channels, targetPno }: Props) {
  return (
    <div className="rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] overflow-hidden">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-clay-soft">
        <h2 className="font-heading text-base sm:text-lg font-semibold text-espresso">
          Přehled zdrojů (30 dní)
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Přehled zdrojů návštěvnosti">
          <thead>
            <tr className="border-b border-clay-soft text-left">
              <th className="px-3 sm:px-6 py-2.5 sm:py-3 font-medium text-espresso/50 text-xs uppercase tracking-wide">Kanál</th>
              <th className="px-3 sm:px-6 py-2.5 sm:py-3 font-medium text-espresso/50 text-xs uppercase tracking-wide">Návštěvy</th>
              <th className="hidden sm:table-cell px-6 py-3 font-medium text-espresso/50 text-xs uppercase tracking-wide">Náklady</th>
              <th className="px-3 sm:px-6 py-2.5 sm:py-3 font-medium text-espresso/50 text-xs uppercase tracking-wide">Konverze</th>
              <th className="px-3 sm:px-6 py-2.5 sm:py-3 font-medium text-espresso/50 text-xs uppercase tracking-wide">PNO</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((row) => {
              const pnoGood = row.pno <= targetPno;
              return (
                <tr
                  key={row.channel}
                  className="border-b border-clay-soft/50 hover:bg-cream transition-colors"
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-espresso text-xs sm:text-sm">
                    {CHANNEL_LABELS[row.channel] ?? row.channel}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-tabular text-espresso text-xs sm:text-sm">
                    {formatNumber(row.visits)}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 font-tabular text-espresso">
                    {formatCurrency(row.cost)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-tabular text-espresso text-xs sm:text-sm">
                    {formatNumber(row.conversions)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span
                      className={`inline-flex rounded-pill px-2 py-0.5 text-xs font-medium font-tabular ${
                        pnoGood
                          ? 'bg-positive/10 text-positive'
                          : 'bg-negative/10 text-negative'
                      }`}
                    >
                      {formatPercent(row.pno)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
