import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: {
    default: 'Flyngo — Tours & Travels',
    template: '%s | Flyngo',
  },
  description: 'Discover extraordinary journeys with Flyngo. Book tours, hotels, flights, and visa services worldwide.',
  keywords: ['travel', 'tours', 'hotels', 'flights', 'visa', 'holiday packages'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Flyngo',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, display.variable, 'font-sans antialiased')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
