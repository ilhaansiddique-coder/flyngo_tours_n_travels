'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency } from '@/lib/utils';
import { Briefcase, Clock, FileCheck, ArrowRight } from 'lucide-react';

interface VisaCountry {
  id: string;
  name: string;
  slug: string;
  flagUrl?: string;
  region?: string;
  visaTypes: string[];
  processingTime?: string;
  fee: number;
  currency: string;
  isFeatured: boolean;
  order: number;
}

export default function VisaPage() {
  const { getVisaCountries } = useApi();
  const [countries, setCountries] = useState<VisaCountry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVisaCountries({ limit: '50' })
      .then((r: any) => setCountries(r?.items ?? []))
      .finally(() => setLoading(false));
  }, [getVisaCountries]);

  const featured = countries.filter((c) => c.isFeatured);
  const others = countries.filter((c) => !c.isFeatured);

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
            Hassle-free visa processing for popular destinations. Transparent fees, fast turnaround, dedicated support.
          </p>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-12">
        {loading ? (
          <p className="text-sm text-muted">Loading countries…</p>
        ) : countries.length === 0 ? (
          <p className="text-sm text-muted">No visa services available right now.</p>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface mb-6">Top destinations</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {featured.map((c) => (
                    <CountryCard key={c.id} country={c} />
                  ))}
                </div>
              </div>
            )}

            {others.length > 0 && (
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface mb-6">All visa services</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {others.map((c) => (
                    <CountryCard key={c.id} country={c} />
                  ))}
                </div>
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

function CountryCard({ country }: { country: VisaCountry }) {
  const fmt = useFormatCurrency();
  return (
    <Link
      href={`/visa/${country.slug}`}
      className="group flex flex-col rounded-2xl border glass overflow-hidden hover:-translate-y-1 transition-all"
      style={{ borderColor: 'var(--color-outline-variant)', boxShadow: '0 8px 24px -12px rgba(7,86,184,0.18)' }}
    >
      <div className="aspect-[5/3] overflow-hidden bg-on-surface-soft flex items-center justify-center">
        {country.flagUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={country.flagUrl} alt={country.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <Briefcase className="w-10 h-10 text-muted" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-on-surface mb-1">{country.name}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
          <Clock className="w-3 h-3" />
          <span>{country.processingTime || 'Contact us'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Visa fee</span>
          <span className="font-bold text-on-surface">{fmt(country.fee, country.currency)}</span>
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-nav-active)' }}>
          View details <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
