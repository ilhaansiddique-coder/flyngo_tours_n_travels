import type { Metadata } from 'next';
import { Public_Sans, Hind_Siliguri } from 'next/font/google';
import { I18nProvider } from '@/lib/i18n';
import { getServerLang } from '@/lib/server-lang';
import { NavBar } from '@/components/nav-bar';
import { Footer } from '@/components/footer';
import { FloatingDonate } from '@/components/floating-donate';
import './globals.css';

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-public',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['latin', 'bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
  display: 'swap',
});

export const dynamic = 'force-dynamic';

const USE_BASE_PATH = process.env.NEXT_PUBLIC_VBT_USE_BASEPATH !== 'false';
const BASE_PATH = USE_BASE_PATH ? process.env.NEXT_PUBLIC_VBT_BASE_PATH || '/VBT' : '';

const KONKSHO_FACE_STYLE = `@font-face{font-family:'Konksho Numerals';src:url('${BASE_PATH}/fonts/KongshoNumerals.woff2') format('woff2');font-display:swap;unicode-range:U+09E6-09EF;}body{font-family:'Konksho Numerals',var(--font-sans);}`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Volunteer Bangladesh Trust',
    template: '%s | Volunteer Bangladesh Trust',
  },
  description:
    'Volunteer Bangladesh Trust — a registered Bangladeshi charity devoted to education, service, Dawah and human welfare. Membership, volunteering, Quran, Sunnah, articles, lectures and resources.',
  icons: {
    icon: `${BASE_PATH}/images/brand/favicon.png`,
    apple: `${BASE_PATH}/images/brand/favicon.png`,
  },
  openGraph: {
    title: 'Volunteer Bangladesh Trust',
    description:
      'Volunteer Bangladesh Trust — a registered Bangladeshi charity devoted to education, service, Dawah and human welfare. Membership, volunteering, Quran, Sunnah, articles, lectures and resources.',
    images: [`${BASE_PATH}/images/brand/logo.png`],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getServerLang();

  return (
    <html lang={lang} className={`${publicSans.variable} ${hindSiliguri.variable}`}>
      <body className="flex min-h-screen flex-col">
        <style dangerouslySetInnerHTML={{ __html: KONKSHO_FACE_STYLE }} />
        <I18nProvider initialLang={lang}>
          <NavBar />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingDonate />
        </I18nProvider>
      </body>
    </html>
  );
}