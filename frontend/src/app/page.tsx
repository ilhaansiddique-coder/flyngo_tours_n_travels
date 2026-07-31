'use client';

import Link from 'next/link';
import { PlaneTakeoff, CalendarDays, MapPin, ChevronLeft, ChevronRight, Rocket, ArrowUpRight, ArrowRight } from 'lucide-react';

const routes = [
  { from: 'LHR', fromCity: 'London', to: 'JFK', toCity: 'New York', duration: 'Direct · 7h 45m', price: '$1,240' },
  { from: 'HND', fromCity: 'Tokyo', to: 'SIN', toCity: 'Singapore', duration: 'Direct · 6h 15m', price: '$890' },
  { from: 'DXB', fromCity: 'Dubai', to: 'CDG', toCity: 'Paris', duration: 'Direct · 7h 20m', price: '$1,050', featured: true },
  { from: 'LAX', fromCity: 'Los Angeles', to: 'SYD', toCity: 'Sydney', duration: 'Direct · 15h 10m', price: '$1,580' },
];

const stats = [
  { value: '120+', label: 'Global Hubs', accent: false },
  { value: '15ms', label: 'Booking Velocity', accent: true },
  { value: '24/7', label: 'Concierge Care', accent: false },
  { value: '98%', label: 'Member Loyalty', accent: true },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Luxury travel background with blue and white aesthetic"
            className="w-full h-full object-cover brightness-[0.85]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2Vke4Q6ZGIoLFvdAiYQpUMjSsa1OApffMFqvvcBVrTUhDQSPrwbRqQ4EHlJgxj4UaDu4tzISvY-_npW0zOSMEtu3tGBE_rCp5v6KYgK93fa-aX_OmcO3CuAKHtyfJY_azelB4WNa7kn43b7oZMG5pfOiswaeL51ZSdd5ZX2IlifxF0ayan5KfRFsYVOG93AzpRQG1qwnGEbTm42I6immIGr982o9TAmoljNjgb34UeDxOPXBFrsipkg"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        </div>

        <div className="relative z-10 px-16 max-w-[1440px] mx-auto w-full">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block glass-white px-4 py-1.5 rounded-full text-white text-xs tracking-widest uppercase shadow-sm mb-6">
              Blue Horizon Club
            </span>
            <h1 className="font-display text-[60px] leading-[1.1] tracking-[-0.02em] font-bold text-white mb-6 drop-shadow-xl text-glow-blue">
              Your Escape,<br />
              <span className="text-white italic opacity-90">Purely Refined.</span>
            </h1>
            <p className="text-lg leading-relaxed text-white/90 mb-12 max-w-md drop-shadow-md">
              Seamless velocity meets ethereal comfort. Discover the world in a new light with Fly&Go&apos;s signature white-glove service.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[1100px] px-4 z-20">
          <div className="glass-white shadow-2xl rounded-full">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-0 bg-white/10 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 overflow-hidden p-2">
              <div className="flex-1 flex flex-col px-8 py-3 border-r border-white/10">
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">Where to next?</label>
                <div className="flex items-center">
                  <MapPin className="text-[#00eefc] mr-2 w-5 h-5" />
                  <input className="bg-transparent border-none outline-none text-base text-white placeholder:text-white/40 w-full p-0" placeholder="Destinations" type="text" />
                </div>
              </div>
              <div className="flex-1 flex flex-col px-8 py-3 border-r border-white/10">
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">Service Type</label>
                <div className="flex items-center cursor-pointer relative">
                  <PlaneTakeoff className="text-[#00eefc] mr-2 w-5 h-5" />
                  <select className="bg-transparent border-none outline-none text-base text-white w-full appearance-none p-0 pr-6">
                    <option className="bg-surface">First Class</option>
                    <option className="bg-surface">Business Class</option>
                    <option className="bg-surface">Premium Economy</option>
                    <option className="bg-surface">Economy</option>
                  </select>
                  <svg className="absolute right-0 text-white/50 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 flex flex-col px-8 py-3">
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">Departure Date</label>
                <div className="flex items-center">
                  <CalendarDays className="text-[#00eefc] mr-2 w-5 h-5" />
                  <input className="bg-transparent border-none outline-none text-base text-white w-full p-0 [color-scheme:dark]" type="date" />
                </div>
              </div>
              <button className="bg-blue-600 text-white px-10 py-4 rounded-full text-sm font-bold tracking-wider transition-all duration-300 hover:bg-blue-700 hover:shadow-lg flex items-center justify-center gap-2 group whitespace-nowrap ml-2">
                FIND JOURNEY
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Experiences */}
      <section className="mt-32 px-16 max-w-[1440px] mx-auto mb-32">
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
      <section className="bg-surface-container py-24 mb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
        <div className="px-16 max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <span className={`block font-display text-[48px] leading-tight font-semibold mb-2 ${stat.accent ? 'text-[#00eefc]' : 'text-on-surface'}`}>
                {stat.value}
              </span>
              <span className="text-sm tracking-[0.1em] uppercase text-on-surface-variant font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Routes */}
      <section className="px-16 max-w-[1440px] mx-auto mb-32">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-[1px] flex-1 bg-outline-variant" />
          <h2 className="text-sm tracking-[0.2em] uppercase text-on-surface-variant font-semibold whitespace-nowrap">Popular High Velocity Routes</h2>
          <div className="h-[1px] flex-1 bg-outline-variant" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {routes.map((route) => (
            <div
              key={`${route.from}-${route.to}`}
              className={`glass p-6 rounded-xl velocity-glow transition-all group cursor-pointer ${route.featured ? 'border-[#00eefc]/30' : ''}`}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="font-display text-[32px] font-semibold text-on-surface block">{route.from}</span>
                  <span className="text-xs text-on-surface-variant">{route.fromCity}</span>
                </div>
                <PlaneTakeoff className="text-[#00eefc] w-6 h-6 mt-2" />
                <div className="text-right">
                  <span className="font-display text-[32px] font-semibold text-on-surface block">{route.to}</span>
                  <span className="text-xs text-on-surface-variant">{route.toCity}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-on-surface-variant mb-6">
                <span>{route.duration}</span>
                <span className="text-on-surface font-bold">From {route.price}</span>
              </div>
              <div className="kinetic-line w-0 group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-16 max-w-[1440px] mx-auto mb-32">
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
