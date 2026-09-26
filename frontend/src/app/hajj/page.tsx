'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, Suspense } from 'react';
import Script from 'next/script';
import { useLocale } from '@/contexts/locale-context';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency, cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { useSearchQuery } from '@/hooks/use-search-query';
import { SearchResultsBanner } from '@/components/ui/search-results-banner';
import { CustomSelect } from '@/components/ui/select';
import {
  Clock,
  Phone,
  FileCheck,
  ArrowRight,
  Shield,
  Users,
  Plane,
  Sparkles,
  Eye,
  Globe,
  Compass,
  ShieldCheck,
  Headphones,
  Moon,
} from 'lucide-react';
import {
  COUNTRY_DIALS,
  DEFAULT_COUNTRY_CODE,
  findDialByCode,
} from '@/lib/country-dial-codes';
import { SeatCounter } from '@/components/marketing/seat-counter';
import { TrustBadges } from '@/components/marketing/trust-badges';
import { touristTripJsonLd, breadcrumbJsonLd, travelAgencyJsonLd } from '@/lib/seo-schema';
import { captureUtmFromUrl, trackEvent } from '@/lib/tracking-client';
import { hajjImage, umrahImage } from '@/lib/entity-image';
import { matchesSearch } from '@/lib/search';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://flyngo.world';

interface HajjPackage {
  id: string;
  title: string;
  titleBn?: string;
  slug: string;
  tier: string;
  durationDays: number;
  price: number;
  currency: string;
  makkahNights: number;
  madinahNights: number;
  highlights: string[];
  highlightsBn?: string[];
  inclusions: string[];
  inclusionsBn?: string[];
  isFeatured: boolean;
  order: number;
  totalSeats?: number;
  seatsBooked?: number;
  departureDate?: string | null;
  returnDate?: string | null;
  departureCities?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImage?: string | null;
}

interface UmrahPackage {
  id: string;
  title: string;
  titleBn?: string;
  slug?: string;
  durationDays: number;
  price: number;
  currency: string;
  makkahNights: number;
  madinahNights: number;
  addOnCity?: string;
  highlights: string[];
  highlightsBn?: string[];
  inclusions: string[];
  inclusionsBn?: string[];
  isFeatured: boolean;
  order: number;
  coverImageUrl?: string | null;
  imageUrl?: string | null;
}

type CombinedPackage =
  | ({ packageType: 'hajj' } & HajjPackage)
  | ({ packageType: 'umrah' } & UmrahPackage);

function HajjUmrahContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams?.get('type') || searchParams?.get('tab') || 'all';

  const { t, locale } = useLocale();
  const isBn = locale === 'bn';
  const { getHajjPackages, getUmrahPackages, submitHajjPreRegistration } = useApi();
  const setSelectedItem = useBookingStore((s) => s.setSelectedItem);
  const fmt = useFormatCurrency();
  const q = useSearchQuery();

  const [hajjPkgs, setHajjPkgs] = useState<HajjPackage[]>([]);
  const [umrahPkgs, setUmrahPkgs] = useState<UmrahPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Type filter: 'all' | 'hajj' | 'umrah'
  const [selectedType, setSelectedType] = useState<'all' | 'hajj' | 'umrah'>(
    initialType === 'hajj' || initialType === 'umrah' ? initialType : 'all'
  );

  // Sub-filters
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedAddon, setSelectedAddon] = useState<string | null>(null);

  // Pre-registration modal state
  const [showPreReg, setShowPreReg] = useState(false);
  const [preReg, setPreReg] = useState({
    fullName: '',
    phone: '',
    phoneCountry: DEFAULT_COUNTRY_CODE,
    email: '',
    district: '',
    travelers: 1,
    packageTier: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getHajjPackages({ limit: '100' }).catch(() => ({ data: [] })),
      getUmrahPackages({ limit: '100' }).catch(() => ({ data: [] })),
    ])
      .then(([hRes, uRes]: any[]) => {
        const hList = hRes?.data ?? hRes?.items ?? [];
        const uList = uRes?.items ?? uRes?.data ?? [];
        setHajjPkgs(hList.filter((p: any) => p.isActive !== false));
        setUmrahPkgs(uList.filter((p: any) => p.isActive !== false));
      })
      .finally(() => setLoading(false));
  }, [getHajjPackages, getUmrahPackages]);

  // Sync if query param changes externally
  useEffect(() => {
    const tParam = searchParams?.get('type') || searchParams?.get('tab');
    if (tParam === 'hajj' || tParam === 'umrah') {
      setSelectedType(tParam);
    }
  }, [searchParams]);

  const bookPackage = (id: string, type: 'hajj' | 'umrah') => {
    setSelectedItem(id);
    router.push(`/booking?type=${type}&id=${id}`);
  };

  // Distinct Hajj tiers
  const hajjTiers = useMemo(() => {
    const set = new Set<string>();
    for (const p of hajjPkgs) {
      if (p.tier) set.add(p.tier.trim());
    }
    return Array.from(set);
  }, [hajjPkgs]);

  // Distinct Umrah add-on destinations
  const addonPills = useMemo(() => {
    const set = new Set<string>();
    for (const p of umrahPkgs) {
      if (p.addOnCity) set.add(p.addOnCity.trim());
    }
    return Array.from(set);
  }, [umrahPkgs]);

  // Combined packages list based on selectedType
  const combinedPackages: CombinedPackage[] = useMemo(() => {
    const hajjTagged = hajjPkgs.map((p) => ({ ...p, packageType: 'hajj' as const }));
    const umrahTagged = umrahPkgs.map((p) => ({ ...p, packageType: 'umrah' as const }));

    if (selectedType === 'hajj') return hajjTagged;
    if (selectedType === 'umrah') return umrahTagged;
    return [...hajjTagged, ...umrahTagged];
  }, [hajjPkgs, umrahPkgs, selectedType]);

  // Filtered packages
  const shown = useMemo(() => {
    let result = combinedPackages;

    if (selectedType === 'hajj' && selectedTier) {
      result = result.filter(
        (p) => p.packageType === 'hajj' && p.tier?.toLowerCase() === selectedTier.toLowerCase()
      );
    }

    if (selectedType === 'umrah' && selectedAddon) {
      result = result.filter(
        (p) =>
          p.packageType === 'umrah' &&
          (p.addOnCity || '').toLowerCase().trim() === selectedAddon.toLowerCase().trim()
      );
    }

    if (q) {
      result = result.filter((p: any) =>
        matchesSearch(
          [
            p.title,
            p.titleBn,
            p.packageType,
            p.tier,
            p.addOnCity,
            ...(p.highlights || []),
            ...(p.inclusions || []),
          ],
          q
        )
      );
    }

    return result;
  }, [combinedPackages, selectedType, selectedTier, selectedAddon, q]);

  const handlePreReg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const utm = captureUtmFromUrl();
      await submitHajjPreRegistration({
        ...preReg,
        travelers: Number(preReg.travelers) || 1,
        year: new Date().getFullYear() + 1,
        ...utm,
      });
      await trackEvent('submit_application', { contentName: 'hajj_pre_registration', value: 0 });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen surface-page pt-10">
      {/* Structured data — JSON-LD for SEO + AI search engines */}
      <Script id="ld-tourist-trip" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify([
          travelAgencyJsonLd({
            name: 'FlynGo',
            url: SITE_URL,
            logo: '/icon.png',
            priceRange: '$$-$$$$',
          }),
          breadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Hajj & Umrah', url: '/hajj' },
          ]),
          ...hajjPkgs.map((p) =>
            touristTripJsonLd({
              name: p.title,
              description:
                p.metaDescription ||
                `${p.durationDays}-day Hajj package with ${p.makkahNights} Makkah nights and ${p.madinahNights} Madinah nights`,
              url: `${SITE_URL}/hajj/${p.slug || ''}`,
              image: p.metaImage || undefined,
              price: Number(p.price),
              priceCurrency: p.currency,
              durationDays: p.durationDays,
              destination: 'Makkah, Saudi Arabia',
              departureCity:
                Array.isArray(p.departureCities) && p.departureCities.length
                  ? p.departureCities.join(', ')
                  : undefined,
              availability:
                p.totalSeats && p.totalSeats > 0 && p.totalSeats - (p.seatsBooked ?? 0) <= 0
                  ? 'https://schema.org/SoldOut'
                  : p.totalSeats && p.totalSeats > 0 && p.totalSeats - (p.seatsBooked ?? 0) <= 10
                  ? 'https://schema.org/LimitedAvailability'
                  : 'https://schema.org/InStock',
            })
          ),
          ...umrahPkgs.map((p) =>
            touristTripJsonLd({
              name: p.title,
              description: `${p.durationDays}-day Umrah package with ${p.makkahNights} Makkah nights and ${p.madinahNights} Madinah nights${
                p.addOnCity ? ` plus ${p.addOnCity}` : ''
              }`,
              url: `${SITE_URL}/umrah/${p.slug || ''}`,
              image: p.coverImageUrl || p.imageUrl || undefined,
              price: Number(p.price),
              priceCurrency: p.currency,
              durationDays: p.durationDays,
              destination: p.addOnCity
                ? `Makkah, Saudi Arabia & ${p.addOnCity}`
                : 'Makkah, Saudi Arabia',
              availability: 'https://schema.org/InStock',
            })
          ),
        ])}
      </Script>

      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 50% 40% at 30% 30%, color-mix(in oklab, #10b981 16%, transparent), transparent 70%), radial-gradient(ellipse 40% 35% at 80% 70%, color-mix(in oklab, var(--color-tertiary) 14%, transparent), transparent 70%)',
            }}
          />
        </div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-1 sm:pt-2 pb-4 sm:pb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full text-[10px] tracking-widest uppercase font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 bg-emerald-500/10">
            <FileCheck className="w-3 h-3" />
            {t('hajj_hero_badge')}
          </span>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] text-on-surface mb-6 max-w-3xl">
            {t('hajj_hero_title')}{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent">
              {t('hajj_hero_title_b')}
            </span>
          </h1>

          <p className="text-lg text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
            {t('hajj_hero_sub')}
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href="#packages"
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, #10b981 0%, var(--color-tertiary) 100%)',
                boxShadow: '0 12px 28px -8px color-mix(in oklab, #10b981 30%, transparent)',
              }}
            >
              {t('hajj_cta_packages')}
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => setShowPreReg(true)}
              className="inline-flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-semibold glass hover:-translate-y-0.5 transition cursor-pointer"
              style={{
                color: 'var(--color-on-surface)',
                borderColor: 'var(--color-outline-variant)',
              }}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Hajj Pre-Register
            </button>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-semibold glass hover:-translate-y-0.5 transition"
              style={{
                color: 'var(--color-on-surface)',
                borderColor: 'var(--color-outline-variant)',
              }}
            >
              <Phone className="w-4 h-4 text-muted" />
              {t('hajj_cta_consult')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            {[
              {
                icon: Shield,
                label: isBn ? 'লাইসেন্সপ্রাপ্ত অপারেটর' : 'Licensed Operator',
                tint: 'text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
              },
              {
                icon: Users,
                label: isBn ? '৫০০০+ সন্তুষ্ট যাত্রী' : '5000+ Happy Pilgrims',
                tint: 'text-amber-700 dark:text-amber-300 border-amber-500/30',
              },
              {
                icon: Plane,
                label: isBn ? 'সরাসরি ফ্লাইট ও ৫★ হোটেল' : 'Direct Flights & 5★ Hotels',
                tint: 'text-blue-700 dark:text-blue-300 border-blue-500/30',
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${item.tint} glass`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-on-surface">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustBadges />

      <section id="packages" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-2 pb-16">
        {/* Navigation & Type Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="inline-flex p-1 rounded-2xl bg-surface-container border border-outline-variant glass">
            <button
              type="button"
              onClick={() => {
                setSelectedType('all');
                setSelectedTier(null);
                setSelectedAddon(null);
              }}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2',
                selectedType === 'all'
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              )}
            >
              <Globe className="w-4 h-4" />
              <span>{isBn ? 'সকল প্যাকেজ' : 'All Packages'}</span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  selectedType === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-container-highest text-muted'
                )}
              >
                {hajjPkgs.length + umrahPkgs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType('hajj');
                setSelectedAddon(null);
              }}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2',
                selectedType === 'hajj'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              )}
            >
              <Moon className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'হজ্জ' : 'Hajj'}</span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  selectedType === 'hajj'
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-container-highest text-muted'
                )}
              >
                {hajjPkgs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType('umrah');
                setSelectedTier(null);
              }}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2',
                selectedType === 'umrah'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              )}
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{isBn ? 'ওমরাহ' : 'Umrah'}</span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  selectedType === 'umrah'
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-container-highest text-muted'
                )}
              >
                {umrahPkgs.length}
              </span>
            </button>
          </div>

          {/* Hajj Pre-Registration Trigger Button */}
          <button
            type="button"
            onClick={() => setShowPreReg(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>{isBn ? 'হজ্জ প্রি-রেজিস্ট্রেশন' : 'Hajj Pre-Registration 2027'}</span>
          </button>
        </div>

        {/* Sub-filter Pills: Hajj Tiers */}
        {selectedType === 'hajj' && hajjTiers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              type="button"
              onClick={() => setSelectedTier(null)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border glass transition-all cursor-pointer',
                selectedTier === null
                  ? 'ring-2 ring-emerald-500/60 border-emerald-500/80 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200'
                  : 'text-on-surface-variant border-outline-variant hover:bg-surface-container'
              )}
            >
              All Hajj Tiers
            </button>
            {hajjTiers.map((tier) => {
              const isSelected = selectedTier?.toLowerCase() === tier.toLowerCase();
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(isSelected ? null : tier)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border glass transition-all cursor-pointer',
                    isSelected
                      ? 'ring-2 ring-emerald-500/60 border-emerald-500/80 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200'
                      : 'text-on-surface-variant border-outline-variant hover:bg-surface-container'
                  )}
                >
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  {tier.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-filter Pills: Umrah Add-on Cities */}
        {selectedType === 'umrah' && addonPills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              type="button"
              onClick={() => setSelectedAddon(null)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border glass transition-all cursor-pointer',
                selectedAddon === null
                  ? 'ring-2 ring-cyan-500/60 border-cyan-500/80 bg-cyan-500/15 text-cyan-900 dark:text-cyan-200'
                  : 'text-on-surface-variant border-outline-variant hover:bg-surface-container'
              )}
            >
              All Umrah Packages
            </button>
            {addonPills.map((city) => {
              const isSelected = selectedAddon?.toLowerCase() === city.toLowerCase();
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedAddon(isSelected ? null : city)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border glass transition-all cursor-pointer',
                    isSelected
                      ? 'ring-2 ring-cyan-500/60 border-cyan-500/80 bg-cyan-500/15 text-cyan-900 dark:text-cyan-200'
                      : 'text-on-surface-variant border-outline-variant hover:bg-surface-container'
                  )}
                >
                  <Sparkles className="w-3 h-3 text-cyan-500" />
                  + {city}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface">
            {selectedType === 'hajj'
              ? (isBn ? 'আমাদের হজ্জ প্যাকেজসমূহ' : 'Available Hajj Packages')
              : selectedType === 'umrah'
              ? (isBn ? 'আমাদের ওমরাহ প্যাকেজসমূহ' : 'Available Umrah Packages')
              : (isBn ? 'আমাদের হজ্জ ও ওমরাহ প্যাকেজসমূহ' : 'Available Hajj & Umrah Packages')}
          </h2>
          <span className="text-sm text-muted">
            {shown.length} {shown.length === 1 ? 'package' : 'packages'}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm">Loading pilgrimage packages…</p>
          </div>
        ) : combinedPackages.length === 0 ? (
          <div
            className="rounded-2xl border glass p-12 text-center"
            style={{ borderColor: 'var(--color-outline-variant)' }}
          >
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium text-on-surface">No packages available right now</p>
          </div>
        ) : (
          <>
            {(q || selectedTier || selectedAddon) && (
              <SearchResultsBanner
                query={q || selectedTier?.replace(/_/g, ' ') || selectedAddon || ''}
                count={shown.length}
                noun="packages"
              />
            )}

            {shown.length === 0 ? (
              <div
                className="rounded-2xl border glass p-12 text-center"
                style={{ borderColor: 'var(--color-outline-variant)' }}
              >
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">
                  No packages match &ldquo;{q || selectedTier || selectedAddon}&rdquo;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {shown.map((pkg) => {
                  const isHajj = pkg.packageType === 'hajj';
                  const displayTitle = isBn && pkg.titleBn ? pkg.titleBn : pkg.title;
                  const displayHighlights =
                    isBn && pkg.highlightsBn && pkg.highlightsBn.length > 0
                      ? pkg.highlightsBn
                      : pkg.highlights || [];
                  const imageUrl = isHajj ? hajjImage(pkg) : umrahImage(pkg);
                  const detailUrl = isHajj
                    ? (pkg.slug ? `/hajj/${pkg.slug}` : `/booking?type=hajj&id=${pkg.id}`)
                    : (pkg.slug ? `/umrah/${pkg.slug}` : `/booking?type=umrah&id=${pkg.id}`);

                  return (
                    <div
                      key={`${pkg.packageType}-${pkg.id}`}
                      className="group flex flex-col rounded-2xl border glass overflow-hidden hover:-translate-y-1 transition-all"
                      style={{
                        borderColor: 'var(--color-outline-variant)',
                        boxShadow: isHajj
                          ? '0 8px 24px -12px rgba(16, 185, 129, 0.22)'
                          : '0 8px 24px -12px rgba(6, 182, 212, 0.22)',
                      }}
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-amber-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={displayTitle}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-bold text-white shadow-md backdrop-blur-sm',
                              isHajj ? 'bg-emerald-600/90' : 'bg-cyan-600/90'
                            )}
                          >
                            {isHajj ? <Moon className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                            {isHajj ? 'Hajj' : 'Umrah'}
                          </span>
                          {pkg.isFeatured ? (
                            <span
                              className="px-2.5 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold text-white shadow"
                              style={{ backgroundColor: 'var(--color-accent)' }}
                            >
                              Featured
                            </span>
                          ) : null}
                        </div>

                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          {isHajj && (pkg as any).tier ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-black/50 text-white backdrop-blur-sm shadow border border-white/10">
                              {(pkg as any).tier.replace(/_/g, ' ')}
                            </span>
                          ) : null}
                          {!isHajj && (pkg as any).addOnCity ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-cyan-950 bg-cyan-300 shadow">
                              + {(pkg as any).addOnCity}
                            </span>
                          ) : null}
                        </div>

                        <span className="absolute bottom-2.5 left-3 right-3 truncate text-white font-display font-bold text-lg drop-shadow">
                          Makkah & Madinah{' '}
                          {!isHajj && (pkg as any).addOnCity ? `· + ${(pkg as any).addOnCity}` : ''}
                        </span>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={cn(
                              'text-[11px] uppercase tracking-widest font-bold',
                              isHajj
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-cyan-600 dark:text-cyan-400'
                            )}
                          >
                            {isHajj
                              ? `Hajj ${(pkg as any).tier ? '· ' + (pkg as any).tier.replace(/_/g, ' ') : 'Pilgrimage'}`
                              : (pkg as any).addOnCity
                              ? `Umrah + ${(pkg as any).addOnCity}`
                              : 'Umrah Journey'}
                          </span>
                        </div>

                        <h3 className="font-display text-lg font-semibold text-on-surface leading-snug line-clamp-2">
                          {displayTitle}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
                          <Clock className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                          <span>
                            {pkg.durationDays} {isBn ? 'দিন' : 'Days'} · {pkg.makkahNights}N Makkah ·{' '}
                            {pkg.madinahNights}N Madinah
                          </span>
                        </div>

                        {displayHighlights.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {displayHighlights.slice(0, 2).map((h: string, i: number) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant truncate max-w-[130px]"
                              >
                                {h}
                              </span>
                            ))}
                            {displayHighlights.length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant">
                                +{displayHighlights.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {isHajj && (
                          <div className="mt-3">
                            <SeatCounter packageId={pkg.id} currency={pkg.currency} />
                          </div>
                        )}

                        <div className="mt-auto pt-4 flex flex-col gap-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-muted">
                              {isBn ? 'শুরু' : 'Starts from'}
                            </div>
                            <div className="font-display text-2xl font-bold text-on-surface">
                              {fmt(pkg.price, pkg.currency)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant">
                            <Link
                              href={detailUrl}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-outline-variant px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {isBn ? 'বিস্তারিত' : 'Details'}
                            </Link>
                            <button
                              type="button"
                              onClick={() => bookPackage(pkg.id, pkg.packageType)}
                              className={cn(
                                'inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 cursor-pointer',
                                isHajj
                                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700'
                                  : 'bg-gradient-to-r from-cyan-600 to-blue-600'
                              )}
                            >
                              {isBn ? 'বুক করুন' : 'Book Now'}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div
          className="rounded-2xl border p-8 glass"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          <h3 className="font-display text-xl font-semibold text-on-surface mb-3">
            {isBn ? 'কেন আমাদের হজ্জ ও ওমরাহ সেবা বেছে নেবেন?' : 'Why choose our Hajj & Umrah service?'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <Compass className="w-5 h-5 text-emerald-500 mb-2" />
              <div className="font-semibold mb-1">
                {isBn ? 'অভিজ্ঞ মুয়াল্লিম ও আলেম গাইড' : 'Experienced Scholar Guidance'}
              </div>
              <p className="text-on-surface-variant">
                {isBn
                  ? 'হজ্জ ও ওমরাহর প্রতিটি রুকন ও হুকুম যথাযথভাবে পালনে সার্বক্ষণিক দিকনির্দেশনা।'
                  : 'Dedicated scholars providing step-by-step guidance through every essential ritual.'}
              </p>
            </div>
            <div>
              <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
              <div className="font-semibold mb-1">
                {isBn ? 'হারামের নিকটবর্তী হোটেল' : 'Verified Hotels Near Haram'}
              </div>
              <p className="text-on-surface-variant">
                {isBn
                  ? 'মক্কা ও মদিনার উভয় স্থানেই সাশ্রয়ী দূরত্বে বিশ্বস্ত হোটেল আবাসন।'
                  : 'Quality accommodations within close walking distance in both holy cities.'}
              </p>
            </div>
            <div>
              <Headphones className="w-5 h-5 text-emerald-500 mb-2" />
              <div className="font-semibold mb-1">
                {isBn ? '২৪/৭ সার্বক্ষণিক সার্বিক সহায়তা' : '24/7 Dedicated Support'}
              </div>
              <p className="text-on-surface-variant">
                {isBn
                  ? 'ঢাকা বিমানবন্দর থেকে সৌদি আরব এবং স্বদেশ প্রত্যাবর্তন পর্যন্ত সার্বক্ষণিক সেবা।'
                  : 'Complete end-to-end assistance from departure until your safe return home.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Registration Modal */}
      {showPreReg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowPreReg(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border bg-surface p-6 shadow-2xl"
            style={{ borderColor: 'var(--color-outline-variant)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-6">
                <Sparkles className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                <h3 className="font-display text-xl font-bold mb-2">Thank you</h3>
                <p className="text-sm text-muted mb-4">
                  Your Hajj pre-registration has been received. Our team will contact you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setShowPreReg(false);
                    setSubmitted(false);
                  }}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white cursor-pointer"
                  style={{ background: 'linear-gradient(90deg, #10b981 0%, var(--color-tertiary) 100%)' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handlePreReg} className="space-y-3">
                <h3 className="font-display text-xl font-bold mb-1">Hajj Pre-Registration</h3>
                <p className="text-xs text-muted mb-3">
                  Reserve your slot for upcoming Hajj. We will contact you with package options.
                </p>
                <input
                  required
                  placeholder="Full name"
                  value={preReg.fullName}
                  onChange={(e) => setPreReg({ ...preReg, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border bg-surface text-sm"
                  style={{ borderColor: 'var(--color-outline-variant)' }}
                />
                <div className="flex gap-2">
                  <div className="w-36 shrink-0">
                    <CustomSelect
                      value={preReg.phoneCountry}
                      onChange={(next) => {
                        const dial = findDialByCode(next)?.dial ?? '';
                        const raw = preReg.phone.replace(/^\+\d+\s*/, '');
                        setPreReg({ ...preReg, phoneCountry: next, phone: raw ? `${dial} ${raw}` : '' });
                      }}
                      options={COUNTRY_DIALS.map((c) => ({
                        value: c.code,
                        label: `${c.flag} ${c.dial}`,
                        description: c.name,
                      }))}
                      searchable
                      searchPlaceholder="Search country..."
                      aria-label="Country code"
                      minMenuWidth={220}
                    />
                  </div>
                  <input
                    required
                    type="tel"
                    placeholder="Phone"
                    value={
                      preReg.phone.startsWith('+')
                        ? preReg.phone.replace(/^\+\d+\s*/, '')
                        : preReg.phone
                    }
                    onChange={(e) => {
                      const dial = findDialByCode(preReg.phoneCountry)?.dial ?? '';
                      const num = e.target.value.replace(/^\s+/, '');
                      setPreReg({ ...preReg, phone: num ? `${dial} ${num}` : '' });
                    }}
                    className="flex-1 px-3 py-2 rounded-md border bg-surface text-sm"
                    style={{ borderColor: 'var(--color-outline-variant)' }}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={preReg.email}
                  onChange={(e) => setPreReg({ ...preReg, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border bg-surface text-sm"
                  style={{ borderColor: 'var(--color-outline-variant)' }}
                />
                <input
                  placeholder="District (optional)"
                  value={preReg.district}
                  onChange={(e) => setPreReg({ ...preReg, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border bg-surface text-sm"
                  style={{ borderColor: 'var(--color-outline-variant)' }}
                />
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="Number of travelers"
                  value={preReg.travelers}
                  onChange={(e) => setPreReg({ ...preReg, travelers: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-md border bg-surface text-sm"
                  style={{ borderColor: 'var(--color-outline-variant)' }}
                />
                <CustomSelect
                  value={preReg.packageTier}
                  onChange={(val) => setPreReg({ ...preReg, packageTier: val })}
                  options={[
                    { value: '', label: 'Preferred tier (optional)' },
                    ...hajjTiers.map((t) => ({ value: t, label: t.replace(/_/g, ' ') })),
                    ...hajjPkgs.map((p) => ({ value: p.tier || p.title, label: p.title })),
                  ]}
                  placeholder="Preferred tier (optional)"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPreReg(false)}
                    className="flex-1 px-4 py-2 rounded-md border text-sm cursor-pointer"
                    style={{ borderColor: 'var(--color-outline-variant)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 rounded-md text-sm font-semibold text-white cursor-pointer"
                    style={{ background: 'linear-gradient(90deg, #10b981 0%, var(--color-tertiary) 100%)' }}
                  >
                    {submitting ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function HajjPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-muted">Loading Hajj &amp; Umrah packages…</div>}>
      <HajjUmrahContent />
    </Suspense>
  );
}
