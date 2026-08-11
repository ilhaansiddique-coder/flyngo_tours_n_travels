'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, FileCheck, Plane } from 'lucide-react';
import { cityName } from '@/lib/geo';
import { useLocale } from '@/contexts/locale-context';
import { useHeroSection, useGlobeData, type HeroStat, type GlobeCity } from '@/hooks/use-homepage-data';

const Globe = dynamic(() => import('./three/Globe').then((m) => m.default), {
  ssr: false,
  loading: () => <GlobeSkeleton />,
});

/**
 * The Globe now reads its cities/routes from the API via {@link useGlobeData}
 * — falling back to the static defaults from `lib/geo` if the request fails
 * or is still loading. The static defaults are kept importable for tests.
 */

const STAT_FALLBACK: HeroStat[] = [
  { value: '500+', labelEn: 'Destinations', labelBn: 'গন্তব্য' },
  { value: '50K+', labelEn: 'Happy travelers', labelBn: 'খুশি যাত্রী' },
  { value: '1K+', labelEn: 'Tour packages', labelBn: 'ট্যুর প্যাকেজ' },
  { value: '24/7', labelEn: 'Concierge', labelBn: 'পরিষেবা' },
];

const QUICK_PLACES_FALLBACK = ['Bali', 'Dubai', 'Maldives', 'Switzerland', 'Thailand'];

function GlobeSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500" />
    </div>
  );
}

function PlaneIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1L15 22v-1.5L13 19v-5.5z" />
    </svg>
  );
}

function pickStatLabel(s: HeroStat, locale: 'en' | 'bn'): string {
  if (locale === 'bn') return s.labelBn || s.labelEn;
  return s.labelEn;
}

function pickHeroText(opts: { en?: string; bn?: string }, locale: 'en' | 'bn'): string {
  if (locale === 'bn') return opts.bn || opts.en || '';
  return opts.en || opts.bn || '';
}

