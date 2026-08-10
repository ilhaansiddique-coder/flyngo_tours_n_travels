'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useLocale } from '@/contexts/locale-context';
import { useScrollReveal } from '@/lib/use-scroll-reveal';
import logoImg from '@/images/flyngo_transparent.png';

const navItems = [
  { key: 'nav_home', href: '/' },
  { key: 'nav_tours', href: '/tours' },
  { key: 'nav_visa', href: '/visa' },
  { key: 'nav_hajj', href: '/hajj' },
  { key: 'nav_hotels', href: '/hotels' },
  { key: 'nav_tickets', href: '/flights' },
  { key: 'nav_transport', href: '/transport' },
] as const;

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t } = useLocale();
  const { visible, compact } = useScrollReveal();

  useEffect(() => {
    // SSR hydration guard — render the same on server and first client render
    // then reveal the auth-dependent UI on the second render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthReady(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  if (pathname.startsWith('/admin')) return null;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b will-change-transform',
        'transition-[transform,height,background-color,border-color,box-shadow,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        visible ? 'translate-y-0' : '-translate-y-full',
        compact
          ? 'h-14 shadow-[0_8px_24px_-12px_rgba(7,86,184,0.25)]'
          : 'h-20 shadow-none',
      )}
      style={{
        backgroundColor: compact
          ? 'color-mix(in oklab, var(--color-header-bg) 92%, transparent)'
          : 'var(--color-header-bg)',
        borderColor: compact
          ? 'color-mix(in oklab, var(--color-header-border) 100%, transparent)'
          : 'var(--color-header-border)',
      }}
    >
      <div
        className={cn(
          'flex justify-between items-center max-w-[1600px] mx-auto h-full transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          compact ? 'px-8 lg:px-12' : 'px-16',
        )}
      >
        <div className="flex items-center gap-12">
          <Link href="/" className="flex flex-col items-start leading-tight">
            <Image
              src={logoImg}
              alt="Fly&Go"
              width={120}
              height={48}
              priority
              className={cn(
                'rounded-xl object-cover w-auto h-auto transition-[height,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                compact ? 'h-8' : 'h-12',
              )}
            />
            <span
              className={cn(
                'mt-0.5 tracking-[0.2em] uppercase font-medium transition-[font-size,opacity,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden',
                compact
                  ? 'text-[0px] opacity-0 h-0 mt-0'
                  : 'text-[7px] sm:text-[8px] opacity-70',
              )}
              style={{ color: 'var(--color-nav-inactive)' }}
            >
              {t('slogan')}
            </span>
          </Link>
          <nav className="hidden md:flex gap-8">
            {navItems.map((item) => {
              const active = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm tracking-[0.05em] font-semibold transition-colors',
                    active
                      ? 'font-bold border-b-2 pb-1'
                      : 'hover:opacity-100'
                  )}
                  style={{
                    color: active ? 'var(--color-nav-active)' : 'var(--color-nav-inactive)',
                    borderColor: active ? 'var(--color-nav-active)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) (e.target as HTMLElement).style.color = 'var(--color-nav-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.target as HTMLElement).style.color = 'var(--color-nav-inactive)';
                  }}
                >
                  {t(item.key as any)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          {isAuthenticated() && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={user.role === 'customer' ? '/dashboard' : '/admin/dashboard'}
                className="hidden sm:flex flex-col leading-tight transition-colors"
                style={{ color: 'var(--color-header-text)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-header-text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-header-text)')}
              >
                <span className="hidden lg:inline text-sm font-semibold">{user.fullName}</span>
                <span
                  className="hidden lg:inline text-[9px] font-bold tracking-[0.18em] uppercase"
                  style={{ color: 'var(--color-header-text-muted)' }}
                >
                  {user.role}
                </span>
              </Link>
              <button
                onClick={() => { logout(); window.location.href = '/'; }}
                className="transition-all hover:scale-110 p-2"
                style={{ color: 'var(--color-header-text-muted)' }}
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex text-sm font-medium transition-colors"
                style={{ color: 'var(--color-header-text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-header-text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-header-text-muted)')}
              >
                {t('nav_signin')}
              </Link>
            </>
          )}

          <Link
            href="/booking"
            className="px-6 py-2.5 rounded-full text-sm font-bold tracking-wider transition-all duration-300 shadow-lg"
            style={{
              backgroundColor: 'var(--color-header-btn-bg)',
              color: 'var(--color-header-btn-text)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-header-btn-hover-bg)';
              e.currentTarget.style.color = 'var(--color-header-btn-hover-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-header-btn-bg)';
              e.currentTarget.style.color = 'var(--color-header-btn-text)';
            }}
          >
            {t('nav_book')}
          </Link>

          <ThemeToggle />
          <LanguageToggle />

          <button
            className="lg:hidden p-2 rounded-xl transition-colors hover:bg-surface-container-high"
            style={{ color: 'var(--color-header-text)' }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-20 z-40 animate-slide-up"
          style={{ backgroundColor: 'var(--color-mobile-menu-bg)' }}
        >
          <div className="p-6 pt-8">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-4 py-4 rounded-xl text-base font-semibold transition-colors',
                      active
                        ? ''
                        : ''
                    )}
                    style={{
                      color: active ? 'var(--color-mobile-nav-active)' : 'var(--color-mobile-nav-text)',
                      backgroundColor: active ? 'var(--color-mobile-nav-bg)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = 'var(--color-nav-hover)';
                        e.currentTarget.style.backgroundColor = 'var(--color-mobile-nav-hover-bg)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = 'var(--color-mobile-nav-text)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t(item.key as any)}
                  </Link>
                );
              })}
              <div
                className="my-4"
                style={{ borderTop: '1px solid var(--color-mobile-divider)' }}
              />
          {!authReady ? (
            <div className="flex items-center gap-3" style={{ minWidth: 180, minHeight: 40 }} aria-hidden="true" />
          ) : isAuthenticated() && user ? (
                <>
                  <Link
                    href={user.role === 'customer' ? '/dashboard' : '/admin/dashboard'}
                    className="px-4 py-4 rounded-xl text-base font-medium transition-colors"
                    style={{ color: 'var(--color-mobile-nav-text)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-nav-hover)';
                      e.currentTarget.style.backgroundColor = 'var(--color-mobile-nav-hover-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-mobile-nav-text)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); window.location.href = '/'; }}
                    className="px-4 py-4 rounded-xl text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-4 rounded-xl text-base font-medium transition-colors"
                    style={{ color: 'var(--color-mobile-nav-text)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-nav-hover)';
                      e.currentTarget.style.backgroundColor = 'var(--color-mobile-nav-hover-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-mobile-nav-text)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-4 rounded-xl text-base font-medium transition-colors"
                    style={{ color: 'var(--color-mobile-nav-text)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-nav-hover)';
                      e.currentTarget.style.backgroundColor = 'var(--color-mobile-nav-hover-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-mobile-nav-text)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
