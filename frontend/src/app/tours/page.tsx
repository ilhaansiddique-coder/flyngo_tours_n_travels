import type { Metadata } from 'next';
import { ToursPageClient } from './content-client';

export const metadata: Metadata = {
  title: 'Tours',
  description:
    "Explore curated tours and travel packages in the world's most breathtaking destinations, crafted by FlynGo travel experts.",
  openGraph: {
    title: 'Tours',
    description:
      "Explore curated tours and travel packages in the world's most breathtaking destinations, crafted by FlynGo travel experts.",
    type: 'website',
  },
};

export default function Page() {
  return <ToursPageClient />;
}
