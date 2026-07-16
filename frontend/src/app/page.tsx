import { HeroSection } from '@/components/features/hero/hero-section';
import { DestinationShowcase } from '@/components/features/destinations/destination-showcase';
import { WhyUsSection } from '@/components/features/why-us/why-us-section';
import { TestimonialSection } from '@/components/features/testimonials/testimonial-section';
import { DealsBanner } from '@/components/features/deals/deals-banner';
import { StatsSection } from '@/components/features/stats/stats-section';
import { Newsletter } from '@/components/features/newsletter/newsletter';
import { Section, Container, SectionHeader } from '@/components/ui/section';
import { TourCard } from '@/components/features/tours/tour-card';
import Link from 'next/link';

const featuredTours = [
  {
    id: '1', slug: 'bali-explorer', title: 'Bali Explorer', description: 'Discover the magic of Bali with this comprehensive 7-day tour.',
    price: 899, duration: 7, maxGuests: 20, destination: { name: 'Bali', country: 'Indonesia' }, difficulty: 'easy',
  },
  {
    id: '2', slug: 'swiss-alps-adventure', title: 'Swiss Alps Adventure', description: 'Experience the breathtaking Swiss Alps with guided tours.',
    price: 2499, duration: 10, maxGuests: 15, destination: { name: 'Zurich', country: 'Switzerland' }, difficulty: 'moderate',
  },
  {
    id: '3', slug: 'dubai-luxury', title: 'Dubai Luxury Escape', description: 'Indulge in the finest luxury experiences Dubai has to offer.',
    price: 1899, duration: 5, maxGuests: 12, destination: { name: 'Dubai', country: 'UAE' }, difficulty: 'easy',
  },
  {
    id: '4', slug: 'maldives-paradise', title: 'Maldives Paradise', description: 'Relax in overwater villas and explore crystal-clear waters.',
    price: 3499, duration: 6, maxGuests: 10, destination: { name: 'Male', country: 'Maldives' }, difficulty: 'easy',
  },
];

const categories = [
  { title: 'Beach', icon: '🏖️', href: '/tours?category=beach', gradient: 'from-cyan-500 to-blue-600' },
  { title: 'Adventure', icon: '🏔️', href: '/tours?category=adventure', gradient: 'from-emerald-500 to-teal-600' },
  { title: 'Cultural', icon: '🏛️', href: '/tours?category=cultural', gradient: 'from-amber-500 to-orange-600' },
  { title: 'Luxury', icon: '💎', href: '/tours?category=luxury', gradient: 'from-violet-500 to-purple-600' },
  { title: 'Honeymoon', icon: '💑', href: '/tours?category=honeymoon', gradient: 'from-rose-500 to-pink-600' },
  { title: 'Budget', icon: '💰', href: '/tours?category=budget', gradient: 'from-sky-500 to-blue-600' },
  { title: 'Wildlife', icon: '🦁', href: '/tours?category=wildlife', gradient: 'from-lime-500 to-green-600' },
  { title: 'Cruise', icon: '🚢', href: '/tours?category=cruise', gradient: 'from-indigo-500 to-blue-600' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Category Pills */}
      <Section background="white">
        <Container>
          <div className="flex flex-wrap justify-center gap-3 -mt-8 relative z-30">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className={`group flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r ${cat.gradient} text-white font-medium text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.title}
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3. Deals Banner */}
      <DealsBanner />

      {/* 4. Featured Tours */}
      <Section background="gray">
        <Container>
          <SectionHeader
            title="Trending Tours"
            subtitle="Our most popular packages loved by travelers worldwide"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} {...tour} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-300"
            >
              View All Tours
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </Container>
      </Section>

      {/* 5. Destination Showcase */}
      <DestinationShowcase />

      {/* 6. Why Us */}
      <WhyUsSection />

      {/* 7. Stats */}
      <StatsSection />

      {/* 8. Testimonials */}
      <TestimonialSection />

      {/* 9. Newsletter */}
      <Newsletter />
    </main>
  );
}
