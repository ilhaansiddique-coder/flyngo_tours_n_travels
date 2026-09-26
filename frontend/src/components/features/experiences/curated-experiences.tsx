'use client';

import { ChevronLeft, ChevronRight, Plane, Play, Sparkles, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo, useRef } from 'react';
import { SectionHeading } from '@/components/ui/section-heading';
import { useApi } from '@/hooks/use-api';
import { useLocale } from '@/contexts/locale-context';

export interface ExperienceItem {
  id: string;
  badgeEn?: string;
  badgeBn?: string;
  badgeTone?: 'cyan' | 'amber' | 'rose' | 'emerald' | 'purple';
  titleEn: string;
  titleBn?: string;
  descriptionEn: string;
  descriptionBn?: string;
  locationEn: string;
  locationBn?: string;
  metaEn: string;
  metaBn?: string;
  image: string;
  ctaEn: string;
  ctaBn?: string;
  href: string;
  size?: 'lg' | 'sm';
  hasPlay?: boolean;
  isActive?: boolean;
}

export interface CuratedExperiencesConfig {
  eyebrowEn?: string;
  eyebrowBn?: string;
  titlePrefixEn?: string;
  titleHighlightEn?: string;
  titlePrefixBn?: string;
  titleHighlightBn?: string;
  subtitleEn?: string;
  subtitleBn?: string;
  actionLabelEn?: string;
  actionLabelBn?: string;
  actionHref?: string;
  statusTextEn?: string;
  statusTextBn?: string;
  items?: ExperienceItem[];
  isActive?: boolean;
}

const DEFAULT_EXPERIENCES: ExperienceItem[] = [
  {
    id: 'santorini',
    badgeEn: 'Seasonal Feature',
    badgeBn: 'মৌসুমি ফিচার',
    badgeTone: 'cyan',
    titleEn: 'The Santorini Sky Loft',
    titleBn: 'দ্য সান্তোরিনি স্কাই লফট',
    descriptionEn: 'Private jet transfers and cliffside glass villas. Redefining the Mediterranean escape with white-glove butler service and sunset yacht access.',
    descriptionBn: 'প্রাইভেট জেট স্থানান্তর ও ক্লিফসাইড গ্লাস ভিলা। বাটলার সেবা ও সূর্যাস্তের ইয়ট ভ্রমণসহ ভূমধ্যসাগরীয় এক অনন্য অভিজ্ঞতা।',
    locationEn: 'Santorini, Greece',
    locationBn: 'সান্তোরিনি, গ্রিস',
    metaEn: '7 nights · from $12,400',
    metaBn: '৭ রাত · $১২,৪০০ থেকে',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1600&q=80',
    ctaEn: 'Explore Destination',
    ctaBn: 'গন্তব্য দেখুন',
    href: '/destinations',
    size: 'lg',
  },
  {
    id: 'velocity',
    badgeEn: 'Velocity Club',
    badgeBn: 'ভেলোসিটি ক্লাব',
    badgeTone: 'amber',
    titleEn: 'Priority Skies',
    titleBn: 'প্রায়োরিটি স্কাইস',
    descriptionEn: 'Access to our exclusive fleet of light jets for short-haul precision.',
    descriptionBn: 'শর্ট-হোল ভ্রমণের জন্য আমাদের বিশেষ লাইট জেট বহরে অগ্রাধিকারভিত্তিক প্রবেশাধিকার।',
    locationEn: 'Worldwide',
    locationBn: 'বিশ্বব্যাপী',
    metaEn: 'Members only',
    metaBn: 'শুধুমাত্র সদস্যদের জন্য',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=80',
    ctaEn: 'Become a Member',
    ctaBn: 'মেম্বারশিপ নিন',
    href: '/booking',
    size: 'sm',
    hasPlay: true,
  },
  {
    id: 'maldives',
    badgeEn: 'New Listing',
    badgeBn: 'নতুন সংযোজন',
    badgeTone: 'rose',
    titleEn: 'Overwater Private Villa',
    titleBn: 'ওভারওয়াটার প্রাইভেট ভিলা',
    descriptionEn: 'Glass-floor suites, personal dive instructor, and a chef-on-call.',
    descriptionBn: 'গ্লাস-ফ্লোর স্যুট, ব্যক্তিগত ডাইভ প্রশিক্ষক এবং সার্বক্ষণিক শেফ সেবা।',
    locationEn: 'Maldives',
    locationBn: 'মালদ্বীপ',
    metaEn: '5 nights · from $8,900',
    metaBn: '৫ রাত · $৮,৯০০ থেকে',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80',
    ctaEn: 'Reserve Now',
    ctaBn: 'এখনই বুক করুন',
    href: '/destinations',
    size: 'sm',
  },
];

