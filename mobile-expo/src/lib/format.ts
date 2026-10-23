// Arabic text with Latin (English) digits everywhere in the app.
export const APP_LOCALE = 'ar-YE-u-nu-latn';

export function formatNumber(value: number | null | undefined, maxFractionDigits = 0): string {
  if (value == null || Number.isNaN(value)) return '0';
  return new Intl.NumberFormat(APP_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

export function formatDate(
  value: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(APP_LOCALE, options);
}

export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(APP_LOCALE, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export const YEMEN_LOCAL_PHONE = /^7\d{8}$/;
export function toYemenPhone(local: string): string {
  return `+967${local}`;
}
export function fromYemenPhone(full: string | null | undefined): string {
  if (!full) return '';
  return full.replace(/^\+?967/, '').replace(/\D/g, '').slice(0, 9);
}

/** Normalize any stored phone to WhatsApp/tel digits (967XXXXXXXXX), or null if not a valid Yemen mobile. */
export function toYemenDialDigits(phone: string | null | undefined): string | null {
  const local = fromYemenPhone(phone);
  return YEMEN_LOCAL_PHONE.test(local) ? `967${local}` : null;
}

/** listing_type is stored as 'sale' | 'rent'; legacy Arabic values are accepted. */
export function isRentListing(type: string | null | undefined): boolean {
  return type === 'rent' || type === 'للإيجار';
}
