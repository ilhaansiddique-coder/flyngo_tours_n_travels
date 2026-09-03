'use client';

import Link from 'next/link';
import { ArrowRight, FileCheck, Plane } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { cityName } from '@/lib/geo';
import {
  useHeroSection,
  type HeroStat,
  type GlobeCity,
} from '@/hooks/use-homepage-data';

const STAT_FALLBACK: HeroStat[] = [
  { value: '500+', labelEn: 'Destinations', labelBn: 'গন্তব্য' },
  { value: '50K+', labelEn: 'Happy travelers', labelBn: 'খুশি যাত্রী' },
  { value: '1K+', labelEn: 'Tour packages', labelBn: 'ট্যুর প্যাকেজ' },
  { value: '24/7', labelEn: 'Concierge', labelBn: 'পরিষেবা' },
];

const QUICK_PLACES_FALLBACK = ['Bali', 'Dubai', 'Maldives', 'Switzerland', 'Thailand'];

function pickStatLabel(s: HeroStat, locale: 'en' | 'bn'): string {
  if (locale === 'bn') return s.labelBn || s.labelEn;
  return s.labelEn;
}

function pickHeroText(opts: { en?: string; bn?: string }, locale: 'en' | 'bn'): string {
  if (locale === 'bn') return opts.bn || opts.en || '';
  return opts.en || opts.bn || '';
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

export interface HeroIntroProps {
  /** Override the hero text container color tokens. Defaults to the hero palette. */
  surface?: 'hero' | 'page';
}

export function HeroIntro({ surface = 'hero' }: HeroIntroProps) {
  const { locale } = useLocale();
  const isBn = locale === 'bn';
  const { data: hero } = useHeroSection();

  const stats = hero?.stats?.length ? hero.stats : STAT_FALLBACK;
  const quickPlaces = hero?.quickPlaces?.length ? hero.quickPlaces : QUICK_PLACES_FALLBACK;

  const textColor = surface === 'hero' ? 'var(--color-hero-text)' : 'var(--color-on-surface, inherit)';
  const mutedColor = surface === 'hero' ? 'var(--color-hero-text-muted)' : 'var(--color-on-surface-variant, inherit)';
  const borderTint = surface === 'hero'
    ? 'color-mix(in oklab, var(--color-hero-text) 10%, transparent)'
    : 'color-mix(in oklab, currentColor 10%, transparent)';
  const chipBorder = surface === 'hero'
    ? 'color-mix(in oklab, var(--color-hero-text) 10%, transparent)'
    : 'color-mix(in oklab, currentColor 10%, transparent)';
  const chipBg = surface === 'hero'
    ? 'color-mix(in oklab, var(--color-hero-text) 5%, transparent)'
    : 'color-mix(in oklab, currentColor 5%, transparent)';

  return (
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
        style={{ color: textColor }}
      >
        {pickHeroText({ en: hero?.titleLineAEn, bn: hero?.titleLineABn }, locale) || 'Your escape,'}{' '}
        <span className="gradient-text-warm">
          {pickHeroText({ en: hero?.titleLineBEn, bn: hero?.titleLineBBn }, locale) || 'purely refined.'}
        </span>
        <br />
        <span
          className="text-4xl font-semibold tracking-[-0.01em] sm:text-5xl lg:text-6xl"
          style={{ color: textColor, opacity: 0.9 }}
        >
          {pickHeroText({ en: hero?.titleLineCEn, bn: hero?.titleLineCBn }, locale) || 'Discover the world with FlynGo.'}
        </span>
      </h1>

      <p
        className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg lg:mt-8 lg:mx-0 mx-auto"
        style={{ color: mutedColor }}
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
          <Plane className="h-4 w-4" />
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
            color: textColor,
            borderColor: chipBorder,
            backgroundColor: chipBg,
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
        style={{ borderColor: borderTint }}
      >
        {stats.map((stat, i) => (
          <div key={i} className="text-center lg:text-left min-w-0">
            <dt
              className="text-[10px] uppercase tracking-[0.06em] whitespace-nowrap"
              style={{ color: mutedColor }}
            >
              {pickStatLabel(stat, locale)}
            </dt>
            <dd
              className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl whitespace-nowrap"
              style={{ color: textColor }}
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
              color: mutedColor,
              borderColor: chipBorder,
              backgroundColor: chipBg,
            }}
          >
            {place}
          </button>
        ))}
      </div>
    </header>
  );
}

export default HeroIntro;

// Re-export the cityName helper consumers may need.
export { cityName };
export type { GlobeCity };
