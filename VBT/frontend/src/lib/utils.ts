import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function progressPct(raised: string | number | null | undefined, target: string | number | null | undefined): number {
  const r = Number(raised ?? 0);
  const t = Number(target ?? 0);
  if (!r || !t) return 0;
  return Math.min(100, Math.round((r / t) * 100));
}