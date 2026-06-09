// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  calcPno,
  pctChange,
  trendIsGood,
} from '@/lib/utils';

describe('formatNumber', () => {
  it('formats integer with Czech locale (space thousands separator)', () => {
    const result = formatNumber(12480);
    expect(result).toContain('12');
    expect(result).toContain('480');
  });
});

describe('formatCurrency', () => {
  it('formats CZK currency', () => {
    expect(formatCurrency(10000)).toContain('10');
    expect(formatCurrency(10000)).toContain('Kč');
  });
});

describe('formatPercent', () => {
  it('formats percent with 1 decimal by default', () => {
    expect(formatPercent(25)).toContain('25');
    expect(formatPercent(25)).toContain('%');
  });
});

describe('calcPno', () => {
  it('calculates PNO as cost/conversion_value * 100', () => {
    expect(calcPno(2500, 10000)).toBeCloseTo(25);
  });
  it('returns 0 when conversion_value is 0 (no division by zero)', () => {
    expect(calcPno(2500, 0)).toBe(0);
  });
  it('returns 0 when both are 0', () => {
    expect(calcPno(0, 0)).toBe(0);
  });
});

describe('pctChange', () => {
  it('calculates percentage change correctly', () => {
    expect(pctChange(110, 100)).toBeCloseTo(10);
  });
  it('handles negative change', () => {
    expect(pctChange(90, 100)).toBeCloseTo(-10);
  });
  it('returns 0 when previous is 0', () => {
    expect(pctChange(100, 0)).toBe(0);
  });
});

describe('trendIsGood', () => {
  it('visits: positive change is good', () => {
    expect(trendIsGood('visits', 5)).toBe(true);
    expect(trendIsGood('visits', -5)).toBe(false);
  });
  it('cost: positive change is BAD (higher cost = worse)', () => {
    expect(trendIsGood('cost', 5)).toBe(false);
    expect(trendIsGood('cost', -5)).toBe(true);
  });
  it('pno: positive change is BAD (higher PNO = worse)', () => {
    expect(trendIsGood('pno', 5)).toBe(false);
    expect(trendIsGood('pno', -5)).toBe(true);
  });
  it('conversions: positive change is good', () => {
    expect(trendIsGood('conversions', 3)).toBe(true);
  });
  it('conversion_value: positive change is good', () => {
    expect(trendIsGood('conversion_value', 3)).toBe(true);
  });
});
