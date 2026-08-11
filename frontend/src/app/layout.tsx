import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header/header';
import { TopSearchBar } from '@/components/layout/header/top-search-bar';
import { MainContent } from '@/components/layout/main-content';
import { Footer } from '@/components/layout/footer/footer';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: { default: 'FlynGo — Luxury Travel', template: '%s | FlynGo' },
  description: 'Your escape, purely refined. Discover the world with FlynGo signature white-glove service.',
  keywords: ['travel', 'luxury', 'flights', 'hotels', 'tours', 'private jets'],
  openGraph: { type: 'website', locale: 'en_US', siteName: 'FlynGo' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
      </head>
      <body
        className={cn(
          montserrat.variable,
          'font-sans antialiased'
        )}
        style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-on-surface)' }}
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          <TopSearchBar />
          <MainContent>{children}</MainContent>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
