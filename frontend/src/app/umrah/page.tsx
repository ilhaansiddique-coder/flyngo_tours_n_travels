'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale } from '@/contexts/locale-context';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency } from '@/lib/utils';
import { Clock, Sparkles, ArrowRight, Shield, Users, Plane, Heart } from 'lucide-react';

interface UmrahPackage {
  id: string;
  title: string;
  durationDays: number;
  price: number;
  currency: string;
  makkahNights: number;
  madinahNights: number;
  addOnCity?: string;
  highlights: string[];
  inclusions: string[];
  isFeatured: boolean;
  order: number;
}

export default function UmrahPage() {
  const { t, locale } = useLocale();
  const isBn = locale === 'bn';
  const { getUmrahPackages } = useApi();
  const fmt = useFormatCurrency();
  const [packages, setPackages] = useState<UmrahPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUmrahPackages({ limit: '50' })
      .then((r: any) => setPackages(r?.items ?? []))
      .finally(() => setLoading(false));
  }, [getUmrahPackages]);

  return (
    <main className="min-h-screen surface-page pt-24">
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
            <Heart className="w-3 h-3" />
            Umrah Packages
          </span>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] text-on-surface mb-6 max-w-3xl">
            Sacred <span className="bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent">Umrah</span> Journeys
          </h1>

          <p className="text-lg text-on-surface-variant max-w-2xl mb-10 leading-relaxed">
            Affordable Umrah packages with optional combined trips to Doha, Istanbul, or Jordan. All-inclusive with visa, flights, and ground transport.
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
              View packages
              <ArrowRight className="w-4 h-4" />
            </a>
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

      <section id="packages" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-20">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-on-surface mb-10">Our Umrah Packages</h2>
        {loading ? (
          <p className="text-sm text-muted">Loading packages…</p>
        ) : packages.length === 0 ? (
          <p className="text-sm text-muted">No packages available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href="/booking"
                className="group relative flex flex-col overflow-hidden rounded-2xl glass border border-emerald-500/30 hover:border-emerald-500/60 transition-all hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-600 to-amber-600 flex items-center justify-center">
                  <Heart className="w-16 h-16 text-white/25" />
                  <div className="absolute inset-0 scrim-soft" />
                  {pkg.isFeatured && (
                    <span
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-on-primary)',
                      }}
                    >
                      Featured
                    </span>
                  )}
                  {pkg.addOnCity && (
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-black/30 text-white backdrop-blur-sm">
                      + {pkg.addOnCity}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display text-lg font-semibold text-on-surface mb-2 line-clamp-2">{pkg.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {pkg.durationDays} {isBn ? 'দিন' : 'days'} · {pkg.makkahNights}N Makkah · {pkg.madinahNights}N Madinah
                    </span>
                  </div>

                  <ul className="space-y-1 mb-4 text-xs text-on-surface/80 flex-1">
                    {pkg.highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="line-clamp-1">{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 border-t border-hairline flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">From</div>
                      <div className="font-display text-xl font-bold text-on-surface">
                        {fmt(pkg.price, pkg.currency)}
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold transition-colors"
                      style={{
                        backgroundColor: 'color-mix(in oklab, #10b981 15%, transparent)',
                        color: 'var(--color-on-surface)',
                      }}
                    >
                      Book
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
