import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatCurrency as formatCurrencyCore, useFormatCurrency as useFormatCurrencyCore, Currency } from '@/contexts/currency-context';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an amount in the given currency (no conversion). */
export function formatCurrency(amount: number, currency: Currency | string = 'USD'): string {
  return formatCurrencyCore(amount, currency);
}

/** Hook variant: returns a formatter bound to the active currency. */
export function useFormatCurrency() {
  return useFormatCurrencyCore();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${path}`;
}

export function apiUrl(path: string): string {
  return `/api/v1${path}`;
}
