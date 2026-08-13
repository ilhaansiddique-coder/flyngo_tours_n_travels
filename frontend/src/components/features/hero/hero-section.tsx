'use client';

import dynamic from 'next/dynamic';
import { useLocale } from '@/contexts/locale-context';
import { useGlobeData } from '@/hooks/use-homepage-data';
import { cityName } from '@/lib/geo';
import { HeroSearchPanel } from '@/components/features/experiences/hero-search-panel';

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

      <div className="relative mx-auto grid w-full max-w-[1600px] grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-16 lg:px-16 lg:py-24">
        <div className="relative z-10">
          <HeroSearchPanel />
        </div>

        <div className="relative order-first lg:order-last">
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
