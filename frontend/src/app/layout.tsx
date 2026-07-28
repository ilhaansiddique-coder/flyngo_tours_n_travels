import type { Metadata } from 'next';
import { Playfair_Display, Hanken_Grotesk } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header/header';
import { MainContent } from '@/components/layout/main-content';
import { Footer } from '@/components/layout/footer/footer';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-playfair',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-hanken',
});

export const metadata: Metadata = {
  title: { default: 'Fly&Go — Luxury Travel', template: '%s | Fly&Go' },
  description: 'Your escape, purely refined. Discover the world with Fly&Go signature white-glove service.',
  keywords: ['travel', 'luxury', 'flights', 'hotels', 'tours', 'private jets'],
  openGraph: { type: 'website', locale: 'en_US', siteName: 'Fly&Go' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
      </head>
      <body
        className={cn(
          playfair.variable,
          hanken.variable,
          'font-sans antialiased bg-surface text-on-surface'
        )}
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          <MainContent>{children}</MainContent>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
