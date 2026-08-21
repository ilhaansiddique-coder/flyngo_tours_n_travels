'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useLocale } from '@/contexts/locale-context';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency } from '@/lib/utils';
import { MapPin, Clock, Phone, FileCheck, ArrowRight, Shield, Users, Plane, Sparkles } from 'lucide-react';
import {
  COUNTRY_DIALS,
  DEFAULT_COUNTRY_CODE,
  findDialByCode,
} from '@/lib/country-dial-codes';
import { SeatCounter } from '@/components/marketing/seat-counter';
import { TrustBadges } from '@/components/marketing/trust-badges';
import { touristTripJsonLd, breadcrumbJsonLd, travelAgencyJsonLd } from '@/lib/seo-schema';
import { captureUtmFromUrl, trackEvent } from '@/lib/tracking-client';

interface HajjPackage {
  id: string;
  title: string;
  slug: string;
  tier: string;
  durationDays: number;
  price: number;
  currency: string;
  makkahNights: number;
  madinahNights: number;
  highlights: string[];
  inclusions: string[];
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
  const { t, locale } = useLocale();
  const isBn = locale === 'bn';
  const { getHajjPackages, submitHajjPreRegistration } = useApi();
  const fmt = useFormatCurrency();
  const [packages, setPackages] = useState<HajjPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreReg, setShowPreReg] = useState(false);
  const [preReg, setPreReg] = useState({ fullName: '', phone: '', phoneCountry: DEFAULT_COUNTRY_CODE, email: '', district: '', travelers: 1, packageTier: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getHajjPackages({ limit: '50' })
      .then((r: any) => setPackages(r?.items ?? []))
      .finally(() => setLoading(false));
  }, [getHajjPackages]);

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
    <main className="min-h-screen surface-page pt-24">
      {/* Structured data — JSON-LD for SEO + AI search engines */}
      <Script id="ld-tourist-trip" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify([
          travelAgencyJsonLd({
            name: 'FlynGo',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://flyngo.com',
            logo: '/icon.png',
            priceRange: '$$-$$$$',
          }),
          breadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Hajj', url: '/hajj' },
          ]),
          ...packages.map((p) => touristTripJsonLd({
            name: p.title,
            description: p.metaDescription || `${p.durationDays}-day Hajj package with ${p.makkahNights} Makkah nights and ${p.madinahNights} Madinah nights`,
            url: (typeof window !== 'undefined' ? window.location.origin : '') + `/hajj`,
            image: p.metaImage || undefined,
            price: Number(p.price),
            priceCurrency: p.currency,
            durationDays: p.durationDays,
            destination: 'Makkah, Saudi Arabia',
            departureCity: Array.isArray(p.departureCities) && p.departureCities.length ? p.departureCities.join(', ') : undefined,
            availability: p.totalSeats && p.totalSeats > 0 && (p.totalSeats - (p.seatsBooked ?? 0)) <= 0
              ? 'https://schema.org/SoldOut'
              : p.totalSeats && p.totalSeats > 0 && (p.totalSeats - (p.seatsBooked ?? 0)) <= 10
                ? 'https://schema.org/LimitedAvailability'
                : 'https://schema.org/InStock',
          })),
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

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-20">
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

          <p className="text-lg text-on-surface-variant max-w-2xl mb-10 leading-relaxed">
            {t('hajj_hero_sub')}
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#packages"
              className="inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition"
              style={{
                background: 'linear-gradient(90deg, #10b981 0%, var(--color-tertiary) 100%)',
                boxShadow: '0 12px 28px -8px color-mix(in oklab, #10b981 30%, transparent)',
              }}
            >
              {t('hajj_cta_packages')}
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setShowPreReg(true)}
              className="inline-flex items-center gap-2 rounded-2xl border px-8 py-3.5 text-sm font-semibold backdrop-blur-sm transition"
              style={{
                color: 'var(--color-on-surface)',
                borderColor: 'color-mix(in oklab, var(--color-on-surface) 20%, transparent)',
                backgroundColor: 'color-mix(in oklab, var(--color-on-surface) 5%, transparent)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              Hajj Pre-Register
            </button>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-2xl border px-8 py-3.5 text-sm font-semibold backdrop-blur-sm transition"
              style={{
                color: 'var(--color-on-surface)',
                borderColor: 'color-mix(in oklab, var(--color-on-surface) 20%, transparent)',
                backgroundColor: 'color-mix(in oklab, var(--color-on-surface) 5%, transparent)',
              }}
            >
              <Phone className="w-4 h-4" />
              {t('hajj_cta_consult')}
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            {[
              { icon: Shield, label: isBn ? 'লাইসেন্সপ্রাপ্ত অপারেটর' : 'Licensed Operator', tint: 'text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
              { icon: Users, label: isBn ? '৫০০০+ সন্তুষ্ট যাত্রী' : '5000+ Happy Pilgrims', tint: 'text-amber-700 dark:text-amber-300 border-amber-500/30' },
              { icon: Plane, label: isBn ? 'সরাসরি ফ্লাইট' : 'Direct Flights', tint: 'text-blue-700 dark:text-blue-300 border-blue-500/30' },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${item.tint} bg-on-surface-soft backdrop-blur-sm`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold text-on-surface">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustBadges />

      <section id="packages" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-20">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-on-surface mb-10">
          {isBn ? 'আমাদের প্যাকেজ' : 'Our Packages'}
        </h2>
        {loading ? (
          <p className="text-sm text-muted">Loading packages…</p>
        ) : packages.length === 0 ? (
          <p className="text-sm text-muted">No packages available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href="/booking"
                className="group relative flex flex-col overflow-hidden rounded-2xl glass border border-emerald-500/30 hover:border-emerald-500/60 transition-all hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-700 to-amber-700 flex items-center justify-center">
                  <Sparkles className="w-20 h-20 text-white/20" />
                  <div className="absolute inset-0 scrim-soft" />
                  {pkg.isFeatured && (
                    <span
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-on-primary)',
                        boxShadow: '0 12px 28px -8px var(--accent-glow-strong)',
                      }}
                    >
                      Featured
                    </span>
                  )}
                  <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-black/30 text-white backdrop-blur-sm">
                    {pkg.tier.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-display text-2xl font-semibold text-on-surface mb-2">{pkg.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {pkg.durationDays} {isBn ? 'দিন' : 'days'} · {pkg.makkahNights}N Makkah · {pkg.madinahNights}N Madinah
                    </span>
                  </div>

                  <ul className="space-y-1.5 mb-5 text-sm text-on-surface/80">
                    {pkg.highlights.slice(0, 4).map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mb-3">
                    <SeatCounter packageId={pkg.id} currency={pkg.currency} />
                  </div>

                  <div className="pt-4 border-t border-hairline flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {isBn ? 'শুরু' : 'Starts from'}
                      </div>
                      <div className="font-display text-2xl font-bold text-on-surface">
                        {fmt(pkg.price, pkg.currency)}
                      </div>
                      <div className="text-[10px] text-on-surface-variant">per person</div>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full text-xs font-bold transition-colors"
                      style={{
                        backgroundColor: 'color-mix(in oklab, #10b981 15%, transparent)',
                        color: 'var(--color-on-surface)',
                      }}
                    >
                      {t('pkg_book')}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
                <p className="text-sm text-muted mb-4">Your Hajj pre-registration has been received. Our team will contact you within 24 hours.</p>
                <button
                  onClick={() => { setShowPreReg(false); setSubmitted(false); }}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(90deg, #10b981 0%, var(--color-tertiary) 100%)' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handlePreReg} className="space-y-3">
                <h3 className="font-display text-xl font-bold mb-1">Hajj Pre-Registration</h3>
                <p className="text-xs text-muted mb-3">Reserve your slot for upcoming Hajj. We will contact you with package options.</p>
                <input required placeholder="Full name" value={preReg.fullName} onChange={(e) => setPreReg({ ...preReg, fullName: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-surface text-sm" style={{ borderColor: 'var(--color-outline-variant)' }} />
                <div className="flex gap-2">
                  <select
                    value={preReg.phoneCountry}
                    onChange={(e) => {
                      const next = e.target.value;
                      const dial = findDialByCode(next)?.dial ?? '';
                      const raw = preReg.phone.replace(/^\+\d+\s*/, '');
                      setPreReg({ ...preReg, phoneCountry: next, phone: raw ? `${dial} ${raw}` : '' });
                    }}
                    className="w-32 px-2 py-2 rounded-md border bg-surface text-sm"
                    style={{ borderColor: 'var(--color-outline-variant)' }}
                    aria-label="Country code"
                  >
                    {COUNTRY_DIALS.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.dial}
                      </option>
                    ))}
                  </select>
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
                <input type="email" placeholder="Email (optional)" value={preReg.email} onChange={(e) => setPreReg({ ...preReg, email: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-surface text-sm" style={{ borderColor: 'var(--color-outline-variant)' }} />
                <input placeholder="District (optional)" value={preReg.district} onChange={(e) => setPreReg({ ...preReg, district: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-surface text-sm" style={{ borderColor: 'var(--color-outline-variant)' }} />
                <input required type="number" min="1" placeholder="Number of travelers" value={preReg.travelers} onChange={(e) => setPreReg({ ...preReg, travelers: Number(e.target.value) })} className="w-full px-3 py-2 rounded-md border bg-surface text-sm" style={{ borderColor: 'var(--color-outline-variant)' }} />
                <select value={preReg.packageTier} onChange={(e) => setPreReg({ ...preReg, packageTier: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-surface text-sm" style={{ borderColor: 'var(--color-outline-variant)' }}>
                  <option value="">Preferred tier (optional)</option>
                  {packages.map((p) => <option key={p.id} value={p.tier}>{p.title}</option>)}
                </select>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowPreReg(false)} className="flex-1 px-4 py-2 rounded-md border text-sm" style={{ borderColor: 'var(--color-outline-variant)' }}>Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-md text-sm font-semibold text-white" style={{ background: 'linear-gradient(90deg, #10b981 0%, var(--color-tertiary) 100%)' }}>
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
