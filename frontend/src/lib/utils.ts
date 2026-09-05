import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatCurrency as formatCurrencyCore, useFormatCurrency as useFormatCurrencyCore, Currency } from '@/contexts/currency-context';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an amount in BDT (Taka sign). */
export function formatCurrency(amount: number, _currency: Currency | string = 'BDT'): string {
  return formatCurrencyCore(amount, _currency);
}

/** Hook variant: returns a formatter that always renders BDT (Taka sign). */
export function useFormatCurrency() {
  return useFormatCurrencyCore();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date(date));
}

export function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${path}`;
}

export function apiUrl(path: string): string {
  return `/api/v1${path}`;
}

/** Shorten a system payment reference (PAY-<uuid>) for display — e.g.
 *  PAY-700156bd-7909-4904-8893-93eeff8a5ba5 → PAY-700156bd. The full value is
 *  kept in the `title` attribute at each call site. */
export function shortPaymentRef(ref?: string | null): string {
  if (!ref) return '';
  if (ref.startsWith('PAY-') && ref.length > 12) {
    return `PAY-${ref.slice(4, 12)}`;
  }
  return ref;
}
