import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/90 via-brand-800/80 to-brand-950/90" />
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-30" />

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight animate-fade-in">
            Discover Your Next
            <span className="block text-brand-300">Extraordinary Journey</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto animate-slide-up">
            Explore the world with Flyngo. Book flights, hotels, tours, and visa services —
            all in one seamless experience.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link
              href="/tours"
              className={cn(
                'inline-flex items-center justify-center px-8 py-4 rounded-xl',
                'bg-white text-brand-800 font-semibold text-lg',
                'hover:bg-gray-100 transition-all duration-200 shadow-lg shadow-black/20',
              )}
            >
              Explore Tours
            </Link>
            <Link
              href="/destinations"
              className={cn(
                'inline-flex items-center justify-center px-8 py-4 rounded-xl',
                'border-2 border-white/30 text-white font-semibold text-lg',
                'hover:bg-white/10 transition-all duration-200 backdrop-blur-sm',
              )}
            >
              View Destinations
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-white/60 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            Everything You Need for Travel
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            One platform for all your travel needs — tours, hotels, flights, and visa processing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className={cn(
                'group relative p-8 rounded-2xl border border-gray-200 dark:border-gray-800',
                'hover:border-brand-300 dark:hover:border-brand-700',
                'hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300',
                'bg-white dark:bg-gray-900',
              )}
            >
              <div className="w-14 h-14 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-7 h-7 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{service.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-4xl sm:text-5xl font-bold text-brand-600 dark:text-brand-400">
                  {stat.value}
                </div>
                <div className="mt-2 text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const services = [
  {
    title: 'Tours & Packages',
    description: 'Curated tours and holiday packages to destinations worldwide.',
    href: '/tours',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: 'Hotels',
    description: 'Find and book the perfect stay from thousands of properties.',
    href: '/hotels',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
      </svg>
    ),
  },
  {
    title: 'Flights',
    description: 'Search and compare flights to find the best deals anywhere.',
    href: '/flights',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
  },
  {
    title: 'Visa Services',
    description: 'Hassle-free visa processing with expert guidance and support.',
    href: '/visa',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

const stats = [
  { value: '500+', label: 'Destinations' },
  { value: '50K+', label: 'Happy Travelers' },
  { value: '1K+', label: 'Tour Packages' },
  { value: '24/7', label: 'Support' },
];
