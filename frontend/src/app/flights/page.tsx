import type { Metadata } from 'next';
import { FlightsPageClient } from './content-client';

export const metadata: Metadata = {
  title: 'Flights',
  description:
    'Search and book flights across hundreds of airlines for the best deals on worldwide routes with FlynGo.',
  openGraph: {
    title: 'Flights',
    description:
      'Search and book flights across hundreds of airlines for the best deals on worldwide routes with FlynGo.',
    type: 'website',
  },
};

export default function Page() {
  return <FlightsPageClient />;
}
