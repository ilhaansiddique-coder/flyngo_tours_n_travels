import type { Metadata } from 'next';
import { DestinationsPageClient } from './content-client';

export const metadata: Metadata = {
  title: 'Destinations',
  description:
    'Explore hundreds of incredible destinations worldwide with tours and hotels curated for the luxury traveller by FlynGo.',
  openGraph: {
    title: 'Destinations',
    description:
      'Explore hundreds of incredible destinations worldwide with tours and hotels curated for the luxury traveller by FlynGo.',
    type: 'website',
  },
};

export default function Page() {
  return <DestinationsPageClient />;
}
