'use client';

import { PlaneTakeoff, ChevronLeft, ChevronRight, Rocket, ArrowUpRight } from 'lucide-react';
import { HeroSection } from '@/components/features/hero/hero-section';
import { PopularPackages } from '@/components/features/packages/popular-packages';
import { useLocale } from '@/contexts/locale-context';

const routes = [
  { from: 'LHR', fromCity: 'London', to: 'JFK', toCity: 'New York', duration: 'Direct · 7h 45m', price: '$1,240' },
  { from: 'HND', fromCity: 'Tokyo', to: 'SIN', toCity: 'Singapore', duration: 'Direct · 6h 15m', price: '$890' },
  { from: 'DXB', fromCity: 'Dubai', to: 'CDG', toCity: 'Paris', duration: 'Direct · 7h 20m', price: '$1,050', featured: true },
  { from: 'LAX', fromCity: 'Los Angeles', to: 'SYD', toCity: 'Sydney', duration: 'Direct · 15h 10m', price: '$1,580' },
];

const STATS: { value: string; labelKey: 'stat_destinations' | 'stat_happy_travelers' | 'stat_tour_packages' | 'stat_concierge'; accent: boolean }[] = [
  { value: '500+', labelKey: 'stat_destinations', accent: false },
  { value: '50K+', labelKey: 'stat_happy_travelers', accent: true },
  { value: '1K+', labelKey: 'stat_tour_packages', accent: false },
  { value: '24/7', labelKey: 'stat_concierge', accent: true },
];

export default function HomePage() {
  const { t } = useLocale();
  return (
    <main>
      {/* Hero Section */}
      <HeroSection />

      {/* Curated Experiences */}
      <section className="mt-32 px-16 max-w-[1600px] mx-auto mb-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="font-display text-[48px] leading-tight font-semibold text-on-surface mb-4">Curated Experiences</h2>
            <p className="text-base text-on-surface-variant max-w-lg">
              Bespoke itineraries designed for those who value time and texture in their global travels.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="glass p-3 rounded-full hover:bg-surface-container-high transition-all">
              <ChevronLeft className="w-6 h-6 text-on-surface-variant" />
            </button>
            <button className="glass p-3 rounded-full hover:bg-surface-container-high transition-all">
              <ChevronRight className="w-6 h-6 text-on-surface-variant" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group relative md:col-span-2 h-[500px] rounded-xl overflow-hidden glass velocity-glow cursor-pointer">
            <img
              alt="Santorini Sky Loft luxury hotel"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf5QzdFaYkZ_qkiyWWRq-WCpLwdY3Yx_zBdrsh3Ung7SxjFOTDIrHQw4bB0hMfJtFfq-oSxIWfjUWCiyEaYfmzERYqDlrVZPm0OPD2Npb_Agn6Bt2BdAVJl_2gpyRrkbLG9ElZrSLK4B2fkZpzzfN0zUaMIvs8ig7pNifGwbLOKTU2SZH3hcsntX5TXx79EzeifHcLX0xcOptF4yVDe3FZPbm_zgbWEqSqZOgV8JYAPzWwEr1TsUVKmw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-90" />
            <div className="absolute bottom-0 left-0 p-10">
              <span className="text-[#00eefc] text-xs tracking-widest uppercase mb-4 block font-semibold">Seasonal Feature</span>
              <h3 className="font-display text-[32px] font-semibold text-on-surface mb-4">The Santorini Sky Loft</h3>
              <p className="text-base text-on-surface-variant mb-8 max-w-md">
                Private jet transfers and cliffside glass villas. Redefining the Mediterranean escape.
              </p>
              <button className="flex items-center gap-2 text-sm font-semibold text-on-surface group-hover:text-[#00eefc] transition-colors">
                Explore Destination <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="group relative h-[500px] rounded-xl overflow-hidden glass velocity-glow cursor-pointer">
            <img
              alt="Private jet interior"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI-Pg9wYZ2XgNXNw_qA4ZmzpCW-bCwj9CgJkEdeFBtqESfOiWnV-CulYLIrm3BaAy5I8MzIDV01WLlV0w-_pLwdnrpvkdi_6PPBRiXxPcLadEOOnAx2c5gULhNsdZSGuf48UWc9oaWfOEISbClE5jeo79C9DKhJAQsFoNzakSjyrxVMql9GijSQs06adSaa-oVUTkEtaAptmmzGmzrk9Uy2TsEdfRvcRBHLvvvyiKqzHAASaNLIlFjkw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-90" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="text-[#00eefc] text-xs tracking-widest uppercase mb-4 block font-semibold">Velocity Club</span>
              <h3 className="font-display text-[32px] font-semibold text-on-surface mb-4">Priority Skies</h3>
              <p className="text-base text-on-surface-variant mb-8">
                Access to our exclusive fleet of light jets for short-haul precision.
              </p>
              <div className="kinetic-line w-full opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-surface-container py-20 sm:py-24 mb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
        <div className="px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
          {STATS.map((stat) => (
            <div key={stat.labelKey} className="min-w-0">
              <span className={`block font-display text-[40px] sm:text-[48px] leading-tight font-semibold mb-2 whitespace-nowrap ${stat.accent ? 'text-[#00eefc]' : 'text-on-surface'}`}>
                {stat.value}
              </span>
              <span className="block text-xs sm:text-sm tracking-[0.08em] uppercase text-on-surface-variant font-semibold whitespace-nowrap">
                {t(stat.labelKey)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Packages — replaces Popular Routes */}
      <PopularPackages />

      {/* Newsletter CTA */}
      <section className="px-16 max-w-[1600px] mx-auto mb-32">
        <div className="glass-deep p-16 rounded-2xl relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 via-transparent to-transparent pointer-events-none" />
          <Rocket className="w-16 h-16 text-[#00eefc] mb-8" />
          <h2 className="font-display text-[48px] leading-tight font-semibold text-on-surface mb-6">Join the Velocity Elite</h2>
          <p className="text-lg leading-relaxed text-on-surface-variant mb-10 max-w-xl">
            Subscribe for first access to private routes, flash luxury stays, and members-only airport lounge updates.
          </p>
          <form className="flex flex-col md:flex-row gap-4 w-full max-w-lg" onSubmit={(e) => e.preventDefault()}>
            <input
              className="flex-1 glass px-6 py-4 rounded-full outline-none focus:border-[#00eefc] transition-all text-on-surface placeholder:text-on-surface-variant bg-surface-container-low border-outline-variant"
              placeholder="Enter your email address"
              type="email"
            />
            <button className="bg-primary text-background px-10 py-4 rounded-full text-sm font-bold tracking-wider transition-all hover:bg-[#00eefc] hover:text-[#00686f] whitespace-nowrap">
              Join Now
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
