'use client';

import Link from 'next/link';
import { POPULAR_PACKAGES, Package } from '@/lib/packages';
import { useLocale } from '@/contexts/locale-context';
import { MapPin, Clock, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';

const ACCENT_BORDER: Record<NonNullable<Package['accent']>, string> = {
  blue: 'border-blue-500/30 hover:border-blue-500/70 dark:border-blue-400/40 dark:hover:border-blue-400/70',
  amber: 'border-amber-500/30 hover:border-amber-500/70 dark:border-amber-400/40 dark:hover:border-amber-400/70',
  emerald: 'border-emerald-500/30 hover:border-emerald-500/70 dark:border-emerald-400/40 dark:hover:border-emerald-400/70',
  rose: 'border-rose-500/30 hover:border-rose-500/70 dark:border-rose-400/40 dark:hover:border-rose-400/70',
};

const CATEGORY_LABEL: Record<Package['category'], { en: string; bn: string; tint: string }> = {
  tour:   { en: 'Tour',   bn: 'ট্যুর',   tint: 'text-blue-700 bg-blue-500/10 border-blue-500/30 dark:text-blue-300 dark:border-blue-400/20' },
  visa:   { en: 'Visa',   bn: 'ভিসা',   tint: 'text-amber-700 bg-amber-500/10 border-amber-500/30 dark:text-amber-300 dark:border-amber-400/20' },
  hajj:   { en: 'Hajj',   bn: 'হজ্জ',   tint: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-300 dark:border-emerald-400/20' },
  umrah:  { en: 'Umrah',  bn: 'ওমরাহ',  tint: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-300 dark:border-emerald-400/20' },
  custom: { en: 'Custom', bn: 'কাস্টম', tint: 'text-rose-700 bg-rose-500/10 border-rose-500/30 dark:text-rose-300 dark:border-rose-400/20' },
};

export function PopularPackages() {
  const { locale, t } = useLocale();
  const isBn = locale === 'bn';

  return (
    <section className="px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-32">
      <SectionHeading
        eyebrow="Handpicked"
        title={
          <>
            Popular <span className="gradient-text-warm">packages</span>
          </>
        }
        subtitle="Hand-picked journeys — tours, visa bundles, and pilgrimage packages designed around you."
        action={{ label: 'View all packages', href: '/booking' }}
      />

      <div className="flex items-center gap-3 mb-8 text-sm text-muted">
        <Sparkles className="w-4 h-4 text-accent" />
        <span>
          <span className="text-on-bg font-semibold">{POPULAR_PACKAGES.length} featured</span> · Updated weekly by our travel curators
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {POPULAR_PACKAGES.map((pkg) => {
          const cat = CATEGORY_LABEL[pkg.category];
          const accent = pkg.accent ?? 'blue';
          return (
            <Link
              key={pkg.id}
              href={pkg.href}
              className={`group relative flex flex-col overflow-hidden rounded-2xl glass border ${ACCENT_BORDER[accent]} card-elevated transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={isBn ? pkg.titleBn : pkg.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 scrim-soft" />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold border ${cat.tint} backdrop-blur-md`}>
                    {isBn ? cat.bn : cat.en}
                  </span>
                  {pkg.badge && (
                    <span
                      className="px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-on-primary)',
                        boxShadow: '0 12px 28px -8px var(--accent-glow-strong)',
                      }}
                    >
                      {isBn ? pkg.badgeBn : pkg.badge}
                    </span>
                  )}
                </div>
                <button
                  className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: 'color-mix(in oklab, var(--color-background) 40%, transparent)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid color-mix(in oklab, var(--color-on-background) 15%, transparent)',
                    color: 'var(--color-on-background)',
                  }}
                  aria-label="Save"
                  onClick={(e) => e.preventDefault()}
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-xl font-semibold text-on-bg mb-2 line-clamp-1 group-hover:text-accent transition-colors">
                  {isBn ? pkg.titleBn : pkg.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted mb-4">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span className="line-clamp-1">{pkg.destination}</span>
                </div>

                <ul className="space-y-1.5 mb-5 text-sm text-muted">
                  {(isBn ? pkg.highlightsBn : pkg.highlights).slice(0, 3).map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                      <span className="line-clamp-1">{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-4 border-t border-hairline flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted font-semibold">
                      {t('pkg_from')}
                    </div>
                    <div className="font-display text-2xl font-bold text-on-bg mt-1">
                      <span className="text-accent">${pkg.priceUsd.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-muted flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {pkg.durationDays} {isBn ? 'দিন' : 'days'}
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all"
                    style={{
                      backgroundColor: 'color-mix(in oklab, var(--color-on-background) 10%, transparent)',
                      color: 'var(--color-on-background)',
                      border: '1px solid color-mix(in oklab, var(--color-on-background) 15%, transparent)',
                    }}
                  >
                    {t('pkg_details')}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
