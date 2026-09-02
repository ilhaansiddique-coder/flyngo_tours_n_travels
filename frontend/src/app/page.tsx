import type { Metadata } from 'next';
import { HomePageClient } from './content-client';

export const metadata: Metadata = {
  title: { absolute: 'FlynGo — Luxury Travel & Tours' },
  description:
    'Discover curated tours, luxury hotels, flights, Hajj & Umrah packages, and visa services — your escape, purely refined with FlynGo white-glove service.',
  openGraph: {
    title: 'FlynGo — Luxury Travel & Tours',
    description:
      'Discover curated tours, luxury hotels, flights, Hajj & Umrah packages, and visa services — your escape, purely refined with FlynGo white-glove service.',
    type: 'website',
  },
};

export default function Page() {
  return <HomePageClient />;
}
