import { Section, Container, SectionHeader } from '@/components/ui/section';
import { TourCard } from '@/components/features/tours/tour-card';
import { SearchBar } from '@/components/features/search/search-bar';

const tours = [
  { id: '1', slug: 'bali-paradise-explorer', title: 'Bali Paradise Explorer', description: 'Discover the magic of Bali with temple visits, beach hopping, and cultural tours.', price: 1299, duration: 7, maxGuests: 15, destination: { name: 'Bali', country: 'Indonesia' }, difficulty: 'easy' },
  { id: '2', slug: 'dubai-luxury-experience', title: 'Dubai Luxury Experience', description: 'Experience the height of luxury in Dubai with desert safaris and skyscraper tours.', price: 2499, duration: 5, maxGuests: 12, destination: { name: 'Dubai', country: 'UAE' }, difficulty: 'easy' },
  { id: '3', slug: 'paris-romantic-getaway', title: 'Paris Romantic Getaway', description: 'Fall in love with Paris as you explore the Eiffel Tower, Louvre, and charming streets.', price: 1899, duration: 5, maxGuests: 10, destination: { name: 'Paris', country: 'France' }, difficulty: 'easy' },
  { id: '4', slug: 'bangkok-street-food-culture', title: 'Bangkok Street Food & Culture', description: 'Immerse yourself in Bangkok\'s vibrant street life, temples, and legendary food scene.', price: 899, duration: 5, maxGuests: 20, destination: { name: 'Bangkok', country: 'Thailand' }, difficulty: 'easy' },
  { id: '5', slug: 'maldives-honeymoon-special', title: 'Maldives Honeymoon Special', description: 'Escape to paradise with overwater villas, private dinners, and spa treatments.', price: 3499, duration: 5, maxGuests: 2, destination: { name: 'Maldives', country: 'Maldives' }, difficulty: 'easy' },
  { id: '6', slug: 'tokyo-tech-tradition', title: 'Tokyo Tech & Tradition', description: 'Explore the fascinating blend of cutting-edge technology and ancient traditions in Tokyo.', price: 2199, duration: 8, maxGuests: 15, destination: { name: 'Tokyo', country: 'Japan' }, difficulty: 'easy' },
];

export default function ToursPage() {
  return (
    <>
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">Explore Our Tours</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            Curated experiences in the world's most breathtaking destinations
          </p>
        </Container>
      </Section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchBar />
      </div>
      <Section background="white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <TourCard key={tour.id} {...tour} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
