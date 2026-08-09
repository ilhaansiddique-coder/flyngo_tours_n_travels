'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { useState } from 'react';

interface Destination {
  name: string;
  country: string;
  region: 'Asia' | 'Europe' | 'Middle East' | 'Americas' | 'Africa';
  tours: number;
  hotels: number;
  startingPrice: number;
  image: string;
  tag?: string;
  tagTone?: 'accent' | 'tertiary';
}

const DESTINATIONS: Destination[] = [
  {
    name: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    tours: 24,
    hotels: 56,
    startingPrice: 2400,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80',
    tag: 'Trending',
    tagTone: 'tertiary',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    tours: 38,
    hotels: 89,
    startingPrice: 1380,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
    tag: 'Hot deal',
    tagTone: 'accent',
  },
  {
    name: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    tours: 19,
    hotels: 72,
    startingPrice: 1850,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
  },
  {
    name: 'Maldives',
    country: 'Maldives',
    region: 'Asia',
    tours: 12,
    hotels: 34,
    startingPrice: 3200,
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80',
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    tours: 21,
    hotels: 64,
    startingPrice: 2100,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
  },
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    tours: 32,
    hotels: 110,
    startingPrice: 1950,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
  },
];

const REGIONS = ['All', 'Asia', 'Europe', 'Middle East', 'Americas', 'Africa'] as const;

function Tag({ tone, children }: { tone: 'accent' | 'tertiary'; children: React.ReactNode }) {
  const styles: Record<typeof tone, React.CSSProperties> = {
    accent: { backgroundColor: 'var(--color-accent)', color: 'var(--color-on-primary)' },
    tertiary: { backgroundColor: 'var(--color-tertiary)', color: 'var(--color-on-tertiary)' },
  };
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
      style={styles[tone]}
    >
      {children}
    </span>
  );
}

export function DestinationsShowcase() {
  const [activeRegion, setActiveRegion] = useState<typeof REGIONS[number]>('All');

  const filtered =
    activeRegion === 'All'
      ? DESTINATIONS
      : DESTINATIONS.filter((d) => d.region === activeRegion);

  return (
    <section className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-32">
      <SectionHeading
        eyebrow="Featured Destinations"
        title={
          <>
            Where to <span className="gradient-text-warm">next?</span>
          </>
        }
        subtitle="A curated selection of destinations our travelers are booking this season."
        action={{ label: 'View all 500+ destinations', href: '/destinations' }}
      />

      <div className="flex flex-wrap gap-2 mb-8">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setActiveRegion(r)}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all ${
              activeRegion === r
                ? 'shadow-lg'
                : 'bg-on-surface-soft text-muted border-hairline-strong hover:border-soft hover:text-on-bg'
            }`}
            style={
              activeRegion === r
                ? {
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-on-primary)',
                    borderColor: 'var(--color-accent)',
                    boxShadow: '0 12px 28px -8px var(--accent-glow-strong)',
                  }
                : undefined
            }
          >
            {r}
            <span className="ml-1.5 text-[10px] opacity-60">
              {r === 'All' ? DESTINATIONS.length : DESTINATIONS.filter((d) => d.region === r).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((d) => (
          <a
            key={d.name}
            href={`/destinations/${d.name.toLowerCase()}`}
            className="group relative overflow-hidden rounded-2xl border border-hairline surface-card card-elevated hover-accent-ring transition-all duration-500 hover:-translate-y-1"
          >
            <div className="relative h-72 overflow-hidden">
              <img
                src={d.image}
                alt={d.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 scrim-soft" />
              {d.tag && (
                <div className="absolute top-4 left-4">
                  <Tag tone={d.tagTone || 'accent'}>{d.tag}</Tag>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:rotate-45"
                  style={{
                    backgroundColor: 'color-mix(in oklab, var(--color-background) 40%, transparent)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid color-mix(in oklab, var(--color-on-background) 15%, transparent)',
                    color: 'var(--color-on-background)',
                  }}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-1.5 text-xs text-on-bg/80 mb-1">
                  <MapPin className="w-3 h-3 text-accent" />
                  <span className="font-semibold">{d.country}</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-on-bg tracking-tight">
                  {d.name}
                </h3>
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-faint">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted font-semibold">Tours</div>
                  <div className="text-on-bg font-bold mt-0.5">{d.tours}</div>
                </div>
                <div className="h-6 w-px" style={{ backgroundColor: 'var(--color-outline-variant)' }} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted font-semibold">Hotels</div>
                  <div className="text-on-bg font-bold mt-0.5">{d.hotels}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-muted font-semibold">From</div>
                <div className="text-accent font-bold mt-0.5">${d.startingPrice.toLocaleString()}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
