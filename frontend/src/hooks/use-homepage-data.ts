'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface HeroStat {
  value: string;
  labelEn: string;
  labelBn?: string;
}

export interface HeroSectionData {
  id?: string;
  badgeTextEn?: string;
  badgeTextBn?: string;
  titleLineAEn?: string;
  titleLineABn?: string;
  titleLineBEn?: string;
  titleLineBBn?: string;
  titleLineCEn?: string;
  titleLineCBn?: string;
  subtitleEn?: string;
  subtitleBn?: string;
  ctaExploreEn?: string;
  ctaExploreBn?: string;
  ctaVisaEn?: string;
  ctaVisaBn?: string;
  ctaDestinationsEn?: string;
  ctaDestinationsBn?: string;
  stats?: HeroStat[];
  quickPlaces?: string[];
  isActive?: boolean;
}

export interface GlobeCity {
  id: string;
  nameEn: string;
  nameBn?: string;
  lat: number;
  lon: number;
  isActive: boolean;
  sortOrder: number;
}

export interface GlobeRoute {
  id: string;
  fromCityId: string;
  toCityId: string;
  fromCity?: GlobeCity;
  toCity?: GlobeCity;
  isActive: boolean;
  sortOrder: number;
}

const CACHE_TTL_MS = 60_000;

type CachedHero = { ts: number; data: HeroSectionData };
type CachedGlobe = { ts: number; data: { cities: GlobeCity[]; routes: GlobeRoute[] } };

const heroCache: { current: CachedHero | null } = { current: null };
const globeCache: { current: CachedGlobe | null } = { current: null };

function readCache<T>(cache: { current: { ts: number; data: T } | null }): T | null {
  if (cache.current && Date.now() - cache.current.ts < CACHE_TTL_MS) return cache.current.data;
  return null;
}

function writeCache<T>(cache: { current: { ts: number; data: T } | null }, data: T) {
  cache.current = { ts: Date.now(), data };
}

export function useHeroSection() {
  const initial = readCache(heroCache);
  const [data, setData] = useState<HeroSectionData | null>(initial);
  const [loading, setLoading] = useState(initial == null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (readCache(heroCache)) {
      // Cache was already loaded into `useState` above; no further work.
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get<HeroSectionData>('/hero')
      .then((res) => {
        if (cancelled) return;
        const normalized = (res as any)?.data ?? res;
        writeCache(heroCache, normalized);
        setData(normalized);
      })
      .catch((err) => !cancelled && setError(err?.message || 'Failed to load hero'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

export function useGlobeData() {
  const initial = readCache(globeCache);
  const [data, setData] = useState<{ cities: GlobeCity[]; routes: GlobeRoute[] } | null>(initial);
  const [loading, setLoading] = useState(initial == null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    globeCache.current = null;
    setLoading(true);
    try {
      const res = await api.get<{ cities: GlobeCity[]; routes: GlobeRoute[] }>('/globe');
      const normalized = (res as any)?.data ?? res;
      writeCache(globeCache, normalized);
      setData(normalized);
    } catch (err: any) {
      setError(err?.message || 'Failed to load globe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (readCache(globeCache)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get<{ cities: GlobeCity[]; routes: GlobeRoute[] }>('/globe')
      .then((res) => {
        if (cancelled) return;
        const normalized = (res as any)?.data ?? res;
        writeCache(globeCache, normalized);
        setData(normalized);
      })
      .catch((err) => !cancelled && setError(err?.message || 'Failed to load globe'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error, refresh };
}
