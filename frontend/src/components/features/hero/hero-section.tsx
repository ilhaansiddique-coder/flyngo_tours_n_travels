'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Search, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import { CITIES, ROUTES } from '@/lib/geo';

const Globe = dynamic(() => import('./three/Globe').then((m) => m.default), {
  ssr: false,
  loading: () => <GlobeSkeleton />,
});

const ROUTE_CHIPS = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 4, to: 7 },
  { from: 5, to: 1 },
];

const STATS = [
  { value: '500+', label: 'Destinations' },
  { value: '50K+', label: 'Happy Travelers' },
  { value: '1K+', label: 'Tour Packages' },
  { value: '24/7', label: 'Concierge' },
];

const QUICK_PLACES = ['Bali', 'Dubai', 'Maldives', 'Switzerland', 'Thailand'];

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

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#020617]">
      {/* Backdrop layers: grid + dual-tone radial wash (blue + orange) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-70" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 72% 38%, rgba(24,129,255,0.22), transparent 70%), radial-gradient(ellipse 40% 35% at 18% 65%, rgba(243,101,35,0.16), transparent 70%)',
          }}
        />
      </div>

      <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-16 lg:px-16 lg:py-24">
        {/* ------------------ left: copy + CTAs + search ------------------ */}
        <header className="relative z-10 text-center lg:text-left">
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.02em] text-white sm:text-6xl lg:text-7xl">
            Discover{' '}
            <span className="gradient-text-warm">the World</span>
            <br />
            <span className="text-4xl font-semibold tracking-[-0.01em] opacity-90 sm:text-5xl lg:text-6xl">Your Way</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg lg:mt-8 lg:mx-0 mx-auto">
            Book extraordinary tours, flights, hotels, and visa services with AI-powered
            recommendations tailored just for you.
          </p>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start lg:mt-10">
            <Link
              href="/tours"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-amber-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-500 hover:to-amber-400 sm:text-base"
            >
              <PlaneIcon className="h-4 w-4" />
              Explore Tours
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:text-base"
            >
              View Destinations
              <span aria-hidden>→</span>
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-4 lg:mt-12 lg:mx-0 mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <dt className="text-[10px] uppercase tracking-widest text-gray-500">
                  {stat.label}
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Search widget — flows in left column on desktop, full width on mobile */}
          <div className="mt-10 lg:mt-12">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-2 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-blue-400/40 focus-within:border-blue-400/60 focus-within:bg-white/10">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Where do you want to go?"
                    className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                  />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-blue-400/40 focus-within:border-blue-400/60 sm:w-44">
                  <Calendar className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Add dates"
                    className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                  />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-blue-400/40 focus-within:border-blue-400/60 sm:w-40">
                  <Users className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Guests"
                    className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                  />
                </div>
                <button className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-amber-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-500 hover:to-amber-400">
                  <Search className="h-5 w-5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {QUICK_PLACES.map((place) => (
                <button
                  key={place}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 backdrop-blur-sm transition-colors hover:border-white/20 hover:text-white"
                >
                  {place}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ------------------ right: globe ------------------ */}
        <div className="relative order-first lg:order-last">
          <div className="relative aspect-square w-full">
            <Globe />
          </div>

          {/* Floating route chips on the left of the globe */}
          <ul className="pointer-events-none absolute -left-3 top-4 hidden flex-col gap-2 sm:flex lg:-left-8">
            {ROUTE_CHIPS.slice(0, 3).map((r, i) => {
              const from = CITIES[r.from]?.name ?? '';
              const to = CITIES[r.to]?.name ?? '';
              return (
                <li
                  key={`${r.from}-${r.to}`}
                  className="route-chip"
                  style={{ animationDelay: `${i * 0.6}s` }}
                >
                  <span className="route-dot" />
                  <span className="text-[11px] font-medium text-white">
                    {from} <span className="text-gray-500">→</span> {to}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Floating route chips on the right of the globe */}
          <ul className="pointer-events-none absolute -right-3 bottom-12 hidden flex-col items-end gap-2 sm:flex lg:-right-8">
            {ROUTE_CHIPS.slice(3).map((r, i) => {
              const from = CITIES[r.from]?.name ?? '';
              const to = CITIES[r.to]?.name ?? '';
              return (
                <li
                  key={`${r.from}-${r.to}`}
                  className="route-chip"
                  style={{ animationDelay: `${(i + 3) * 0.6}s` }}
                >
                  <span className="route-dot" />
                  <span className="text-[11px] font-medium text-white">
                    {from} <span className="text-gray-500">→</span> {to}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 animate-bounce lg:flex">
        <span className="text-[10px] uppercase tracking-widest text-blue-400/80">Scroll</span>
        <div className="flex h-8 w-5 justify-center rounded-full border border-blue-400/40 pt-1">
          <div className="h-2 w-1 rounded-full bg-amber-500 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
