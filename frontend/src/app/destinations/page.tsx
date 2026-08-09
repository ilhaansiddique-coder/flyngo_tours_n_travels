import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

const destinations = [
  { name: 'Bali', country: 'Indonesia', slug: 'bali', tours: 12, hotels: 25, image: null },
  { name: 'Dubai', country: 'UAE', slug: 'dubai', tours: 8, hotels: 40, image: null },
  { name: 'Paris', country: 'France', slug: 'paris', tours: 15, hotels: 35, image: null },
  { name: 'Bangkok', country: 'Thailand', slug: 'bangkok', tours: 10, hotels: 20, image: null },
  { name: 'Singapore', country: 'Singapore', slug: 'singapore', tours: 6, hotels: 15, image: null },
  { name: 'Maldives', country: 'Maldives', slug: 'maldives', tours: 4, hotels: 12, image: null },
  { name: 'Istanbul', country: 'Turkey', slug: 'istanbul', tours: 9, hotels: 18, image: null },
  { name: 'Tokyo', country: 'Japan', slug: 'tokyo', tours: 11, hotels: 28, image: null },
];

export default function DestinationsPage() {
  return (
    <>
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">Explore Destinations</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            Choose from hundreds of incredible destinations worldwide
          </p>
        </Container>
      </Section>
      <Section background="white">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <Link key={dest.slug} href={`/destinations/${dest.slug}`}>
                <Card className="group h-full">
                  <div className="h-48 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 mb-4 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white/80">{dest.name[0]}{dest.country[0]}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold">{dest.name}</h3>
                  <p className="text-sm text-gray-500">{dest.country}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <span>{dest.tours} Tours</span>
                    <span>{dest.hotels} Hotels</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
