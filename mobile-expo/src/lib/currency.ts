// Currency utilities for the marketplace
import { formatNumber } from './format';
// Supports: Yemeni Riyal (YER), Saudi Riyal (SAR), US Dollar (USD)

export type CurrencyCode = 'YER' | 'SAR' | 'USD';

export interface CurrencyOption {
  code: CurrencyCode;
  label: string;
  symbol: string;
  flag: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'YER', label: 'ريال يمني', symbol: 'ر.ي', flag: '🇾🇪' },
  { code: 'SAR', label: 'ريال سعودي', symbol: 'ر.س', flag: '🇸🇦' },
  { code: 'USD', label: 'دولار أمريكي', symbol: '$', flag: '🇺🇸' },
];

const CURRENCY_MAP: Record<CurrencyCode, CurrencyOption> = CURRENCIES.reduce(
  (acc, c) => ({ ...acc, [c.code]: c }),
  {} as Record<CurrencyCode, CurrencyOption>
);

export function getCurrency(code?: string | null): CurrencyOption {
  if (code && code in CURRENCY_MAP) return CURRENCY_MAP[code as CurrencyCode];
  return CURRENCY_MAP.YER;
}

export function formatPrice(price: number, currency?: string | null): string {
  const c = getCurrency(currency);
  const formatted = formatNumber(price, c.code === 'USD' ? 2 : 0);
  return `${formatted} ${c.symbol}`;
}
