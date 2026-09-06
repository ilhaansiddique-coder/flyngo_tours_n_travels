'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { assetUrl } from '@/lib/api';

export interface NavItem {
  label: string;
  href: string;
}

function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
      className={`rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide transition-colors ${className}`}
      aria-label="Toggle language"
    >
      {lang === 'en' ? 'বাংলা' : 'EN'}
    </button>
  );
}

export function NavBarClient({
  items,
  logo,
  siteName,
  membershipLabel,
  loginLabel,
  menuLabel,
}: {
  items: NavItem[];
  logo: string;
  siteName: string;
  membershipLabel: string;
  loginLabel: string;
  menuLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur transition-shadow ${scrolled ? 'shadow-sm' : ''}`}
    >
      <div className="border-b border-black/5 bg-[var(--color-primary-darker)] text-white">
        <div className="container-site flex h-9 items-center justify-between text-xs">
          <span className="hidden items-center gap-4 sm:flex">
            <span className="inline-flex items-center gap-1.5 opacity-80">
              ✦ welcome — for Humanity
            </span>
          </span>
          <div className="flex items-center gap-3">
            <LangToggle className="hover:bg-white/10" />
            <span className="hidden items-center gap-3 sm:flex">
              <a
                href="https://www.facebook.com/volunteerbdtrust"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--color-gold-deep)]"
              >
                Facebook
              </a>
              <a
                href="https://www.youtube.com/@VolunteerBangladeshTrust"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--color-gold-deep)]"
              >
                YouTube
              </a>
            </span>
          </div>
        </div>
      </div>

      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <img src={assetUrl(logo)} alt={siteName} className="h-10 w-10 rounded-xl object-cover" />
          <div className="leading-tight">
            <div className="text-base font-bold text-[var(--color-ink)]">{siteName}</div>
            <div className="text-xs text-[var(--color-ink-muted)]">Volunteer Bangladesh Trust</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-primary-lighter)] hover:text-[var(--color-primary-darker)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button href="/membership" variant="ghost" size="sm" className="hidden lg:inline-flex">
            {membershipLabel}
          </Button>
          <Button href="/admin/login" size="sm" className="hidden sm:inline-flex">
            {loginLabel}
          </Button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-ink)] hover:bg-[var(--color-primary-lighter)] lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={menuLabel}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-white lg:hidden">
          <nav className="container-site flex flex-col py-3">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-primary-lighter)]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 px-3 pb-2">
              <Button href="/membership" size="sm" className="w-full">
                {membershipLabel}
              </Button>
              <Button href="/admin/login" size="sm" className="w-full">
                {loginLabel}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}