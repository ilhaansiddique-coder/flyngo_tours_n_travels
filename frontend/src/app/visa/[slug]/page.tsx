'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency } from '@/lib/utils';
import { visaImage } from '@/lib/entity-image';
import { useBookingStore } from '@/stores/booking.store';
import { ReviewsSection } from '@/components/features/reviews/reviews-section';
import { ArrowLeft, Clock, Check, Briefcase, FileCheck, Coins, ArrowRight } from 'lucide-react';

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

interface VisaService {
  id: string;
  title: string;
  price: number;
  currency: string;
  processingTime?: string;
  requirements?: string[];
  pointsAwarded?: number;
  description?: string;
  isActive: boolean;
  country?: { id: string; name: string; slug: string };
  destination?: { id: string; name: string; slug: string };
}

export default function VisaCountryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { getVisaCountries, getVisaServices } = useApi();
  const setSelectedItem = useBookingStore((s) => s.setSelectedItem);
  const fmt = useFormatCurrency();
  const [country, setCountry] = useState<VisaCountry | null>(null);
  const [services, setServices] = useState<VisaService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [countriesRes, servicesRes] = await Promise.all([
          getVisaCountries({ limit: '100' }),
          getVisaServices(),
        ]);
        const found = (((countriesRes as any)?.items ?? []) as VisaCountry[]).find((c) => c.slug === slug);
        setCountry(found ?? null);

        // Match this country's visa services by name/slug (services link to a
        // Destination, which is kept in sync with the VisaCountry on the admin side).
        const all: VisaService[] = Array.isArray(servicesRes)
          ? (servicesRes as VisaService[])
          : ((servicesRes as any)?.items ?? []);
        setServices(
          all.filter(
            (s) =>
              (s.destination?.name || s.country?.name) === found?.name ||
              s.destination?.slug === found?.slug ||
              s.country?.slug === found?.slug,
          ),
        );
      } catch {
        // bubble up nothing — the empty state handles it
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, getVisaCountries, getVisaServices]);

  const bookService = (id: string) => {
    setSelectedItem(id);
    router.push(`/booking?type=visa&id=${id}`);
  };

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

      {/* Country cover banner */}
      <div className="relative mb-8 h-48 sm:h-60 rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-outline-variant)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visaImage(country, 1200, 500)}
          alt={`${country.name} visa`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex items-center gap-3">
          {country.flagUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={country.flagUrl} alt="" className="w-12 h-8 object-cover rounded shadow ring-1 ring-white/50" />
          )}
          <div>
            <h1 className="text-white text-3xl sm:text-4xl font-display font-bold drop-shadow">{country.name} Visa</h1>
            {country.region && <p className="text-white/80 text-sm capitalize">{country.region.replace('_', ' ')}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div>
          {country.description && (
            <p className="text-on-surface-variant mb-8 leading-relaxed">{country.description}</p>
          )}

          {/* Available visa products */}
          <section className="mb-8">
            <h2 className="text-xl font-display font-semibold mb-4">Available services</h2>
            {services.length === 0 ? (
              <p className="text-sm text-muted">
                No visa packages yet for {country.name}. Contact us for custom processing.
              </p>
            ) : (
              <div className="space-y-4">
                {services.map((s) => (
                  <div key={s.id} className="rounded-2xl border glass p-5" style={{ borderColor: 'var(--color-outline-variant)' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold text-on-surface">{s.title}</h3>
                        <p className="text-sm text-muted mt-0.5">
                          {s.processingTime ? `Processing: ${s.processingTime}` : 'Processing time on request'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {s.pointsAwarded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-amber-600 bg-amber-500/10 border border-amber-500/30">
                            <Coins className="w-3.5 h-3.5" /> +{s.pointsAwarded.toLocaleString()} pts
                          </span>
                        ) : null}
                        <span className="text-2xl font-display font-bold text-on-surface">{fmt(s.price, s.currency)}</span>
                        <button
                          onClick={() => bookService(s.id)}
                          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                          style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
                        >
                          Book now <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {s.description && <p className="text-sm text-on-surface-variant mt-3">{s.description}</p>}

                    {Array.isArray(s.requirements) && s.requirements.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {s.requirements.map((r, i) => (
                          <li key={i} className="px-2.5 py-1 rounded-lg text-xs bg-surface-container/60 border border-outline-variant">{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {country.visaTypes.length > 0 && (
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
          )}

          {country.requirements.length > 0 && (
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
          )}

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
                <span className="capitalize">{country.visaTypes.join(', ') || 'Visa'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Coins className="w-4 h-4 text-muted" />
                <span>Earn points on every completed visa</span>
              </div>
            </div>

            <button
              // With no visa service configured there is nothing to price, and
              // the booking wizard used to resolve the missing id to the literal
              // string 'demo' — so this button reliably 404'd on submit. Send
              // the enquiry to Contact instead, pre-filled with the country.
              onClick={() =>
                services[0]
                  ? bookService(services[0].id)
                  : router.push(`/contact?subject=${encodeURIComponent(`Visa enquiry — ${country.name}`)}`)
              }
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
            >
              {services.length ? 'Book a visa' : 'Apply now'}
            </button>
          </div>
        </aside>
      </div>

      <ReviewsSection itemType="visa" itemId={country.id} />
    </main>
  );
}
