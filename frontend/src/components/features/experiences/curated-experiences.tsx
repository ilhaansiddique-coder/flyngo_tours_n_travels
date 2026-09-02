'use client';

import { ArrowUpRight, ChevronLeft, ChevronRight, Plane, Play, Sparkles, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { SectionHeading } from '@/components/ui/section-heading';

interface Experience {
  id: string;
  badge: string;
  badgeTone: 'cyan' | 'amber' | 'rose';
  title: string;
  description: string;
  location: string;
  meta: string;
  image: string;
  cta: string;
  href: string;
  size: 'lg' | 'sm';
  hasPlay?: boolean;
}

const EXPERIENCES: Experience[] = [
  {
    id: 'santorini',
    badge: 'Seasonal Feature',
    badgeTone: 'cyan',
    title: 'The Santorini Sky Loft',
    description: 'Private jet transfers and cliffside glass villas. Redefining the Mediterranean escape with white-glove butler service and sunset yacht access.',
    location: 'Santorini, Greece',
    meta: '7 nights · from $12,400',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1600&q=80',
    cta: 'Explore Destination',
    href: '/destinations',
    size: 'lg',
  },
  {
    id: 'velocity',
    badge: 'Velocity Club',
    badgeTone: 'amber',
    title: 'Priority Skies',
    description: 'Access to our exclusive fleet of light jets for short-haul precision.',
    location: 'Worldwide',
    meta: 'Members only',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=80',
    cta: 'Become a Member',
    href: '/booking',
    size: 'sm',
    hasPlay: true,
  },
  {
    id: 'maldives',
    badge: 'New Listing',
    badgeTone: 'rose',
    title: 'Overwater Private Villa',
    description: 'Glass-floor suites, personal dive instructor, and a chef-on-call.',
    location: 'Maldives',
    meta: '5 nights · from $8,900',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80',
    cta: 'Reserve Now',
    href: '/destinations',
    size: 'sm',
  },
];

const BADGE_STYLES = {
  cyan: 'text-accent border-accent-soft bg-accent-soft',
  amber: 'text-amber-500 dark:text-amber-300 border-amber-500/30 dark:border-amber-400/40 bg-amber-500/5',
  rose: 'text-rose-500 dark:text-rose-300 border-rose-500/30 dark:border-rose-400/40 bg-rose-500/5',
} as const;

function BadgePill({ tone, children }: { tone: Experience['badgeTone']; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold border backdrop-blur-md ${BADGE_STYLES[tone]}`}
    >
      <Sparkles className="w-3 h-3" />
      {children}
    </span>
  );
}

export function CuratedExperiences() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-32">
      <SectionHeading
        eyebrow="Curated Experiences"
        title={
          <>
            Beyond booking. <span className="gradient-text-warm">Beyond ordinary.</span>
          </>
        }
        subtitle="Bespoke itineraries designed for those who value time, texture, and the quiet luxury of detail in their global travels."
        action={{ label: 'View all experiences', href: '/destinations' }}
      />

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="uppercase tracking-[0.15em] font-semibold">3 live · updated daily</span>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Previous"
            className="w-10 h-10 rounded-full glass border-hairline-strong flex items-center justify-center text-muted hover:text-on-bg hover:border-accent-soft hover:bg-accent-soft transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            aria-label="Next"
            className="w-10 h-10 rounded-full glass border-hairline-strong flex items-center justify-center text-muted hover:text-on-bg hover:border-accent-soft hover:bg-accent-soft transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {EXPERIENCES.map((exp) => (
          <article
            key={exp.id}
            onMouseEnter={() => setHovered(exp.id)}
            onMouseLeave={() => setHovered(null)}
            className={`group relative overflow-hidden rounded-2xl border border-hairline surface-card card-elevated card-glow card-premium-border cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:border-accent-soft ${
              exp.size === 'lg' ? 'md:col-span-2 h-[520px]' : 'h-[520px]'
            }`}
          >
            <div className="absolute inset-0">
              <img
                src={exp.image}
                alt={exp.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 scrim-strong" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-background)]/60 via-transparent to-transparent" />
            </div>

            <div className="absolute top-5 left-5 flex items-center gap-2">
              <BadgePill tone={exp.badgeTone}>{exp.badge}</BadgePill>
            </div>

            {exp.hasPlay && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-16 h-16 rounded-full bg-on-surface-soft backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:scale-110 transition-all">
                  <Play className="w-6 h-6 text-on-bg group-hover:text-[var(--color-on-primary)] fill-current ml-0.5" />
                </div>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
              <div className="flex items-center gap-2 text-xs text-muted mb-3">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span className="font-semibold">{exp.location}</span>
                <span className="text-muted/60">·</span>
                <span className="text-muted/80">{exp.meta}</span>
              </div>
              <h3 className={`font-display font-bold text-on-bg leading-[1.1] tracking-[-0.02em] mb-3 ${exp.size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>
                {exp.title}
              </h3>
              <p className={`text-muted leading-relaxed mb-6 ${exp.size === 'lg' ? 'max-w-md' : ''}`}>
                {exp.description}
              </p>
              <div className="flex items-center justify-between">
                <Link
                  href={exp.href}
                  className="group/btn inline-flex items-center gap-2 text-sm font-bold text-on-bg hover:text-accent transition-colors duration-300"
                >
                  {exp.cta}
                  <span className="w-7 h-7 rounded-full border border-soft group-hover/btn:border-accent group-hover/btn:bg-accent group-hover/btn:text-[var(--color-on-accent)] flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted font-semibold">
                  <Plane className="w-3 h-3" />
                  <span>{hovered === exp.id ? 'Ready' : 'Tap to view'}</span>
                </div>
              </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: 'linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-accent) 60%, transparent), transparent)' }} />
          </article>
        ))}
      </div>
    </section>
  );
}
