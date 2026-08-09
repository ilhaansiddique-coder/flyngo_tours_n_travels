'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Share2, Plane, Mail, Phone } from 'lucide-react';
import logoImg from '@/images/flyngo_transparent.png';

const footerNav = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact Support', href: '/contact' },
  { label: 'Global Destinations', href: '/destinations' },
];

const serviceNav = [
  { label: 'Tours', href: '/tours' },
  { label: 'Hotels', href: '/hotels' },
  { label: 'Flights', href: '/flights' },
  { label: 'Visa', href: '/visa' },
  { label: 'Hajj & Umrah', href: '/hajj' },
  { label: 'Transport', href: '/transport' },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <footer
      className="relative w-full pt-20 pb-10 border-t overflow-hidden"
      style={{
        backgroundColor: 'var(--color-footer-bg)',
        borderColor: 'var(--color-footer-border)',
        color: 'var(--color-footer-text)',
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 50% 0%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 70%)',
          }}
        />
      </div>

      <div className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto">
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12"
          style={{ borderBottom: '1px solid var(--color-footer-border)' }}
        >
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src={logoImg}
                alt="Fly&Go"
                width={140}
                height={44}
                className="rounded-lg object-cover w-auto h-auto"
              />
            </Link>
            <p
              className="mt-4 text-sm max-w-xs leading-relaxed"
              style={{ color: 'var(--color-footer-text-muted)' }}
            >
              High-velocity luxury travel — tours, hotels, flights, visas, and Hajj packages
              designed for the discerning global traveller.
            </p>
            <div
              className="mt-5 flex items-center gap-2"
              style={{ color: 'var(--color-footer-heading)' }}
            >
              <Plane className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-widest uppercase">High Velocity Luxury</span>
            </div>
          </div>

          {[
            { heading: 'Services', items: serviceNav },
            { heading: 'Company', items: footerNav },
          ].map((col) => (
            <div key={col.heading}>
              <h4
                className="text-[10px] tracking-[0.25em] uppercase font-bold mb-4"
                style={{ color: 'var(--color-footer-heading)' }}
              >
                {col.heading}
              </h4>
              <nav className="flex flex-col gap-3">
                {col.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm transition-colors"
                    style={{ color: 'var(--color-footer-text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-footer-text)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-footer-text-muted)')}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          <div>
            <h4
              className="text-[10px] tracking-[0.25em] uppercase font-bold mb-4"
              style={{ color: 'var(--color-footer-heading)' }}
            >
              Get in touch
            </h4>
            <div className="flex flex-col gap-3 text-sm" style={{ color: 'var(--color-footer-text-muted)' }}>
              <a href="mailto:contact@flyngo.com" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" style={{ color: 'var(--color-footer-heading)' }} />
                contact@flyngo.com
              </a>
              <a href="tel:+1800FLYNGO" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" style={{ color: 'var(--color-footer-heading)' }} />
                +1-800-FLYNGO
              </a>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-footer-text-muted)' }}>
                24/7 concierge · Multilingual support
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4">
          <p className="text-xs" style={{ color: 'var(--color-footer-text-muted)' }}>
            &copy; {new Date().getFullYear()} Fly&Go Travel. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button
              className="w-9 h-9 rounded-full border flex items-center justify-center transition-all"
              style={{
                borderColor: 'var(--color-footer-border)',
                color: 'var(--color-footer-text-muted)',
                backgroundColor: 'transparent',
              }}
              aria-label="Language"
            >
              <Globe className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 rounded-full border flex items-center justify-center transition-all"
              style={{
                borderColor: 'var(--color-footer-border)',
                color: 'var(--color-footer-text-muted)',
                backgroundColor: 'transparent',
              }}
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
