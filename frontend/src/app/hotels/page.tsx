import type { Metadata } from 'next';
import { HotelsPageClient } from './content-client';

export const metadata: Metadata = {
  title: 'Hotels',
  description:
    'Find and book your perfect stay — from luxury resorts to cozy boutique hotels worldwide with FlynGo.',
  openGraph: {
    title: 'Hotels',
    description:
      'Find and book your perfect stay — from luxury resorts to cozy boutique hotels worldwide with FlynGo.',
    type: 'website',
  },
};

export default function Page() {
  return <HotelsPageClient />;
}
