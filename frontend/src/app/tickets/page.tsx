import type { Metadata } from 'next';
import { FlightsPageClient } from '../flights/content-client';

export const metadata: Metadata = {
  title: 'Flight Tickets',
  description:
    'Search and book flight tickets across hundreds of airlines for the best deals on worldwide routes with FlynGo.',
  openGraph: {
    title: 'Flight Tickets',
    description:
      'Search and book flight tickets across hundreds of airlines for the best deals on worldwide routes with FlynGo.',
    type: 'website',
  },
};

export default function TicketsPage() {
  return <FlightsPageClient />;
}
