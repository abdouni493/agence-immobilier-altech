import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Algerian Dinar amount, e.g. 25000 -> "25 000 DA" */
export function formatDA(amount: number): string {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const parts = rounded.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${parts} DA`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR');
}

/** Montant comptable : séparateur de milliers + 2 décimales, ex. "3 500 000,00 DA". */
export function formatDA2(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${safe.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DA`;
}

/** Parse a "yyyy-mm-dd" string as a LOCAL date (new Date(iso) would parse it as UTC
 *  and shift the displayed day in some timezones). Falls back to Date parsing. */
function parseISODate(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(iso);
}

/** ISO date (yyyy-mm-dd) -> "15 janv. 2025" style */
export function formatDate(iso: string, locale: 'fr' | 'ar' = 'fr'): string {
  if (!iso) return '';
  const d = parseISODate(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateLong(iso: string, locale: 'fr' | 'ar' = 'fr'): string {
  if (!iso) return '';
  const d = parseISODate(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Today's date in yyyy-mm-dd, using the LOCAL system clock.
 *  (toISOString() returns the UTC date, which lags the local date and made
 *  same-day reservations show "arrival in 1 day" with a blocked button.) */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDaysISO(iso: string, days: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const d = m
    ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days))
    : (() => { const x = new Date(iso); x.setDate(x.getDate() + days); return x; })();
  return d.toISOString().slice(0, 10);
}

/** Number of nights between two ISO dates */
export function nightsBetween(startISO: string, endISO: string): number {
  if (!startISO || !endISO) return 0;
  const start = new Date(startISO);
  const end = new Date(endISO);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/**
 * Number of months between two ISO dates, with the incomplete last month
 * counted at prorata (ex. 15/01 → 15/03 = 2, 15/01 → 30/03 ≈ 2.5).
 */
export function monthsBetween(startISO: string, endISO: string): number {
  if (!startISO || !endISO || endISO <= startISO) return 0;
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const anchor = new Date(start);
  anchor.setMonth(anchor.getMonth() + months);
  // The anchor may land past the end date when the day-of-month is smaller.
  if (anchor > end) {
    months -= 1;
    anchor.setMonth(anchor.getMonth() - 1);
  }
  const extraDays = Math.round((end.getTime() - anchor.getTime()) / 86_400_000);
  const daysInAnchorMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
  return Math.max(0, months + extraDays / daysInAnchorMonth);
}

/** Rounded month count for display, ex. 2.5 -> "2,5". */
export function formatMonths(months: number): string {
  return (Math.round(months * 100) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

/** Whether two [start,end) date ranges overlap */
export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function isWithin(iso: string, startISO: string, endISO: string): boolean {
  return iso >= startISO && iso <= endISO;
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7); // yyyy-mm
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function downloadJSON(filename: string, json: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
