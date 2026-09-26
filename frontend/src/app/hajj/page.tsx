'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Script from 'next/script';
import { useLocale } from '@/contexts/locale-context';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency } from '@/lib/utils';
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
import { hajjImage } from '@/lib/entity-image';
import { matchesSearch } from '@/lib/search';

// Canonical site URL for structured data. Must be a build-time constant (NOT
// window.location) so the JSON-LD is identical on server and client — otherwise
// the <Script> hydration mismatches and breaks the whole page's hydration,
// which stops the fetched packages from ever rendering.
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

export default function HajjPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isBn = locale === 'bn';
  const { getHajjPackages, submitHajjPreRegistration } = useApi();
  const setSelectedItem = useBookingStore((s) => s.setSelectedItem);
  const fmt = useFormatCurrency();
  const q = useSearchQuery();
  const [packages, setPackages] = useState<HajjPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

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
    getHajjPackages({ limit: '50' })
      .then((r: any) => {
        const list = r?.data ?? r?.items ?? [];
        setPackages(list.filter((p: any) => p.isActive !== false));
      })
      .finally(() => setLoading(false));
  }, [getHajjPackages]);

  const bookPackage = (id: string) => {
    setSelectedItem(id);
    router.push(`/booking?type=hajj&id=${id}`);
  };

  const tiers = useMemo(() => {
    const set = new Set<string>();
    for (const p of packages) {
      if (p.tier) set.add(p.tier);
    }
    return Array.from(set);
  }, [packages]);

  const shown = useMemo(() => {
    let result = packages;
    if (selectedTier) {
      result = result.filter((p) => p.tier?.toLowerCase() === selectedTier.toLowerCase());
    }
    if (q) {
      result = result.filter((p: any) =>
        matchesSearch([p.title, p.titleBn, p.name, p.description, p.destination?.name], q),
      );
    }
    return result;
  }, [packages, selectedTier, q]);

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
            { name: 'Hajj', url: '/hajj' },
          ]),
          ...packages.map((p) =>
            touristTripJsonLd({
              name: p.title,
              description:
                p.metaDescription ||
                `${p.durationDays}-day Hajj package with ${p.makkahNights} Makkah nights and ${p.madinahNights} Madinah nights`,
              url: `${SITE_URL}/hajj`,
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
            }),
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
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
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
              className="inline-flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-semibold glass hover:-translate-y-0.5 transition"
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
                label: isBn ? 'সরাসরি ফ্লাইট' : 'Direct Flights',
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

      <section id="packages" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-2 pb-8">
        {/* Tier filter pills */}
        {tiers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              type="button"
              onClick={() => setSelectedTier(null)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border glass hover:-translate-y-0.5 transition-all ${
                selectedTier === null
                  ? 'ring-2 ring-emerald-500/60 border-emerald-500/80 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200'
                  : ''
              }`}
              style={{ borderColor: selectedTier === null ? undefined : 'var(--color-outline-variant)' }}
            >
              <Globe className="w-4 h-4 text-muted" />
              All Packages
            </button>
            {tiers.map((tier) => {
              const isSelected = selectedTier?.toLowerCase() === tier.toLowerCase();
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(isSelected ? null : tier)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border glass hover:-translate-y-0.5 transition-all ${
                    isSelected
                      ? 'ring-2 ring-emerald-500/60 border-emerald-500/80 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200'
                      : ''
                  }`}
                  style={{ borderColor: isSelected ? undefined : 'var(--color-outline-variant)' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  {tier.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        )}

        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface mb-6">
          {isBn ? 'আমাদের হজ্জ প্যাকেজ' : 'Available Hajj packages'}
        </h2>

        {loading ? (
          <p className="text-sm text-muted">Loading packages…</p>
        ) : packages.length === 0 ? (
          <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium text-on-surface">No packages available right now</p>
          </div>
        ) : (
          <>
            {(q || selectedTier) && (
              <SearchResultsBanner
                query={q || selectedTier?.replace(/_/g, ' ') || ''}
                count={shown.length}
                noun="packages"
              />
            )}

            {shown.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">
                  No packages match &ldquo;{q || selectedTier}&rdquo;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {shown.map((pkg) => {
                  const displayTitle = isBn && pkg.titleBn ? pkg.titleBn : pkg.title;
                  const displayHighlights =
                    isBn && pkg.highlightsBn && pkg.highlightsBn.length > 0
                      ? pkg.highlightsBn
                      : pkg.highlights || [];

                  return (
                    <div
                      key={pkg.id}
                      className="group flex flex-col rounded-2xl border glass overflow-hidden hover:-translate-y-1 transition-all"
                      style={{
                        borderColor: 'var(--color-outline-variant)',
                        boxShadow: '0 8px 24px -12px rgba(16, 185, 129, 0.18)',
                      }}
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-700 to-amber-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={hajjImage(pkg)}
                          alt={displayTitle}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        {pkg.isFeatured ? (
                          <span
                            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold text-white shadow"
                            style={{ backgroundColor: 'var(--color-accent)' }}
                          >
                            Featured
                          </span>
                        ) : null}
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-black/40 text-white backdrop-blur-sm shadow">
                          {pkg.tier.replace(/_/g, ' ')}
                        </span>
                        <span className="absolute bottom-2.5 left-3 right-3 truncate text-white font-display font-bold text-lg drop-shadow">
                          Makkah & Madinah
                        </span>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400">
                            Hajj {pkg.tier.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <h3 className="font-display text-lg font-semibold text-on-surface leading-snug line-clamp-2">
                          {displayTitle}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
                          <Clock className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                          <span>
                            {pkg.durationDays} {isBn ? 'দিন' : 'Days'} · {pkg.makkahNights}N Makkah · {pkg.madinahNights}N Madinah
                          </span>
                        </div>

                        {displayHighlights.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {displayHighlights.slice(0, 2).map((h, i) => (
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

                        <div className="mt-3">
                          <SeatCounter packageId={pkg.id} currency={pkg.currency} />
                        </div>

                        <div className="mt-auto pt-4 flex flex-col gap-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-muted">
                              {isBn ? 'শুরু' : 'Starts from'}
                            </div>
                            <div className="font-display text-2xl font-bold text-on-surface">
                              {fmt(pkg.price, pkg.currency)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <Link
                              href={`/hajj/${pkg.slug}`}
                              className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border border-outline-variant text-on-surface hover:bg-surface-container-high transition hover:border-primary/50"
                            >
                              <Eye className="w-3.5 h-3.5 text-muted" />
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => bookPackage(pkg.id)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:opacity-90 shadow-sm"
                              style={{ background: 'linear-gradient(90deg, #10b981 0%, var(--color-tertiary) 100%)' }}
                            >
                              Book Now <ArrowRight className="w-3.5 h-3.5" />
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

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="rounded-2xl border p-8 glass" style={{ borderColor: 'var(--color-outline-variant)' }}>
          <h3 className="font-display text-xl font-semibold text-on-surface mb-3">
            {isBn ? 'কেন আমাদের হজ্জ সেবা বেছে নেবেন?' : 'Why choose our Hajj service?'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <Compass className="w-5 h-5 text-emerald-500 mb-2" />
              <div className="font-semibold mb-1">
                {isBn ? 'অভিজ্ঞ মুয়াল্লিম ও আলেম গাইড' : 'Experienced Scholar Guidance'}
              </div>
              <p className="text-on-surface-variant">
                {isBn
                  ? 'হজ্জের প্রতিটি রুকন ও হুকুম যথাযথভাবে পালনে সার্বক্ষণিক দিকনির্দেশনা।'
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
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white"
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
                    ...packages.map((p) => ({ value: p.tier, label: p.title })),
                  ]}
                  placeholder="Preferred tier (optional)"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPreReg(false)}
                    className="flex-1 px-4 py-2 rounded-md border text-sm"
                    style={{ borderColor: 'var(--color-outline-variant)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 rounded-md text-sm font-semibold text-white"
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
