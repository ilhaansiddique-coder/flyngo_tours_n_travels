'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { visaImage } from '@/lib/entity-image';
import { useSearchQuery } from '@/hooks/use-search-query';
import { SearchResultsBanner } from '@/components/ui/search-results-banner';
import { Briefcase, Clock, FileCheck, ArrowRight, Coins, Globe } from 'lucide-react';
import { matchesSearch } from '@/lib/search';

interface VisaCountry {
  id: string;
  name: string;
  slug: string;
  flagUrl?: string;
}

interface VisaService {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  processingTime?: string;
  requirements?: string[];
  pointsAwarded?: number;
  isActive: boolean;
  country?: { id: string; name: string; slug: string; flagUrl?: string };
  destination?: { id: string; name: string; slug: string };
}

export default function VisaPage() {
  const router = useRouter();
  const { getVisaCountries, getVisaServices } = useApi();
  const setSelectedItem = useBookingStore((s) => s.setSelectedItem);
  const fmt = useFormatCurrency();
  const q = useSearchQuery();
  const [countries, setCountries] = useState<VisaCountry[]>([]);
  const [services, setServices] = useState<VisaService[]>([]);
  const [loading, setLoading] = useState(true);

  const shownServices = useMemo(() => {
    if (!q) return services;
    // Tokenised so the autocomplete's "City, Country" label matches.
    return services.filter((s: any) =>
      matchesSearch([s.title, s.description, s.destination?.name, s.country?.name], q),
    );
  }, [services, q]);

  useEffect(() => {
    (async () => {
      try {
        const [countriesRes, servicesRes] = await Promise.all([
          getVisaCountries({ limit: '100' }),
          getVisaServices(),
        ]);
        setCountries((((countriesRes as any)?.data ?? (countriesRes as any)?.items ?? []) as VisaCountry[]));
        const all: VisaService[] = Array.isArray(servicesRes)
          ? (servicesRes as VisaService[])
          : ((servicesRes as any)?.data ?? (servicesRes as any)?.items ?? []);
        setServices(all.filter((s) => s.isActive !== false));
      } catch {
        // empty states handled below
      } finally {
        setLoading(false);
      }
    })();
  }, [getVisaCountries, getVisaServices]);

  const bookService = (id: string) => {
    setSelectedItem(id);
    router.push(`/booking?type=visa&id=${id}`);
  };

  const flagBySlug = Object.fromEntries(countries.map((c) => [c.slug, c.flagUrl]));
  const flagByName = Object.fromEntries(countries.map((c) => [c.name.toLowerCase(), c.flagUrl]));

  return (
    <main className="min-h-screen surface-page pt-24">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 50% 40% at 30% 30%, color-mix(in oklab, var(--color-primary) 14%, transparent), transparent 70%)',
            }}
          />
        </div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full text-[10px] tracking-widest uppercase font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30 bg-blue-500/10">
            <Briefcase className="w-3 h-3" />
            Visa Processing
          </span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] text-on-surface mb-6 max-w-3xl">
            Visa <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">made simple</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mb-10 leading-relaxed">
            Hassle-free visa processing for popular destinations. Transparent fees, fast turnaround, dedicated support — earn points on every completed visa.
          </p>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-8">
        {loading ? (
          <p className="text-sm text-muted">Loading visa services…</p>
        ) : (
          <>
            {/* Country quick navigation */}
            {countries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {countries.slice(0, 20).map((c) => (
                  <Link
                    key={c.id}
                    href={`/visa/${c.slug}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border glass hover:-translate-y-0.5 transition-all"
                    style={{ borderColor: 'var(--color-outline-variant)' }}
                  >
                    {c.flagUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.flagUrl} alt={c.name} className="w-5 h-4 object-cover rounded-sm" />
                    ) : (
                      <Globe className="w-4 h-4 text-muted" />
                    )}
                    {c.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Visa services (dynamic — created in the admin panel) */}
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface mb-6">
              Available visa services
            </h2>

            {services.length > 0 && <SearchResultsBanner query={q} count={shownServices.length} noun="visa services" />}

            {services.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">No visa services available yet</p>
                <p className="text-sm text-muted mt-1">Visa packages added by our team will appear here.</p>
              </div>
            ) : shownServices.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">No visa services match &ldquo;{q}&rdquo;.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {shownServices.map((s) => {
                  const countryName = s.destination?.name || s.country?.name;
                  const countrySlug = s.destination?.slug || s.country?.slug;
                  const flag = s.country?.flagUrl || flagBySlug[countrySlug || ''] || flagByName[(countryName || '').toLowerCase()];
                  return (
                    <div
                      key={s.id}
                      className="group flex flex-col rounded-2xl border glass overflow-hidden hover:-translate-y-1 transition-all"
                      style={{ borderColor: 'var(--color-outline-variant)', boxShadow: '0 8px 24px -12px rgba(7,86,184,0.18)' }}
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={visaImage(s)}
                          alt={countryName ? `${countryName} visa` : 'Visa service'}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        {flag ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={flag} alt="" className="absolute top-3 left-3 h-6 w-9 object-cover rounded shadow ring-1 ring-white/50" />
                        ) : null}
                        {s.pointsAwarded ? (
                          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold text-amber-900 bg-amber-300/95 shadow">
                            <Coins className="w-3.5 h-3.5" /> +{s.pointsAwarded.toLocaleString()} pts
                          </span>
                        ) : null}
                        {countryName ? (
                          <span className="absolute bottom-2.5 left-3 right-3 truncate text-white font-display font-bold text-lg drop-shadow">
                            {countryName}
                          </span>
                        ) : null}
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          {countryName ? (
                            <Link
                              href={countrySlug ? `/visa/${countrySlug}` : '/'}
                              className="text-[11px] uppercase tracking-widest font-bold text-blue-600 dark:text-blue-300 hover:underline"
                            >
                              {countryName}
                            </Link>
                          ) : (
                            <span />
                          )}
                        </div>
                        <h3 className="font-display text-lg font-semibold text-on-surface leading-snug">{s.title}</h3>

                        {s.processingTime && (
                          <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{s.processingTime}</span>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t flex items-end justify-between" style={{ borderColor: 'var(--color-outline-variant)' }}>
                          <div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Visa fee</div>
                            <div className="font-display text-2xl font-bold text-on-surface">{fmt(s.price, s.currency)}</div>
                          </div>
                          <button
                            onClick={() => bookService(s.id)}
                            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                            style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
                          >
                            Book now <ArrowRight className="w-4 h-4" />
                          </button>
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
          <h3 className="font-display text-xl font-semibold text-on-surface mb-3">Why choose our visa service?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <FileCheck className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">No hidden charges</div>
              <p className="text-on-surface-variant">The fee you see is the fee you pay. We itemize every charge upfront.</p>
            </div>
            <div>
              <Clock className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">Fast turnaround</div>
              <p className="text-on-surface-variant">Document review within 24 hours, embassy submission within 48 hours.</p>
            </div>
            <div>
              <Briefcase className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">End-to-end support</div>
              <p className="text-on-surface-variant">From form filling to interview prep, we handle every step.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
