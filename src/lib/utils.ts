// src/lib/utils.ts
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('cs-CZ').format(Math.round(n));
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Formats a whole-number percent value (e.g. 25 → "25,0 %").
 * Pass value in percent units (25), NOT as a decimal ratio (0.25).
 */
export function formatPercent(n: number, decimals = 1): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n / 100);
}

export function calcPno(cost: number, conversionValue: number): number {
  if (conversionValue === 0) return 0;
  return (cost / conversionValue) * 100;
}

export function pctChange(current: number, previous: number): number {
  // Returns 0 for zero-baseline periods (no prior data) — callers render as "–"
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export type MetricKey = 'visits' | 'conversions' | 'conversion_value' | 'cost' | 'pno';

export function trendIsGood(metric: MetricKey, change: number): boolean {
  const lowerIsBetter = new Set<MetricKey>(['cost', 'pno']);
  return lowerIsBetter.has(metric) ? change < 0 : change > 0;
}
