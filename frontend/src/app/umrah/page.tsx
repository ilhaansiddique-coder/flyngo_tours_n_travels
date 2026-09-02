import type { Metadata } from 'next';
import { UmrahPageClient } from './content-client';

export const metadata: Metadata = {
  title: 'Umrah',
  description:
    'Affordable all-inclusive Umrah packages with visa, flights, and ground transport — plus optional add-on trips to Doha, Istanbul, or Jordan.',
  openGraph: {
    title: 'Umrah',
    description:
      'Affordable all-inclusive Umrah packages with visa, flights, and ground transport — plus optional add-on trips to Doha, Istanbul, or Jordan.',
    type: 'website',
  },
};

export default function Page() {
  return <UmrahPageClient />;
}
