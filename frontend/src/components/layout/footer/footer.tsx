'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Globe, Share2 } from 'lucide-react';
import logoImg from '@/images/flyngo_transparent.png';

const footerNav = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact Support', href: '/contact' },
  { label: 'Global Destinations', href: '/destinations' },
];

export function Footer() {
  return (
    <footer className="w-full py-12 bg-surface border-t border-white/5 opacity-80 hover:opacity-100 transition-all">
      <div className="flex flex-col md:flex-row justify-between items-center px-16 max-w-[1440px] mx-auto gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={logoImg}
              alt="Fly&Go"
              width={120}
              height={40}
              className="rounded-lg object-cover"
            />
          </Link>
          <p className="text-xs text-white/60">&copy; {new Date().getFullYear()} Fly&Go Travel. High Velocity Luxury.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-8">
          {footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white/60 hover:text-white text-xs transition-all hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-6">
          <button className="text-white/60 hover:text-white transition-colors" aria-label="Language">
            <Globe className="w-5 h-5" />
          </button>
          <button className="text-white/60 hover:text-white transition-colors" aria-label="Share">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
