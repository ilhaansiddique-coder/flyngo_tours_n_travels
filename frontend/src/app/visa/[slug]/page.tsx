'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency } from '@/lib/utils';
import { ArrowLeft, Clock, Check, Briefcase, FileCheck } from 'lucide-react';

interface VisaCountry {
  id: string;
  name: string;
  slug: string;
  flagUrl?: string;
  imageUrl?: string;
  region?: string;
  visaTypes: string[];
  processingTime?: string;
  fee: number;
  currency: string;
  requirements: string[];
  description?: string;
  isActive: boolean;
}

export default function VisaCountryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { getVisaCountries } = useApi();
  const fmt = useFormatCurrency();
  const [country, setCountry] = useState<VisaCountry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVisaCountries({ limit: '100' })
      .then((r: any) => {
        const found = (r?.items ?? []).find((c: VisaCountry) => c.slug === slug);
        setCountry(found ?? null);
      })
      .finally(() => setLoading(false));
  }, [slug, getVisaCountries]);

  if (loading) {
    return (
      <main className="min-h-screen pt-32 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  if (!country) {
    return (
      <main className="min-h-screen pt-32 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <Link href="/visa" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline" style={{ color: 'var(--color-nav-active)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to visa services
        </Link>
        <h1 className="text-2xl font-display font-bold">Visa country not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
      <Link href="/visa" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline" style={{ color: 'var(--color-nav-active)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to visa services
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            {country.flagUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={country.flagUrl} alt={country.name} className="w-16 h-10 object-cover rounded border" />
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">{country.name} Visa</h1>
              <p className="text-sm text-muted capitalize">{country.region?.replace('_', ' ')}</p>
            </div>
          </div>

          {country.description && (
            <p className="text-on-surface-variant mb-8 leading-relaxed">{country.description}</p>
          )}

          <section className="mb-8">
            <h2 className="text-xl font-display font-semibold mb-4">Visa types</h2>
            <div className="flex flex-wrap gap-2">
              {country.visaTypes.map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-full text-sm font-semibold capitalize" style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 12%, transparent)', color: 'var(--color-nav-active)' }}>
                  {t}
                </span>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5" /> Requirements
            </h2>
            <ul className="space-y-2">
              {country.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                  <span className="text-on-surface">{r}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold mb-4">How it works</h2>
            <ol className="space-y-3">
              {[
                'Submit your details and we will email a checklist.',
                'Send us the documents (we can collect or you can drop off).',
                'We review and submit to the embassy / consulate.',
                'You receive the visa and we deliver the passport.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full inline-flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}>
                    {i + 1}
                  </span>
                  <span className="text-on-surface pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 self-start">
          <div className="rounded-2xl border glass p-6" style={{ borderColor: 'var(--color-outline-variant)' }}>
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Visa fee</div>
            <div className="text-3xl font-display font-bold my-1">{fmt(country.fee, country.currency)}</div>
            <div className="text-xs text-muted">per applicant, taxes included</div>

            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-outline-variant)' }}>
              <div className="flex items-center gap-2 text-sm mb-3">
                <Clock className="w-4 h-4 text-muted" />
                <span>{country.processingTime || 'Contact us'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm mb-3">
                <Briefcase className="w-4 h-4 text-muted" />
                <span className="capitalize">{country.visaTypes.join(', ')}</span>
              </div>
            </div>

            <Link
              href={`/booking?type=visa&q=${encodeURIComponent(country.name)}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
            >
              Apply now
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
