'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { assetUrl } from '@/lib/api';

export interface NavItem {
  label: string;
  href: string;
}

function LangSegment() {
  const { lang, setLang } = useI18n();
  const isEn = lang === 'en';

  return (
    <div className="inline-flex h-9 items-center rounded-lg bg-[var(--color-mist)] p-0.5 text-xs font-bold text-[var(--color-ink-soft)]">
      <button
        type="button"
        onClick={() => {
          if (!isEn) setLang('en');
        }}
        className={`flex h-8 items-center rounded-md px-3 font-semibold transition-all ${
          isEn
            ? 'bg-white text-[var(--color-primary)] shadow-sm'
            : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => {
          if (isEn) setLang('bn');
        }}
        className={`flex h-8 items-center rounded-md px-3 font-semibold transition-all ${
          !isEn
            ? 'bg-white text-[var(--color-primary)] shadow-sm'
            : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
        }`}
        aria-label="Switch to Bangla"
      >
        বাংলা
      </button>
    </div>
  );
}

export function NavBarClient({
  items,
  logo,
  siteName,
  donateLabel,
  profileLabel,
  menuLabel,
}: {
  items: NavItem[];
  logo: string;
  siteName: string;
  donateLabel: string;
  profileLabel: string;
  menuLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 100) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // scrolling down -> hide
        setVisible(false);
      } else {
        // scrolling up -> show
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 px-2 pt-[env(safe-area-inset-top,0.5rem)] transition-transform duration-300 md:px-6 md:pt-4 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-[1550px] items-center justify-between gap-2 rounded-lg border border-black/10 bg-white/85 px-3 shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:h-[72px] md:gap-3 md:px-6">
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img
              src={assetUrl(logo)}
              alt={siteName}
              className="h-10 w-10 rounded-xl object-cover"
            />
            <div className="hidden sm:block leading-tight">
              <div className="text-base font-bold text-[var(--color-ink)]">{siteName}</div>
              <div className="text-[11px] text-[var(--color-ink-muted)]">Volunteer Bangladesh Trust</div>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links (Underline on Active/Hover identical to As-Sunnah) */}
          <nav className="hidden items-center gap-8 xl:flex">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 bottom-0 h-[2px] rounded-full transition-all duration-200 ${
                      active
                        ? 'bg-[var(--color-primary)] opacity-100 scale-x-100'
                        : 'bg-[var(--color-primary)] opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions (Language Toggle, Profile Button, Donate CTA Button, Menu Hamburger) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Segment Control */}
            <div className="hidden md:flex">
              <LangSegment />
            </div>

            {/* Profile / Account button (As-Sunnah yellow/gold themed icon box) */}
            <Link
              href="/account"
              className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-gold-deep)] bg-[#fdf8e6] text-[#6b4700] transition-colors hover:bg-[#faeec5]"
              aria-label={profileLabel}
              title={profileLabel}
            >
              <User size={18} />
            </Link>

            {/* As-Sunnah style "দান করুন / Donate" Solid Primary Button */}
            <Link
              href="/donate"
              className="inline-flex h-9 sm:h-10 min-w-[96px] sm:min-w-[118px] items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-md"
            >
              {donateLabel}
            </Link>

            {/* Hamburger Button for mobile/tablet */}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-ink)] hover:bg-[var(--color-primary-lighter)] xl:hidden"
              onClick={() => setOpen(true)}
              aria-label={menuLabel}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / Drawer Navigation (Identical Drawer to As-Sunnah Foundation) */}
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Off-canvas Drawer Panel */}
          <div className="fixed inset-y-0 right-0 flex w-[320px] max-w-[85vw] flex-col bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between border-b border-black/5 px-5">
              <div className="flex items-center gap-2.5">
                <img
                  src={assetUrl(logo)}
                  alt={siteName}
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="font-bold text-sm text-[var(--color-ink)]">{siteName}</span>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-ink-soft)] hover:bg-black/5"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <nav className="flex flex-col gap-1">
                {items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-[var(--color-primary-lighter)] text-[var(--color-primary)] font-bold'
                          : 'text-[var(--color-ink)] hover:bg-[var(--color-mist)]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Extra drawer quick link for Profile / Account */}
              <div className="mt-4 border-t border-black/5 pt-4">
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-mist)]"
                >
                  <User size={18} className="text-[var(--color-gold-deep)]" />
                  <span>{profileLabel}</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer with Language Segment and Donate CTA */}
            <div className="border-t border-black/5 p-4 flex flex-col gap-3 bg-[var(--color-mist)]">
              <div className="flex justify-center">
                <LangSegment />
              </div>
              <Link
                href="/donate"
                onClick={() => setOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-white shadow-sm hover:bg-[var(--color-primary-dark)]"
              >
                {donateLabel}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
