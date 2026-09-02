'use client';

import {
  Plane,
  Hotel,
  Globe,
  Sparkles,
  Car,
  ArrowUpRight,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import Link from 'next/link';

interface Service {
  icon: typeof Plane;
  title: string;
  description: string;
  href: string;
  metric: string;
  metricLabel: string;
  tone: 'accent' | 'tertiary' | 'rose' | 'emerald' | 'blue' | 'violet';
}

const SERVICES: Service[] = [
  {
    icon: Plane,
    title: 'Tour Packages',
    description: 'Curated small-group and private tours to over 500 destinations worldwide.',
    href: '/tours',
    metric: '1,200+',
    metricLabel: 'Active tours',
    tone: 'accent',
  },
  {
    icon: Hotel,
    title: 'Luxury Hotels',
    description: 'Hand-picked 4- and 5-star properties, with VIP upgrades and club access.',
    href: '/hotels',
    metric: '8,500+',
    metricLabel: 'Hotels',
    tone: 'tertiary',
  },
  {
    icon: Plane,
    title: 'Flights',
    description: 'Best-fare search across 400+ airlines including private and chartered jets.',
    href: '/flights',
    metric: '400+',
    metricLabel: 'Airlines',
    tone: 'accent',
  },
  {
    icon: Globe,
    title: 'Visa Processing',
    description: 'Hassle-free documentation with 98% approval rate and express turnaround.',
    href: '/visa',
    metric: '98%',
    metricLabel: 'Approval',
    tone: 'emerald',
  },
  {
    icon: Sparkles,
    title: 'Hajj & Umrah',
    description: 'Licensed pilgrimage packages with 5-star stays steps from the Haram.',
    href: '/hajj',
    metric: '5,000+',
    metricLabel: 'Pilgrims served',
    tone: 'tertiary',
  },
  {
    icon: Car,
    title: 'Transport',
    description: 'Airport transfers, private cars, intercity coaches, and ferry bookings.',
    href: '/transport',
    metric: '200+',
    metricLabel: 'Cities',
    tone: 'rose',
  },
];

/* Tone palette — each entry uses a CSS variable so the same code renders
   correctly in both light and dark mode. `glow` and `ring` are only used
   for the hover ring/blur, so they need a literal color (not a utility). */
const TONE_STYLES: Record<Service['tone'], {
  iconText: string;          // tailwind utility class
  ring: string;              // CSS colour for the hover ring
  glow: string;              // CSS colour for the hover glow
  borderHover: string;       // border colour for hover (CSS)
  ringClass: string;         // tailwind utility class for the always-on ring
}> = {
  accent: {
    iconText: 'text-accent',
    ring: 'var(--color-accent)',
    glow: 'color-mix(in oklab, var(--color-accent) 18%, transparent)',
    borderHover: 'color-mix(in oklab, var(--color-accent) 40%, transparent)',
    ringClass: 'bg-accent-soft',
  },
  tertiary: {
    iconText: 'text-tertiary',
    ring: 'var(--color-tertiary)',
    glow: 'color-mix(in oklab, var(--color-tertiary) 18%, transparent)',
    borderHover: 'color-mix(in oklab, var(--color-tertiary) 40%, transparent)',
    ringClass: 'bg-[color-mix(in_oklab,var(--color-tertiary)_15%,transparent)]',
  },
  rose: {
    iconText: 'text-rose-500 dark:text-rose-300',
    ring: '#fb7185',
    glow: 'color-mix(in oklab, #fb7185 18%, transparent)',
    borderHover: 'color-mix(in oklab, #fb7185 40%, transparent)',
    ringClass: 'bg-rose-500/15 dark:bg-rose-500/20',
  },
  emerald: {
    iconText: 'text-emerald-600 dark:text-emerald-300',
    ring: '#10b981',
    glow: 'color-mix(in oklab, #10b981 18%, transparent)',
    borderHover: 'color-mix(in oklab, #10b981 40%, transparent)',
    ringClass: 'bg-emerald-500/15 dark:bg-emerald-500/20',
  },
  blue: {
    iconText: 'text-blue-500 dark:text-blue-300',
    ring: '#3b82f6',
    glow: 'color-mix(in oklab, #3b82f6 18%, transparent)',
    borderHover: 'color-mix(in oklab, #3b82f6 40%, transparent)',
    ringClass: 'bg-blue-500/15 dark:bg-blue-500/20',
  },
  violet: {
    iconText: 'text-violet-500 dark:text-violet-300',
    ring: '#8b5cf6',
    glow: 'color-mix(in oklab, #8b5cf6 18%, transparent)',
    borderHover: 'color-mix(in oklab, #8b5cf6 40%, transparent)',
    ringClass: 'bg-violet-500/15 dark:bg-violet-500/20',
  },
};

export function ServicesGrid() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-32">
      <SectionHeading
        eyebrow="End-to-end services"
        title={
          <>
            Everything you need, <span className="gradient-text-warm">in one place.</span>
          </>
        }
        subtitle="From the first search to the final transfer, FlynGo handles every detail of your journey with white-glove precision."
        action={{ label: 'Browse all services', href: '/destinations' }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICES.map((s) => {
          const tone = TONE_STYLES[s.tone];
          return (
            <Link
              key={s.title}
              href={s.href}
              className="group relative overflow-hidden rounded-2xl border border-hairline surface-card card-elevated card-glow card-premium-border p-7 transition-all duration-500 hover:-translate-y-1"
              style={{ '--tone': tone.ring, '--tone-glow': tone.glow, '--tone-border': tone.borderHover } as React.CSSProperties}
            >
              <div
                className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: `radial-gradient(circle, ${tone.glow} 0%, transparent 70%)` }}
              />

              <div className="relative flex items-start justify-between mb-8">
                <div className="relative">
                  <div
                    className="absolute inset-0 blur-xl opacity-20 group-hover:opacity-50 transition-opacity"
                    style={{ backgroundColor: tone.ring }}
                  />
                  <div
                    className="relative w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
                    style={{
                      border: '1px solid var(--color-outline-variant)',
                      backgroundColor: 'color-mix(in oklab, var(--color-on-background) 4%, transparent)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <s.icon className={`w-6 h-6 ${tone.iconText}`} />
                  </div>
                </div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:rotate-45"
                  style={{
                    border: '1px solid var(--color-outline-variant)',
                    color: 'var(--color-on-surface-variant)',
                  }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <h3 className="font-display text-2xl font-bold text-on-bg mb-2 tracking-tight">
                {s.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed mb-6">{s.description}</p>

              <div
                className="flex items-end justify-between pt-5"
                style={{ borderTop: '1px solid color-mix(in oklab, var(--color-on-surface) 5%, transparent)' }}
              >
                <div>
                  <div className={`font-display text-2xl font-bold tracking-tight ${tone.iconText}`}>
                    {s.metric}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted font-semibold mt-0.5">
                    {s.metricLabel}
                  </div>
                </div>
                <span className="text-xs font-semibold text-muted group-hover:text-accent transition-colors flex items-center gap-1">
                  Explore
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
