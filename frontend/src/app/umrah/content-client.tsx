'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '@/contexts/locale-context';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { useSearchQuery } from '@/hooks/use-search-query';
import { SearchResultsBanner } from '@/components/ui/search-results-banner';
import { umrahImage } from '@/lib/entity-image';
import { matchesSearch } from '@/lib/search';
import {
  Clock,
  ArrowRight,
  Eye,
  Shield,
  Users,
  Plane,
  Heart,
  Globe,
  Compass,
  ShieldCheck,
  Headphones,
  Sparkles,
} from 'lucide-react';

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

export function UmrahPageClient() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isBn = locale === 'bn';
  const { getUmrahPackages } = useApi();
  const setSelectedItem = useBookingStore((s) => s.setSelectedItem);
  const fmt = useFormatCurrency();
  const q = useSearchQuery();
  const [packages, setPackages] = useState<UmrahPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddon, setSelectedAddon] = useState<string | null>(null);

  useEffect(() => {
    getUmrahPackages({ limit: '50' })
      .then((r: any) => {
        const list = r?.items ?? r?.data ?? [];
        setPackages(list.filter((p: any) => p.isActive !== false));
      })
      .finally(() => setLoading(false));
  }, [getUmrahPackages]);

  const bookPackage = (id: string) => {
    setSelectedItem(id);
    router.push(`/booking?type=umrah&id=${id}`);
  };

  // Distinct add-on destination pills
  const addonPills = useMemo(() => {
    const set = new Set<string>();
    for (const p of packages) {
      if (p.addOnCity) set.add(p.addOnCity.trim());
    }
    return Array.from(set);
  }, [packages]);

  const shownPackages = useMemo(() => {
    let result = packages;
    if (selectedAddon) {
      result = result.filter(
        (p) => (p.addOnCity || '').toLowerCase().trim() === selectedAddon.toLowerCase().trim(),
      );
    }
    if (q) {
      result = result.filter((p) =>
        matchesSearch(
          [p.title, p.titleBn, p.addOnCity, ...(p.highlights || []), ...(p.inclusions || [])],
          q,
        ),
      );
    }
    return result;
  }, [packages, selectedAddon, q]);

  return (
    <main className="min-h-screen surface-page pt-10">
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
            <Heart className="w-3 h-3" />
            Umrah Packages
          </span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] text-on-surface mb-6 max-w-3xl">
            Sacred <span className="bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent">Umrah</span> Journeys
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed mb-6">
            Affordable Umrah packages with optional combined trips to Doha, Istanbul, or Jordan. All-inclusive with visa, flights, luxury hotels, and ground transport.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl pt-2">
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

      <section id="packages" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-2 pb-8">
        {loading ? (
          <p className="text-sm text-muted">Loading packages…</p>
        ) : (
          <>
            {/* Quick route navigation filter pills */}
            {addonPills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                <button
                  type="button"
                  onClick={() => setSelectedAddon(null)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border glass hover:-translate-y-0.5 transition-all ${
                    selectedAddon === null
                      ? 'ring-2 ring-emerald-500/60 border-emerald-500/80 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200'
                      : ''
                  }`}
                  style={{ borderColor: selectedAddon === null ? undefined : 'var(--color-outline-variant)' }}
                >
                  <Globe className="w-4 h-4 text-muted" />
                  All Packages
                </button>
                {addonPills.map((city) => {
                  const isSelected = selectedAddon?.toLowerCase() === city.toLowerCase();
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedAddon(isSelected ? null : city)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border glass hover:-translate-y-0.5 transition-all ${
                        isSelected
                          ? 'ring-2 ring-emerald-500/60 border-emerald-500/80 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200'
                          : ''
                      }`}
                      style={{ borderColor: isSelected ? undefined : 'var(--color-outline-variant)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      + {city}
                    </button>
                  );
                })}
              </div>
            )}

            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface mb-6">
              Available Umrah packages
            </h2>

            {packages.length > 0 && (q || selectedAddon) && (
              <SearchResultsBanner query={q || `+ ${selectedAddon}`} count={shownPackages.length} noun="packages" />
            )}

            {packages.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">No packages available yet</p>
                <p className="text-sm text-muted mt-1">Umrah packages added by our team will appear here.</p>
              </div>
            ) : shownPackages.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">
                  No packages match &ldquo;{q || selectedAddon}&rdquo;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {shownPackages.map((pkg) => {
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
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-600 to-amber-600">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={umrahImage(pkg)}
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
                        {pkg.addOnCity ? (
                          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-950 bg-emerald-300/95 shadow">
                            + {pkg.addOnCity}
                          </span>
                        ) : null}
                        <span className="absolute bottom-2.5 left-3 right-3 truncate text-white font-display font-bold text-lg drop-shadow">
                          Makkah & Madinah
                        </span>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400">
                            {pkg.addOnCity ? `Umrah + ${pkg.addOnCity}` : 'Umrah Journey'}
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

                        <div className="mt-auto pt-4 flex flex-col gap-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Starts from</div>
                            <div className="font-display text-2xl font-bold text-on-surface">
                              {fmt(pkg.price, pkg.currency)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <Link
                              href={pkg.slug ? `/umrah/${pkg.slug}` : `/booking?type=umrah&id=${pkg.id}`}
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
          <h3 className="font-display text-xl font-semibold text-on-surface mb-3">Why choose our Umrah packages?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <Compass className="w-5 h-5 text-emerald-500 mb-2" />
              <div className="font-semibold mb-1">Guided spiritual journeys</div>
              <p className="text-on-surface-variant">Accompanied by knowledgeable scholars ensuring every ritual is performed correctly.</p>
            </div>
            <div>
              <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
              <div className="font-semibold mb-1">Verified hotels near Haram</div>
              <p className="text-on-surface-variant">Walking-distance 4-star and 5-star properties in both Makkah and Madinah.</p>
            </div>
            <div>
              <Headphones className="w-5 h-5 text-emerald-500 mb-2" />
              <div className="font-semibold mb-1">Dedicated ground assistance</div>
              <p className="text-on-surface-variant">Private airport transfers and 24/7 dedicated support team on the ground in Saudi Arabia.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
