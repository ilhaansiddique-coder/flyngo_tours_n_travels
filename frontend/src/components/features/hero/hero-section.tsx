'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Calendar, Users, ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-900" />
        <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-float" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-16 h-16 border border-indigo-400/20 rounded-2xl rotate-12 animate-float" />
      <div className="absolute top-40 right-20 w-12 h-12 border border-violet-400/20 rounded-full animate-float-delayed" />
      <div className="absolute bottom-40 left-20 w-20 h-20 border border-amber-400/10 rounded-2xl -rotate-12 animate-float" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 animate-scale-in backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>New: AI-Powered trip planning now available</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1]">
            <span className="inline-block animate-slide-up">Discover</span>{' '}
            <span className="gradient-text-warm inline-block animate-slide-up">the World</span>
            <br />
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl opacity-90 inline-block animate-slide-up">
              Your Way
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Book extraordinary tours, flights, hotels, and visa services with AI-powered
            recommendations tailored just for you.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link
              href="/tours"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-lg hover:from-indigo-500 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              Explore Tours
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5"
            >
              View Destinations
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto animate-slide-up">
            {[
              { value: '500+', label: 'Destinations' },
              { value: '50K+', label: 'Happy Travelers' },
              { value: '1K+', label: 'Tour Packages' },
              { value: '24/7', label: 'Concierge' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl sm:text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Search Widget */}
        <div className="mt-16 max-w-4xl mx-auto animate-slide-up">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-2 border border-white/10 shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  className="bg-transparent border-none outline-none text-white placeholder:text-gray-500 w-full text-sm"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors sm:w-44">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Add dates"
                  className="bg-transparent border-none outline-none text-white placeholder:text-gray-500 w-full text-sm"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors sm:w-40">
                <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Guests"
                  className="bg-transparent border-none outline-none text-white placeholder:text-gray-500 w-full text-sm"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-indigo-500/25">
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>

          {/* Quick suggestion chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['Bali', 'Dubai', 'Maldives', 'Switzerland', 'Thailand'].map((place) => (
              <button
                key={place}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-colors backdrop-blur-sm"
              >
                {place}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-gray-600 uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-gray-600 flex justify-center pt-1">
          <div className="w-1 h-2 rounded-full bg-gray-500 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