const BADGE_STYLES = {
  cyan: 'text-accent border-accent-soft bg-accent-soft',
  amber: 'text-amber-500 dark:text-amber-300 border-amber-500/30 dark:border-amber-400/40 bg-amber-500/5',
  rose: 'text-rose-500 dark:text-rose-300 border-rose-500/30 dark:border-rose-400/40 bg-rose-500/5',
  emerald: 'text-emerald-500 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-400/40 bg-emerald-500/5',
  purple: 'text-purple-500 dark:text-purple-300 border-purple-500/30 dark:border-purple-400/40 bg-purple-500/5',
} as const;

function BadgePill({ tone = 'cyan', children }: { tone?: keyof typeof BADGE_STYLES; children: React.ReactNode }) {
  const style = BADGE_STYLES[tone] || BADGE_STYLES.cyan;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold border backdrop-blur-md ${style}`}
    >
      <Sparkles className="w-3 h-3" />
      {children}
    </span>
  );
}

export function CuratedExperiences() {
  const { getCuratedExperiences } = useApi();
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [config, setConfig] = useState<CuratedExperiencesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const res = (await getCuratedExperiences()) as CuratedExperiencesConfig;
        if (!cancelled && res) {
          setConfig(res);
        }
      } catch {
        // Fallback to default config on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [getCuratedExperiences]);

  const items = useMemo(() => {
    const raw = config?.items;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.filter((i) => i.isActive !== false);
    }
    return DEFAULT_EXPERIENCES;
  }, [config]);

  if (config && config.isActive === false) {
    return null;
  }

  // Determine localized section heading values
  const eyebrow = isBn ? config?.eyebrowBn || 'বাছাইকৃত অভিজ্ঞতা' : config?.eyebrowEn || 'Curated Experiences';
  const titlePrefix = isBn ? config?.titlePrefixBn || 'বুকিংয়ের চেয়েও বেশি।' : config?.titlePrefixEn || 'Beyond booking.';
  const titleHighlight = isBn ? config?.titleHighlightBn || 'সাধারণের চেয়েও অনন্য।' : config?.titleHighlightEn || 'Beyond ordinary.';
  const subtitle = isBn
    ? config?.subtitleBn || 'যারা বিশ্বভ্রমণে সময়, গুণমান ও আভিজাত্যকে মূল্যায়ন করেন—তাদের জন্যই আমাদের বিশেষ পরিকল্পনা।'
    : config?.subtitleEn || 'Bespoke itineraries designed for those who value time, texture, and the quiet luxury of detail in their global travels.';
  const actionLabel = isBn ? config?.actionLabelBn || 'সব অভিজ্ঞতা দেখুন' : config?.actionLabelEn || 'View all experiences';
  const actionHref = config?.actionHref || '/destinations';
  const statusText = isBn ? config?.statusTextBn || 'লাইভ · প্রতিদিন আপডেট' : config?.statusTextEn || 'live · updated daily';

  // Handle carousel / pagination when there are more than 3 items
  const PAGE_SIZE = 3;
  const maxPage = Math.max(0, Math.ceil(items.length / PAGE_SIZE) - 1);
  const displayedItems = items.length <= 3 ? items : items.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

  const handlePrev = () => {
    setPageIndex((prev) => (prev > 0 ? prev - 1 : maxPage));
  };

  const handleNext = () => {
    setPageIndex((prev) => (prev < maxPage ? prev + 1 : 0));
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-32">
      <SectionHeading
        eyebrow={eyebrow}
        title={
          <>
            {titlePrefix} <span className="gradient-text-warm">{titleHighlight}</span>
          </>
        }
        subtitle={subtitle}
        action={{ label: actionLabel, href: actionHref }}
      />

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="uppercase tracking-[0.15em] font-semibold">
            {items.length} {statusText}
          </span>
        </div>
        {items.length > 3 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-medium mr-1">
              {pageIndex + 1} / {maxPage + 1}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous experiences"
              className="w-10 h-10 rounded-full glass border-hairline-strong flex items-center justify-center text-muted hover:text-on-bg hover:border-accent-soft hover:bg-accent-soft transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next experiences"
              className="w-10 h-10 rounded-full glass border-hairline-strong flex items-center justify-center text-muted hover:text-on-bg hover:border-accent-soft hover:bg-accent-soft transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300">
        {displayedItems.map((exp, idx) => {
          const badge = isBn ? exp.badgeBn || exp.badgeEn : exp.badgeEn || exp.badgeBn;
          const title = isBn ? exp.titleBn || exp.titleEn : exp.titleEn || exp.titleBn;
          const description = isBn ? exp.descriptionBn || exp.descriptionEn : exp.descriptionEn || exp.descriptionBn;
          const location = isBn ? exp.locationBn || exp.locationEn : exp.locationEn || exp.locationBn;
          const meta = isBn ? exp.metaBn || exp.metaEn : exp.metaEn || exp.metaBn;
          const cta = isBn ? exp.ctaBn || exp.ctaEn : exp.ctaEn || exp.ctaBn;
          const isFeatured = exp.size === 'lg' || (displayedItems.length === 3 && idx === 0);

          return (
            <article
              key={exp.id || idx}
              onMouseEnter={() => setHovered(exp.id)}
              onMouseLeave={() => setHovered(null)}
              className={`group relative overflow-hidden rounded-3xl border border-outline-variant/50 bg-surface-container cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(12,22,40,0.08),0_16px_40px_-6px_rgba(12,22,40,0.12)] ${
                isFeatured ? 'md:col-span-2 h-[520px]' : 'h-[520px]'
              }`}
            >
              <div className="absolute inset-0">
                <img
                  src={exp.image}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 scrim-strong" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-background)]/60 via-transparent to-transparent" />
              </div>

              {badge && (
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <BadgePill tone={exp.badgeTone || 'cyan'}>{badge}</BadgePill>
                </div>
              )}

              {exp.hasPlay && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-on-surface-soft backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:scale-110 transition-all">
                    <Play className="w-6 h-6 text-on-bg group-hover:text-[var(--color-on-primary)] fill-current ml-0.5" />
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-10">
                <div className="flex items-center gap-2 text-xs text-muted mb-2">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span className="font-semibold">{location}</span>
                  {meta && (
                    <>
                      <span className="text-muted/60">·</span>
                      <span className="text-muted/80">{meta}</span>
                    </>
                  )}
                </div>
                <h3
                  className={`font-display font-bold text-on-bg leading-[1.1] tracking-[-0.02em] mb-2 ${
                    isFeatured ? 'text-3xl sm:text-4xl' : 'text-2xl'
                  }`}
                >
                  {title}
                </h3>
                <p className={`text-muted leading-relaxed mb-4 ${isFeatured ? 'max-w-md' : ''}`}>
                  {description}
                </p>
                <div className="flex items-center justify-between">
                  <Link
                    href={exp.href || '/destinations'}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white rounded-full px-5 py-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20"
                    style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))' }}
                  >
                    {cta || (isBn ? 'বিস্তারিত দেখুন' : 'Explore')}
                  </Link>
                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/60 font-semibold">
                    <Plane className="w-3 h-3" />
                    <span>{hovered === exp.id ? (isBn ? 'প্রস্তুত' : 'Ready') : (isBn ? 'দেখতে ট্যাপ করুন' : 'Tap to view')}</span>
                  </div>
                </div>
              </div>

              <div
                className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-accent) 60%, transparent), transparent)',
                }}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
