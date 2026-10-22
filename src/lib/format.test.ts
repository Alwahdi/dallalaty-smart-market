import { describe, it, expect } from 'vitest';
import { formatNumber, formatDate, YEMEN_LOCAL_PHONE, fromYemenPhone } from './format';
import { formatPrice } from './currency';

describe('English digits in Arabic UI', () => {
  it('formats numbers with Latin digits', () => {
    expect(formatNumber(1500000)).toMatch(/^1.500.000$/);
    expect(formatNumber(1500000)).not.toMatch(/[٠-٩]/);
  });
  it('formats prices with Latin digits', () => {
    expect(formatPrice(2500, 'YER')).toMatch(/2.500/);
    expect(formatPrice(2500, 'YER')).not.toMatch(/[٠-٩]/);
  });
  it('formats dates with Latin digits', () => {
    expect(formatDate('2026-10-22')).toMatch(/2026/);
  });
});

describe('Yemen phone', () => {
  it('requires 9 digits starting with 7', () => {
    expect(YEMEN_LOCAL_PHONE.test('771234567')).toBe(true);
    expect(YEMEN_LOCAL_PHONE.test('671234567')).toBe(false);
    expect(YEMEN_LOCAL_PHONE.test('77123456')).toBe(false);
  });
  it('strips +967 prefix', () => {
    expect(fromYemenPhone('+967771234567')).toBe('771234567');
  });
});
