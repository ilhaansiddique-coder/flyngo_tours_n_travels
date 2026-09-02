'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Gift } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { useGlobeData } from '@/hooks/use-homepage-data';
import { cityName } from '@/lib/geo';
import { HeroSearchPanel } from '@/components/features/experiences/hero-search-panel';
import { trackEvent } from '@/lib/tracking-client';

const Globe = dynamic(() => import('./three/Globe').then((m) => m.default), {
  ssr: false,
  loading: () => <GlobeSkeleton />,
});

function GlobeSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500" />
    </div>
  );
}

export function HeroSection() {
  const { locale } = useLocale();
  const { data: globe } = useGlobeData();

  const cities: { id?: string; lat: number; lon: number; name?: string }[] = globe?.cities ?? [];
  const routes = globe?.routes ?? [];

  const chipRoutes = routes.slice(0, 6).map((r) => ({
    from: r.fromCity,
    to: r.toCity,
  }));

  return (
    <section
      className="hero-surface relative isolate overflow-hidden"
      style={{ color: 'var(--color-hero-text)' }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-70" />
      </div>

      {/* Refer & Earn — themed CTA in hero top-right */}
      <Link
        href="/refer"
        onClick={() => trackEvent('lead', { contentName: 'home_hero_refer_cta' })}
        aria-label="Refer and earn rewards"
        className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold tracking-wider transition-all duration-300 shadow-lg sm:right-6 sm:top-6 sm:px-5 sm:py-3 sm:text-sm"
        style={{
          backgroundColor: 'var(--color-header-btn-bg)',
          color: 'var(--color-header-btn-text)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-header-btn-hover-bg)';
          e.currentTarget.style.color = 'var(--color-header-btn-hover-text)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-header-btn-bg)';
          e.currentTarget.style.color = 'var(--color-header-btn-text)';
        }}
      >
        <Gift className="h-4 w-4" />
        Refer &amp; Earn
      </Link>

      <div className="relative mx-auto grid w-full max-w-[1600px] grid-cols-1 items-center gap-12 px-4 py-16 pt-20 sm:px-6 sm:pt-24 lg:grid-cols-2 lg:gap-16 lg:px-16 lg:py-24">
        <div className="relative z-10 order-1">
          <HeroSearchPanel />
        </div>

        <div className="relative order-2">
          <div className="relative mx-auto aspect-square w-full max-w-[520px]">
            <Globe cities={cities} routes={routes} />
          </div>

          {chipRoutes.length > 0 && (
            <ul className="pointer-events-none absolute -left-3 top-4 hidden flex-col gap-2 sm:flex lg:-left-8">
              {chipRoutes.slice(0, 3).map((r, i) => {
                if (!r.from || !r.to) return null;
                return (
                  <li
                    key={`${r.from.id}-${r.to.id}`}
                    className="route-chip"
                    style={{ animationDelay: `${i * 0.6}s` }}
                  >
                    <span className="route-dot" />
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: 'var(--color-hero-text)' }}
                    >
                      {cityName(r.from, locale)}{' '}
                      <span style={{ color: 'var(--color-hero-text-muted)' }}>→</span> {cityName(r.to, locale)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {chipRoutes.length > 3 && (
            <ul className="pointer-events-none absolute -right-3 bottom-12 hidden flex-col items-end gap-2 sm:flex lg:-right-8">
              {chipRoutes.slice(3, 6).map((r, i) => {
                if (!r.from || !r.to) return null;
                return (
                  <li
                    key={`${r.from.id}-${r.to.id}`}
                    className="route-chip"
                    style={{ animationDelay: `${(i + 3) * 0.6}s` }}
                  >
                    <span className="route-dot" />
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: 'var(--color-hero-text)' }}
                    >
                      {cityName(r.from, locale)}{' '}
                      <span style={{ color: 'var(--color-hero-text-muted)' }}>→</span> {cityName(r.to, locale)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 animate-bounce lg:flex">
        <span
          className="text-[10px] uppercase tracking-widest"
          style={{ color: 'color-mix(in oklab, var(--color-primary) 80%, transparent)' }}
        >
          Scroll
        </span>
        <div
          className="flex h-8 w-5 justify-center rounded-full border pt-1"
          style={{ borderColor: 'color-mix(in oklab, var(--color-primary) 40%, transparent)' }}
        >
          <div
            className="h-2 w-1 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--color-tertiary)' }}
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
