import { Section, Container } from '@/components/ui/section';
import { HotelCard } from '@/components/features/hotels/hotel-card';

const hotels = [
  { id: '1', slug: 'bali-beach-resort', name: 'Bali Beach Resort & Spa', starRating: 5, pricePerNight: 299, destination: { name: 'Bali', country: 'Indonesia' }, amenities: ['Pool', 'Spa', 'Beachfront'] },
  { id: '2', slug: 'dubai-marina-luxury', name: 'Dubai Marina Luxury Hotel', starRating: 5, pricePerNight: 499, destination: { name: 'Dubai', country: 'UAE' }, amenities: ['Spa', 'Infinity Pool', 'Fine Dining'] },
  { id: '3', slug: 'paris-boutique-marais', name: 'Paris Boutique Hotel Le Marais', starRating: 4, pricePerNight: 249, destination: { name: 'Paris', country: 'France' }, amenities: ['WiFi', 'Breakfast', 'Terrace'] },
  { id: '4', slug: 'maldives-overwater-villa', name: 'Maldives Overwater Villa Resort', starRating: 5, pricePerNight: 899, destination: { name: 'Maldives', country: 'Maldives' }, amenities: ['Overwater', 'Butler', 'Private Pool'] },
  { id: '5', slug: 'tokyo-shinjuku-hotel', name: 'Tokyo Shinjuku Business Hotel', starRating: 3, pricePerNight: 149, destination: { name: 'Tokyo', country: 'Japan' }, amenities: ['WiFi', 'Metro Access', 'Co-Work'] },
];

export default function HotelsPage() {
  return (
    <>
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">Find Your Perfect Stay</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            From luxury resorts to cozy boutique hotels worldwide
          </p>
        </Container>
      </Section>
      <Section background="white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} {...hotel} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
