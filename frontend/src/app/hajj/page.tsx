'use client';

import Link from 'next/link';
import { useLocale } from '@/contexts/locale-context';
import { POPULAR_PACKAGES } from '@/lib/packages';
import { MapPin, Clock, Phone, FileCheck, ArrowRight, Shield, Users, Plane } from 'lucide-react';

export default function HajjPage() {
  const { t, locale } = useLocale();
  const isBn = locale === 'bn';

  const hajjPackages = POPULAR_PACKAGES.filter((p) => p.category === 'hajj' || p.category === 'umrah');

  return (
    <main className="min-h-screen bg-[#020617] pt-24">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 50% 40% at 30% 30%, rgba(16,185,129,0.20), transparent 70%), radial-gradient(ellipse 40% 35% at 80% 70%, rgba(245,158,11,0.18), transparent 70%)',
            }}
          />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 py-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full text-[10px] tracking-widest uppercase font-bold text-emerald-300 border border-emerald-400/30 bg-emerald-500/5">
            <FileCheck className="w-3 h-3" />
            {t('hajj_hero_badge')}
          </span>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] text-white mb-6 max-w-3xl">
            {t('hajj_hero_title')}{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
              {t('hajj_hero_title_b')}
            </span>
          </h1>

          <p className="text-lg text-white/70 max-w-2xl mb-10 leading-relaxed">
            {t('hajj_hero_sub')}
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#packages"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-amber-400 transition"
            >
              {t('hajj_cta_packages')}
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 transition"
            >
              <Phone className="w-4 h-4" />
              {t('hajj_cta_consult')}
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            {[
              { icon: Shield, label: isBn ? 'লাইসেন্সপ্রাপ্ত অপারেটর' : 'Licensed Operator', tint: 'text-emerald-300 border-emerald-400/20' },
              { icon: Users, label: isBn ? '৫০০০+ সন্তুষ্ট যাত্রী' : '5000+ Happy Pilgrims', tint: 'text-amber-300 border-amber-400/20' },
              { icon: Plane, label: isBn ? 'সরাসরি ফ্লাইট' : 'Direct Flights', tint: 'text-blue-300 border-blue-400/20' },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${item.tint} bg-white/5 backdrop-blur-sm`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 py-20">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-10">
          {isBn ? 'আমাদের প্যাকেজ' : 'Our Packages'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hajjPackages.map((pkg) => (
            <Link
              key={pkg.id}
              href={pkg.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl glass border border-emerald-400/20 hover:border-emerald-400/60 transition-all hover:-translate-y-1"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={isBn ? pkg.titleBn : pkg.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                {pkg.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold text-surface bg-[#00eefc]">
                    {isBn ? pkg.badgeBn : pkg.badge}
                  </span>
                )}
              </div>

              <div className="p-6">
                <h3 className="font-display text-2xl font-semibold text-white mb-2">
                  {isBn ? pkg.titleBn : pkg.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{pkg.destination}</span>
                </div>

                <ul className="space-y-1.5 mb-5 text-sm text-white/70">
                  {(isBn ? pkg.highlightsBn : pkg.highlights).map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50">
                      {t('pkg_from')}
                    </div>
                    <div className="font-display text-2xl font-bold text-white">
                      ${pkg.priceUsd.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {pkg.durationDays} {isBn ? 'দিন' : 'days'}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 group-hover:bg-[#00eefc] group-hover:text-surface transition-colors">
                    {t('pkg_book')}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Process timeline */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 py-20">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-10">
          {isBn ? 'প্রক্রিয়া' : 'How It Works'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { n: '01', t: isBn ? 'পরামর্শ' : 'Consultation', d: isBn ? 'আপনার প্রয়োজন জানুন' : 'Tell us your needs' },
            { n: '02', t: isBn ? 'প্যাকেজ নির্বাচন' : 'Pick Package', d: isBn ? 'আপনার জন্য সঠিক প্যাকেজ' : 'Choose the right one' },
            { n: '03', t: isBn ? 'ডকুমেন্ট ও ভিসা' : 'Documents & Visa', d: isBn ? 'আমরা সব সামলাই' : 'We handle everything' },
            { n: '04', t: isBn ? 'যাত্রা' : 'Travel', d: isBn ? 'নিরাপদে পৌঁছান' : 'Travel with peace' },
          ].map((step) => (
            <div key={step.n} className="rounded-2xl glass border border-white/10 p-6">
              <div className="text-[#00eefc] font-display text-2xl font-bold mb-2">{step.n}</div>
              <div className="font-semibold text-white mb-1">{step.t}</div>
              <div className="text-sm text-white/60">{step.d}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
