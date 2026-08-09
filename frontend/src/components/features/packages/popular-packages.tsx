'use client';

import Link from 'next/link';
import { POPULAR_PACKAGES, Package } from '@/lib/packages';
import { useLocale } from '@/contexts/locale-context';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

const ACCENT_BORDER: Record<NonNullable<Package['accent']>, string> = {
  blue: 'border-blue-400/40 hover:border-blue-400/70',
  amber: 'border-amber-400/40 hover:border-amber-400/70',
  emerald: 'border-emerald-400/40 hover:border-emerald-400/70',
  rose: 'border-rose-400/40 hover:border-rose-400/70',
};

const CATEGORY_LABEL: Record<Package['category'], { en: string; bn: string; tint: string }> = {
  tour: { en: 'Tour', bn: 'ট্যুর', tint: 'text-blue-300 bg-blue-500/10 border-blue-400/20' },
  visa: { en: 'Visa', bn: 'ভিসা', tint: 'text-amber-300 bg-amber-500/10 border-amber-400/20' },
  hajj: { en: 'Hajj', bn: 'হজ্জ', tint: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20' },
  umrah: { en: 'Umrah', bn: 'ওমরাহ', tint: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20' },
  custom: { en: 'Custom', bn: 'কাস্টম', tint: 'text-rose-300 bg-rose-500/10 border-rose-400/20' },
};

export function PopularPackages() {
  const { locale, t } = useLocale();
  const isBn = locale === 'bn';

  return (
    <section className="px-4 sm:px-6 lg:px-16 max-w-[1440px] mx-auto mb-32">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <span className="text-xs tracking-[0.25em] uppercase text-[#00eefc] font-semibold mb-3 block">
            {isBn ? 'হাতে বাছাই করা' : 'Handpicked'}
          </span>
          <h2 className="font-display text-4xl sm:text-[48px] leading-tight font-semibold text-white mb-3">
            {t('section_packages')}
          </h2>
          <p className="text-base text-white/60 max-w-xl">
            {t('section_packages_sub')}
          </p>
        </div>
        <Link
          href="/booking"
          className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-[#00eefc] transition-colors"
        >
          {isBn ? 'সব প্যাকেজ দেখুন' : 'View all packages'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {POPULAR_PACKAGES.map((pkg) => {
          const cat = CATEGORY_LABEL[pkg.category];
          const accent = pkg.accent ?? 'blue';
          return (
            <Link
              key={pkg.id}
              href={pkg.href}
              className={`group relative flex flex-col overflow-hidden rounded-2xl glass border ${ACCENT_BORDER[accent]} transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40`}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={isBn ? pkg.titleBn : pkg.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold border ${cat.tint}`}>
                    {isBn ? cat.bn : cat.en}
                  </span>
                  {pkg.badge && (
                    <span className="px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold text-surface bg-[#00eefc]">
                      {isBn ? pkg.badgeBn : pkg.badge}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-xl font-semibold text-white mb-2 line-clamp-1">
                  {isBn ? pkg.titleBn : pkg.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="line-clamp-1">{pkg.destination}</span>
                </div>

                <ul className="space-y-1.5 mb-5 text-sm text-white/70">
                  {(isBn ? pkg.highlightsBn : pkg.highlights).slice(0, 3).map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-[#00eefc] flex-shrink-0" />
                      <span className="line-clamp-1">{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50">
                      {t('pkg_from')}
                    </div>
                    <div className="font-display text-2xl font-bold text-white">
                      ${pkg.priceUsd.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {pkg.durationDays} {isBn ? 'দিন' : 'days'}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold bg-white/10 text-white group-hover:bg-[#00eefc] group-hover:text-surface transition-colors">
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
