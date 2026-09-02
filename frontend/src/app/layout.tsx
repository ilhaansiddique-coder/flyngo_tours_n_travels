import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header/header';
import { MainContent } from '@/components/layout/main-content';
import { Footer } from '@/components/layout/footer/footer';
import { TrackingScripts } from '@/lib/tracking-client';
import { FloatingWhatsApp } from '@/components/marketing/floating-whatsapp';
import { CookieConsent } from '@/components/marketing/cookie-consent';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://flyngo.world'),
  title: { default: 'FlynGo — Luxury Travel', template: '%s | FlynGo' },
  description: 'Your escape, purely refined. Discover the world with FlynGo signature white-glove service.',
  keywords: ['travel', 'luxury', 'flights', 'hotels', 'tours', 'private jets', 'hajj', 'umrah'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'FlynGo',
    images: [{ url: '/api/og' }],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0B0B0F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.classList.toggle('light',!d);r.style.colorScheme=d?'dark':'light'}catch(_){}})()`,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.png" />
        <meta name="theme-color" content="#0B0B0F" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
        />
        <TrackingScripts />
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
          <MainContent>{children}</MainContent>
          <Footer />
          <FloatingWhatsApp />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