export function HeroSection() {
  const { locale } = useLocale();
  const isBn = locale === 'bn';
  const { data: hero } = useHeroSection();
  const { data: globe } = useGlobeData();

  const stats = hero?.stats?.length ? hero.stats : STAT_FALLBACK;
  const quickPlaces = hero?.quickPlaces?.length ? hero.quickPlaces : QUICK_PLACES_FALLBACK;

  const showHero = hero?.isActive !== false;

  const cities: GlobeCity[] = globe?.cities ?? [];
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
        <header className="relative z-10 text-center lg:text-left">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full text-[10px] tracking-widest uppercase font-bold border"
            style={{
              color: 'var(--color-secondary)',
              borderColor: 'color-mix(in oklab, var(--color-secondary) 30%, transparent)',
              backgroundColor: 'color-mix(in oklab, var(--color-secondary) 5%, transparent)',
            }}
          >
            <FileCheck className="w-3 h-3" />
            {hero ? pickHeroText({ en: hero.badgeTextEn, bn: hero.badgeTextBn }, locale) : 'Loading…'}
          </span>

          <h1
            className="font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-6xl lg:text-7xl"
            style={{ color: 'var(--color-hero-text)' }}
          >
            {pickHeroText({ en: hero?.titleLineAEn, bn: hero?.titleLineABn }, locale) || 'Your escape,'}{' '}
            <span className="gradient-text-warm">
              {pickHeroText({ en: hero?.titleLineBEn, bn: hero?.titleLineBBn }, locale) || 'purely refined.'}
            </span>
            <br />
            <span
              className="text-4xl font-semibold tracking-[-0.01em] sm:text-5xl lg:text-6xl"
              style={{ color: 'var(--color-hero-text)', opacity: 0.9 }}
            >
              {pickHeroText({ en: hero?.titleLineCEn, bn: hero?.titleLineCBn }, locale) || 'Discover the world with FlynGo.'}
            </span>
          </h1>

          <p
            className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg lg:mt-8 lg:mx-0 mx-auto"
            style={{ color: 'var(--color-hero-text-muted)' }}
          >
            {pickHeroText({ en: hero?.subtitleEn, bn: hero?.subtitleBn }, locale) ||
              'White-glove travel concierge for flights, hotels, tours, visas, and Hajj & Umrah.'}
          </p>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start lg:mt-10">
            <Link
              href="/tours"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition sm:text-base"
              style={{
                background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
                boxShadow: '0 12px 28px -8px color-mix(in oklab, var(--color-primary) 50%, transparent)',
              }}
            >
              <PlaneIcon className="h-4 w-4" />
              {pickHeroText({ en: hero?.ctaExploreEn, bn: hero?.ctaExploreBn }, locale) || 'Explore Tours'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/visa"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition sm:text-base"
              style={{
                background: 'linear-gradient(90deg, var(--color-tertiary) 0%, var(--color-tertiary) 100%)',
                boxShadow: '0 12px 28px -8px color-mix(in oklab, var(--color-tertiary) 50%, transparent)',
              }}
            >
              <FileCheck className="h-4 w-4" />
              {pickHeroText({ en: hero?.ctaVisaEn, bn: hero?.ctaVisaBn }, locale) || 'Visa Services'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/destinations"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl border px-8 py-3.5 text-sm font-semibold backdrop-blur-sm transition sm:text-base"
              style={{
                color: 'var(--color-hero-text)',
                borderColor: 'color-mix(in oklab, var(--color-hero-text) 20%, transparent)',
                backgroundColor: 'color-mix(in oklab, var(--color-hero-text) 5%, transparent)',
              }}
            >
              {pickHeroText({ en: hero?.ctaDestinationsEn, bn: hero?.ctaDestinationsBn }, locale) || 'Destinations'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {[
              { label: isBn ? 'ট্যুর প্যাকেজ' : 'Tour Packages', icon: Plane, token: 'primary' as const },
              { label: isBn ? 'ভিসা প্রসেসিং' : 'Visa Processing', icon: FileCheck, token: 'tertiary' as const },
              { label: isBn ? 'হজ্জ ও ওমরাহ' : 'Hajj & Umrah', icon: FileCheck, token: 'emerald' as const },
            ].map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                style={pillStyle(pill.token)}
              >
                <pill.icon className="w-3 h-3" />
                {pill.label}
              </span>
            ))}
          </div>

          <dl
            className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 sm:grid-cols-4 sm:gap-x-4 lg:mt-12 lg:mx-0 mx-auto"
            style={{ borderColor: 'color-mix(in oklab, var(--color-hero-text) 10%, transparent)' }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center lg:text-left min-w-0">
                <dt
                  className="text-[10px] uppercase tracking-[0.06em] whitespace-nowrap"
                  style={{ color: 'var(--color-hero-text-muted)' }}
                >
                  {pickStatLabel(stat, locale)}
                </dt>
                <dd
                  className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl whitespace-nowrap"
                  style={{ color: 'var(--color-hero-text)' }}
                >
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
            {quickPlaces.map((place) => (
              <button
                key={place}
                className="rounded-full border px-3 py-1.5 text-xs backdrop-blur-sm transition-colors"
                style={{
                  color: 'var(--color-hero-text-muted)',
                  borderColor: 'color-mix(in oklab, var(--color-hero-text) 10%, transparent)',
                  backgroundColor: 'color-mix(in oklab, var(--color-hero-text) 5%, transparent)',
                }}
              >
                {place}
              </button>
            ))}
          </div>
        </header>

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

type PillToken = 'primary' | 'tertiary' | 'emerald';

function pillStyle(token: PillToken): React.CSSProperties {
  if (token === 'emerald') {
    return {
      color: 'color-mix(in oklab, #10b981 75%, var(--color-hero-text) 25%)',
      borderColor: 'color-mix(in oklab, #10b981 30%, transparent)',
      backgroundColor: 'color-mix(in oklab, #10b981 8%, transparent)',
    };
  }
  const base = token === 'primary' ? 'var(--color-primary)' : 'var(--color-tertiary)';
  return {
    color: `color-mix(in oklab, ${base} 75%, var(--color-hero-text) 25%)`,
    borderColor: `color-mix(in oklab, ${base} 20%, transparent)`,
    backgroundColor: `color-mix(in oklab, ${base} 5%, transparent)`,
  };
}

export default HeroSection;
