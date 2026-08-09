'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useLocale } from '@/contexts/locale-context';
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

  useEffect(() => {
    // SSR hydration guard — render the same on server and first client render
    // then reveal the auth-dependent UI on the second render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthReady(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.querySelector('header');
      if (el) el.dataset.scrolled = String(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  if (pathname.startsWith('/admin')) return null;

  return (
    <header
      className="fixed top-0 w-full z-50 h-20 transition-all duration-300 backdrop-blur-xl border-b"
      style={{
        backgroundColor: 'var(--color-header-bg)',
        borderColor: 'var(--color-header-border)',
      }}
    >
      <div className="flex justify-between items-center px-16 max-w-[1600px] mx-auto h-full">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex flex-col items-start leading-tight">
            <Image
              src={logoImg}
              alt="Fly&Go"
              width={120}
              height={48}
              priority
              className="rounded-xl object-cover w-auto h-auto"
            />
            <span
              className="mt-1 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase font-semibold"
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
          <div
            className="hidden lg:flex items-center px-4 py-2 rounded-full transition-all hover:opacity-80"
            style={{
              backgroundColor: 'var(--color-header-search-bg)',
              border: '1px solid var(--color-header-search-border)',
            }}
          >
            <Search className="mr-2 w-4 h-4" style={{ color: 'var(--color-header-text-muted)' }} />
            <input
              className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all"
              placeholder="Search..."
              type="text"
              style={{
                color: 'var(--color-header-search-text)',
              }}
              onFocus={(e) => (e.target.style.setProperty('--tw-placeholder-color', 'transparent'))}
            />
            <style jsx>{`
              input::placeholder {
                color: var(--color-header-search-placeholder);
              }
            `}</style>
          </div>

          {isAuthenticated() && user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="hidden sm:flex items-center gap-2 text-sm transition-colors"
                style={{ color: 'var(--color-header-text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-header-text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-header-text-muted)')}
              >
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
                  style={{
                    backgroundColor: 'var(--color-header-search-bg)',
                    border: '1px solid var(--color-header-search-border)',
                    color: 'var(--color-header-text)',
                  }}
                >
                  {user.role}
                </span>
                <span className="hidden lg:inline">{user.fullName}</span>
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
              <Link
                href="/auth/login"
                className="transition-all hover:scale-110"
                style={{ color: 'var(--color-header-text)' }}
              >
                <User className="w-8 h-8" />
              </Link>
            </>
          )}

          <ThemeToggle />

          <button
            className="lg:hidden p-2 rounded-xl transition-colors hover:bg-white/10"
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
                    href="/admin/dashboard"
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
