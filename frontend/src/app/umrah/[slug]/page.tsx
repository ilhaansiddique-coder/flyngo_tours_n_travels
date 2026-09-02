'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency } from '@/lib/utils';
import { umrahImage } from '@/lib/entity-image';
import { useBookingStore } from '@/stores/booking.store';
import { ReviewsSection } from '@/components/features/reviews/reviews-section';
import { ArrowLeft, Clock, Check, Moon, Coins, ArrowRight, Sparkles, MapPin } from 'lucide-react';

interface UmrahPackage {
  id: string;
  title: string;
  slug: string;
  durationDays: number;
  price: number;
  currency: string;
  makkahNights: number;
  madinahNights: number;
  addOnCity?: string | null;
  highlights?: string[];
  inclusions?: string[];
  pointsAwarded?: number;
  coverImageUrl?: string | null;
  imageUrl?: string | null;
}

export default function UmrahPackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { getUmrahPackages } = useApi();
  const setSelectedItem = useBookingStore((s) => s.setSelectedItem);
  const fmt = useFormatCurrency();
  const [pkg, setPkg] = useState<UmrahPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUmrahPackages({ limit: '100' });
        const all: UmrahPackage[] = ((res as any)?.items ?? []) as UmrahPackage[];
        setPkg(all.find((p) => p.slug === slug) ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, getUmrahPackages]);

  const book = () => {
    if (!pkg) return;
    setSelectedItem(pkg.id);
    router.push(`/booking?type=umrah&id=${pkg.id}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-32 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  if (!pkg) {
    return (
      <main className="min-h-screen pt-32 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <Link href="/umrah" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline" style={{ color: 'var(--color-nav-active)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Umrah packages
        </Link>
        <h1 className="text-2xl font-display font-bold">Umrah package not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
      <Link href="/umrah" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline" style={{ color: 'var(--color-nav-active)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Umrah packages
      </Link>

      {/* Cover banner */}
      <div className="relative mb-8 h-52 sm:h-64 rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-outline-variant)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={umrahImage(pkg, 1200, 500)}
          alt={pkg.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5">
          {pkg.addOnCity ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-amber-500/90 text-white">
              <Sparkles className="w-3 h-3" /> + {pkg.addOnCity}
            </span>
          ) : null}
          <h1 className="text-white text-3xl sm:text-4xl font-display font-bold drop-shadow mt-2">{pkg.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Clock, label: 'Duration', value: `${pkg.durationDays} days` },
              { icon: Moon, label: 'Makkah', value: `${pkg.makkahNights} nights` },
              { icon: Moon, label: 'Madinah', value: `${pkg.madinahNights} nights` },
              { icon: Coins, label: 'Points', value: `+${(pkg.pointsAwarded ?? 0).toLocaleString()}` },
            ].map((f) => (
              <div key={f.label} className="rounded-2xl border glass p-4" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <f.icon className="w-4 h-4 text-emerald-500 mb-1.5" />
                <div className="text-[10px] uppercase tracking-widest text-muted">{f.label}</div>
                <div className="font-display font-bold text-on-surface">{f.value}</div>
              </div>
            ))}
          </div>

          {Array.isArray(pkg.highlights) && pkg.highlights.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold mb-4">Highlights</h2>
              <div className="flex flex-wrap gap-2">
                {pkg.highlights.map((h, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: 'color-mix(in oklab, #10b981 12%, transparent)', color: 'var(--color-nav-active)' }}>
                    {h}
                  </span>
                ))}
              </div>
            </section>
          )}

          {Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold mb-4">What&apos;s included</h2>
              <ul className="space-y-2">
                {pkg.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                    <span className="text-on-surface">{inc}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {pkg.addOnCity ? (
            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold mb-4">Add-on city</h2>
              <div className="flex items-center gap-2 text-on-surface"><MapPin className="w-4 h-4 text-muted" /> Combined trip via {pkg.addOnCity}</div>
            </section>
          ) : null}

          <section>
            <h2 className="text-xl font-display font-semibold mb-4">How it works</h2>
            <ol className="space-y-3">
              {[
                'Reserve your spot with a booking — earn loyalty points on completion.',
                'We confirm your package, visa and flight details.',
                'Complete payment; we arrange hotels near the Haram and transport.',
                'Travel with guided ziyarat and 24/7 on-ground support.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full inline-flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ background: 'linear-gradient(90deg, #10b981 0%, var(--color-tertiary) 100%)' }}>
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
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Package price</div>
            <div className="text-3xl font-display font-bold my-1">{fmt(pkg.price, pkg.currency)}</div>
            <div className="text-xs text-muted">per pilgrim</div>

            {pkg.pointsAwarded ? (
              <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-amber-600 bg-amber-500/10 border border-amber-500/30">
                <Coins className="w-3.5 h-3.5" /> Earn +{pkg.pointsAwarded.toLocaleString()} points
              </div>
            ) : null}

            <div className="mt-4 pt-4 border-t space-y-3 text-sm" style={{ borderColor: 'var(--color-outline-variant)' }}>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted" /> {pkg.durationDays} days</div>
              <div className="flex items-center gap-2"><Moon className="w-4 h-4 text-muted" /> {pkg.makkahNights}N Makkah · {pkg.madinahNights}N Madinah</div>
            </div>

            <button
              onClick={book}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(90deg, #10b981 0%, var(--color-tertiary) 100%)' }}
            >
              Book this package <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>

      <ReviewsSection itemType="umrah" itemId={pkg.id} />
    </main>
  );
}
