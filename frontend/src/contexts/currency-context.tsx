'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export type Currency = 'USD' | 'BDT';

const STORAGE_KEY = 'flyngo-currency';
const DEFAULT_CURRENCY: Currency = 'BDT';

function readStoredCurrency(): Currency | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === 'BDT' ? raw : null;
  } catch {
    return null;
  }
}

function writeStoredCurrency(c: Currency): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, c);
  } catch {
    /* ignore */
  }
}

async function reverseGeocodeCountry(lat: number, lng: number, apiKey: string): Promise<string | null> {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=country&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: any = await res.json();
    const addressComponents: any[] | undefined = data?.results?.[0]?.address_components;
    const country = addressComponents?.find((c: any) => Array.isArray(c.types) && c.types.includes('country'));
    return country?.short_name ?? null;
  } catch {
    return null;
  }
}

async function detectCurrencyFromLocation(): Promise<Currency> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return DEFAULT_CURRENCY;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return DEFAULT_CURRENCY;

  const coords: GeolocationCoordinates | null = await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60 * 60 * 1000 },
    );
  });

  if (!coords) return DEFAULT_CURRENCY;

  const countryCode = await reverseGeocodeCountry(coords.latitude, coords.longitude, apiKey);
  return countryCode === 'BD' ? 'BDT' : 'BDT';
}

interface CurrencyContextValue {
  currency: Currency;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => readStoredCurrency() ?? DEFAULT_CURRENCY);

  useEffect(() => {
    if (readStoredCurrency()) return;
    let cancelled = false;
    detectCurrencyFromLocation().then((c) => {
      if (cancelled) return;
      setCurrency(c);
      writeStoredCurrency(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <CurrencyContext.Provider value={{ currency }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): Currency {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside <CurrencyProvider>');
  return ctx.currency;
}

export function useFormatCurrency() {
  return useCallback(
    (amount: number | null | undefined, _sourceCurrency: Currency | string = 'BDT') => {
      if (amount == null) return '';
      return formatTaka(amount);
    },
    [],
  );
}

export function formatCurrency(amount: number, _currency: Currency | string = 'BDT'): string {
  return formatTaka(amount);
}

/** Format a BDT amount using the Taka sign (৳) instead of the "BDT" code. */
function formatTaka(amount: number): string {
  const n = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
  return `৳${n}`;
}
