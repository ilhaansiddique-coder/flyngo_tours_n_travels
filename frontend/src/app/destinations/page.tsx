import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { PageHero } from '@/components/ui/page-hero';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';

const destinations = [
  { name: 'Bali', country: 'Indonesia', slug: 'bali', tours: 12, hotels: 25 },
  { name: 'Dubai', country: 'UAE', slug: 'dubai', tours: 8, hotels: 40 },
  { name: 'Paris', country: 'France', slug: 'paris', tours: 15, hotels: 35 },
  { name: 'Bangkok', country: 'Thailand', slug: 'bangkok', tours: 10, hotels: 20 },
  { name: 'Singapore', country: 'Singapore', slug: 'singapore', tours: 6, hotels: 15 },
  { name: 'Maldives', country: 'Maldives', slug: 'maldives', tours: 4, hotels: 12 },
  { name: 'Istanbul', country: 'Turkey', slug: 'istanbul', tours: 9, hotels: 18 },
  { name: 'Tokyo', country: 'Japan', slug: 'tokyo', tours: 11, hotels: 28 },
];

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Worldwide"
        title={<>Explore <span className="gradient-text-warm">Destinations</span></>}
        subtitle="Choose from hundreds of incredible destinations worldwide — curated for the luxury traveller."
      />
      <Section>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <Link key={dest.slug} href={`/destinations/${dest.slug}`} className="group block">
                <Card className="group h-full" hover={false}>
                  <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-primary to-tertiary">
                    <div className="absolute inset-0 bg-grid opacity-50" />
                    <div className="absolute inset-0 scrim-soft" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-5xl font-extrabold text-on-bg/30 group-hover:text-on-bg/60 transition-colors">
                        {dest.name[0]}{dest.country[0]}
                      </span>
                    </div>
                    <div
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: 'color-mix(in oklab, var(--color-on-background) 10%, transparent)',
                        border: '1px solid color-mix(in oklab, var(--color-on-background) 20%, transparent)',
                        color: 'var(--color-on-background)',
                      }}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-accent transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {dest.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-hairline text-sm">
                    <span className="text-on-surface-variant"><span className="text-accent font-semibold">{dest.tours}</span> Tours</span>
                    <span className="text-on-surface-variant"><span className="text-accent font-semibold">{dest.hotels}</span> Hotels</span>
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
