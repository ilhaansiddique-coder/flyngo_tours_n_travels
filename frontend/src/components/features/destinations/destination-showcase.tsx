import { Section, Container, SectionHeader } from '@/components/ui/section';
import { DestinationCard } from './destination-card';

const destinations = [
  { name: 'Bali', country: 'Indonesia', image: '/destinations/bali.jpg', tours: 124, rating: 4.9, slug: 'bali' },
  { name: 'Santorini', country: 'Greece', image: '/destinations/santorini.jpg', tours: 89, rating: 4.8, slug: 'santorini' },
  { name: 'Switzerland', country: 'Europe', image: '/destinations/switzerland.jpg', tours: 156, rating: 4.9, slug: 'switzerland' },
  { name: 'Maldives', country: 'South Asia', image: '/destinations/maldives.jpg', tours: 67, rating: 4.9, slug: 'maldives' },
  { name: 'Dubai', country: 'UAE', image: '/destinations/dubai.jpg', tours: 210, rating: 4.7, slug: 'dubai' },
  { name: 'Thailand', country: 'Asia', image: '/destinations/thailand.jpg', tours: 180, rating: 4.8, slug: 'thailand' },
];

export function DestinationShowcase() {
  return (
    <Section background="white">
      <Container>
        <SectionHeader
          title="Popular Destinations"
          subtitle="Explore our hand-picked destinations loved by travelers worldwide"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, index) => (
            <DestinationCard key={dest.slug} {...dest} index={index} />
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/destinations"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-300"
          >
            View All Destinations
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </Container>
    </Section>
  );
}
