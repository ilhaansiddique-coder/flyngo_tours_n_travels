'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useLocale } from '@/contexts/locale-context';
import { useScrollReveal } from '@/lib/use-scroll-reveal';
import { api } from '@/lib/api';
import logoImg from '@/images/flyngo_transparent.png';

type StaticNavItem =
  | { key: string; href: string }
  | { key: string; submenu: { key: string; href: string }[] };

const defaultNavItems: StaticNavItem[] = [
  { key: 'nav_home', href: '/' },
  {
    key: 'nav_about',
    submenu: [
      { key: 'nav_about_company', href: '/about' },
      { key: 'nav_about_ceo', href: '/about/ceo' },
    ],
  },
  { key: 'nav_tours', href: '/tours' },
  { key: 'nav_visa', href: '/visa' },
  { key: 'nav_hajj', href: '/hajj' },
  { key: 'nav_hotels', href: '/hotels' },
  { key: 'nav_tickets', href: '/flights' },
  { key: 'nav_blog', href: '/blog' },
];

interface ApiNavChild {
  id: string;
  labelEn: string;
  labelBn?: string | null;
  translationKey?: string | null;
  href: string;
  linkType: 'INTERNAL' | 'EXTERNAL' | 'SECTION';
  openInNewTab?: boolean;
  highlight?: boolean;
  isVisible: boolean;
  children?: ApiNavChild[];
}

type ResolvedItem =
  | { kind: 'link'; key: string; label: string; href: string; target?: '_blank'; highlight?: boolean }
  | { kind: 'submenu'; key: string; label: string; href: string; items: { key: string; label: string; href: string; target?: '_blank' }[] };

function resolveLabel(item: ApiNavChild, locale: 'en' | 'bn'): string {
  if (item.translationKey) return item.translationKey;
  if (locale === 'bn' && item.labelBn) return item.labelBn;
  return item.labelEn || item.labelBn || '';
}

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t, locale } = useLocale();
  const { visible, compact } = useScrollReveal();

  // Owner-managed nav tree from the CMS. Until it loads (or if the request
  // fails), we keep the default static nav so SSR/SEO and the first paint
  // stay intact.
  const [apiNav, setApiNav] = useState<ApiNavChild[] | null>(null);

  useEffect(() => {
    setMounted(true);
    // SSR hydration guard — render the same on server and first client render
    // then reveal the auth-dependent UI on the second render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get<ApiNavChild[]>('/site/nav')
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) setApiNav(data);
      })
      .catch(() => {
        // Network/backend error → keep the default navItems.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const navItems: ResolvedItem[] = (() => {
    const tree = apiNav;
    if (tree && tree.length > 0) {
      const out: ResolvedItem[] = [];
      for (const top of tree) {
        if (!top.isVisible) continue;
        const topLabel = resolveLabel(top, locale);
        const children = (top.children || []).filter((c) => c.isVisible);
        if (children.length > 0) {
          out.push({
            kind: 'submenu',
            key: top.id,
            label: topLabel,
            href: top.href,
            items: children.map((c) => ({
              key: c.id,
              label: resolveLabel(c, locale),
              href: c.href,
              target: c.openInNewTab || c.linkType === 'EXTERNAL' ? '_blank' : undefined,
            })),
          });
        } else {
          out.push({
            kind: 'link',
            key: top.id,
            label: topLabel,
            href: top.href,
            target: top.openInNewTab || top.linkType === 'EXTERNAL' ? '_blank' : undefined,
            highlight: top.highlight,
          });
        }
      }
      return out;
    }
    return defaultNavItems.map((it) => {
      if ('submenu' in it) {
        return {
          kind: 'submenu' as const,
          key: it.key,
          label: it.key,
          href: '#',
          items: it.submenu.map((s) => ({
            key: s.key,
            label: s.key,
            href: s.href,
          })),
        };
      }
      return {
        kind: 'link' as const,
        key: it.key,
        label: it.key,
        href: it.href,
      };
    });
  })();

  const labelOf = (item: ResolvedItem): string => {
    if (apiNav && apiNav.length > 0) {
      return item.label;
    }
    return t(item.label as any);
  };
  const subLabelOf = (s: { label: string }): string => {
    if (apiNav && apiNav.length > 0) return s.label;
    return t(s.label as any);
  };

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
          compact ? 'px-4 sm:px-6 lg:px-8 xl:px-12' : 'px-4 sm:px-6 lg:px-8 xl:px-16',
        )}
      >
        <div className="flex items-center gap-6 xl:gap-8">
          <Link href="/" className="flex items-center leading-none">
            <Image
              src={logoImg}
              alt="FlynGo"
              width={965}
              height={344}
              priority
              className={cn(
                'object-contain w-auto transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                compact ? 'h-7' : 'h-10',
              )}
            />
          </Link>
          <nav className="hidden xl:flex gap-6 items-center">
            {navItems.map((item) => {
              if (item.kind === 'submenu') {
                const isOpen = openDropdown === item.key;
                const anyActive = item.items.some((s) =>
                  s.href === '/' ? pathname === '/' : pathname.startsWith(s.href)
                );
                return (
                  <div
                    key={item.key}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.key)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      type="button"
                      className={cn(
                        'flex items-center gap-1 whitespace-nowrap text-sm tracking-[0.05em] font-semibold transition-colors',
                        anyActive ? 'font-bold border-b-2 pb-1' : ''
                      )}
                      style={{
                        color: anyActive ? 'var(--color-nav-active)' : 'var(--color-nav-inactive)',
                        borderColor: anyActive ? 'var(--color-nav-active)' : 'transparent',
                      }}
                      onClick={() => setOpenDropdown(isOpen ? null : item.key)}
                      onMouseEnter={(e) => {
                        if (!anyActive) (e.currentTarget as HTMLElement).style.color = 'var(--color-nav-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!anyActive) (e.currentTarget as HTMLElement).style.color = 'var(--color-nav-inactive)';
                      }}
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                    >
                      {labelOf(item)}
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          isOpen ? 'rotate-180' : ''
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        'absolute left-0 top-full pt-2 min-w-[220px] transition-all duration-200',
                        isOpen
                          ? 'opacity-100 translate-y-0 pointer-events-auto'
                          : 'opacity-0 -translate-y-1 pointer-events-none'
                      )}
                      role="menu"
                    >
                      <div
                        className="rounded-xl shadow-xl border overflow-hidden"
                        style={{
                          backgroundColor: 'var(--color-header-bg)',
                          borderColor: 'var(--color-header-border)',
                          backdropFilter: 'blur(20px)',
                        }}
                      >
                        {item.items.map((sub) => {
                          const subActive = sub.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(sub.href);
                          return (
                            <Link
                              key={sub.key}
                              href={sub.href}
                              target={sub.target}
                              rel={sub.target ? 'noopener noreferrer' : undefined}
                              role="menuitem"
                              className="block px-4 py-2.5 text-sm font-medium transition-colors"
                              style={{
                                color: subActive
                                  ? 'var(--color-nav-active)'
                                  : 'var(--color-nav-inactive)',
                                backgroundColor: subActive
                                  ? 'color-mix(in oklab, var(--color-nav-active) 10%, transparent)'
                                  : 'transparent',
                              }}
                              onMouseEnter={(e) => {
                                if (!subActive) {
                                  e.currentTarget.style.color = 'var(--color-nav-hover)';
                                  e.currentTarget.style.backgroundColor =
                                    'color-mix(in oklab, var(--color-nav-active) 8%, transparent)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!subActive) {
                                  e.currentTarget.style.color = 'var(--color-nav-inactive)';
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              {subLabelOf(sub)}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
              const active = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  target={item.target}
                  rel={item.target ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'whitespace-nowrap text-sm tracking-[0.05em] font-semibold transition-colors',
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
                  {labelOf(item)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center ml-auto">
          {isAuthenticated() && user ? (
            <div className="hidden xl:flex items-center gap-3 mr-3">
              <Link
                href={user.role === 'customer' ? '/dashboard' : '/admin/dashboard'}
                className="flex flex-col leading-tight transition-colors"
                style={{ color: 'var(--color-header-text)' }}
              >
                <span className="text-sm font-semibold">{user.fullName}</span>
                <span
                  className="text-[9px] font-bold tracking-[0.18em] uppercase"
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
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden xl:inline-flex mr-3 px-5 py-2.5 rounded-full text-sm font-bold tracking-wider transition-all duration-300 shadow-lg whitespace-nowrap"
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
              {t('nav_signin')}
            </Link>
          )}

          <Link
            href="/booking"
            className="hidden xl:inline-flex mr-3 px-5 py-2.5 rounded-full text-sm font-bold tracking-wider transition-all duration-300 shadow-lg whitespace-nowrap"
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

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <LanguageToggle />
            <button
              className="xl:hidden p-2 -mr-2 rounded-xl transition-colors hover:bg-surface-container-high"
              style={{ color: 'var(--color-header-text)' }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mounted && isMobileMenuOpen && createPortal(
        <>
          <div
            className="xl:hidden fixed inset-0 z-[55] animate-fade-in"
            style={{ backgroundColor: 'rgba(2, 6, 23, 0.55)', backdropFilter: 'blur(2px)' }}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="xl:hidden fixed top-0 right-0 bottom-0 z-[60] w-[min(360px,85vw)] sm:w-[380px] shadow-2xl flex flex-col animate-slide-in-right"
            style={{
              backgroundColor: 'var(--color-mobile-menu-bg)',
              borderLeft: '1px solid var(--color-mobile-divider)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
          >
            <div className="flex items-center justify-between h-20 px-6 shrink-0"
              style={{ borderBottom: '1px solid var(--color-mobile-divider)' }}
            >
              <span
                className="text-sm font-bold uppercase tracking-[0.18em]"
                style={{ color: 'var(--color-mobile-nav-text)' }}
              >
                Menu
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl transition-colors hover:bg-surface-container-high"
                style={{ color: 'var(--color-header-text)' }}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                if (item.kind === 'submenu') {
                  const isOpen = openDropdown === item.key;
                  const anyActive = item.items.some((s) =>
                    s.href === '/' ? pathname === '/' : pathname.startsWith(s.href)
                  );
                  return (
                    <div key={item.key} className="flex flex-col">
                      <button
                        type="button"
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl text-base font-semibold transition-colors text-left"
                        style={{
                          color: anyActive ? 'var(--color-mobile-nav-active)' : 'var(--color-mobile-nav-text)',
                          backgroundColor: anyActive ? 'var(--color-mobile-nav-bg)' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!anyActive) {
                            e.currentTarget.style.color = 'var(--color-nav-hover)';
                            e.currentTarget.style.backgroundColor = 'var(--color-mobile-nav-hover-bg)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!anyActive) {
                            e.currentTarget.style.color = 'var(--color-mobile-nav-text)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        onClick={() => setOpenDropdown(isOpen ? null : item.key)}
                        aria-expanded={isOpen}
                      >
                        <span>{labelOf(item)}</span>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 transition-transform duration-200',
                            isOpen ? 'rotate-180' : ''
                          )}
                        />
                      </button>
                      <div
                        className={cn(
                          'flex flex-col gap-1 overflow-hidden transition-all duration-200',
                          isOpen ? 'max-h-96 mt-1' : 'max-h-0'
                        )}
                      >
                        {item.items.map((sub) => {
                          const subActive = sub.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(sub.href);
                          return (
                            <Link
                              key={sub.key}
                              href={sub.href}
                              target={sub.target}
                              rel={sub.target ? 'noopener noreferrer' : undefined}
                              className="ml-4 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                              style={{
                                color: subActive
                                  ? 'var(--color-mobile-nav-active)'
                                  : 'var(--color-mobile-nav-text)',
                                backgroundColor: subActive
                                  ? 'var(--color-mobile-nav-bg)'
                                  : 'transparent',
                              }}
                              onMouseEnter={(e) => {
                                if (!subActive) {
                                  e.currentTarget.style.color = 'var(--color-nav-hover)';
                                  e.currentTarget.style.backgroundColor = 'var(--color-mobile-nav-hover-bg)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!subActive) {
                                  e.currentTarget.style.color = 'var(--color-mobile-nav-text)';
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {subLabelOf(sub)}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    target={item.target}
                    rel={item.target ? 'noopener noreferrer' : undefined}
                    className={cn(
                      'px-4 py-2.5 rounded-xl text-base font-semibold transition-colors',
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
                    {labelOf(item)}
                  </Link>
                );
              })}
              <Link
                href="/booking"
                className="mt-1 px-4 py-2.5 rounded-xl text-base font-bold tracking-wider text-center transition-colors"
                style={{
                  backgroundColor: 'var(--color-header-btn-bg)',
                  color: 'var(--color-header-btn-text)',
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav_book')}
              </Link>
              <div
                className="my-2"
                style={{ borderTop: '1px solid var(--color-mobile-divider)' }}
              />
              {!authReady ? (
                <div className="flex items-center gap-3" style={{ minWidth: 180, minHeight: 40 }} aria-hidden="true" />
              ) : isAuthenticated() && user ? (
                <>
                  <Link
                    href={user.role === 'customer' ? '/dashboard' : '/admin/dashboard'}
                    className="px-4 py-2.5 rounded-xl text-base font-medium transition-colors"
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
                    className="px-4 py-2.5 rounded-xl text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2.5 rounded-xl text-base font-medium transition-colors"
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
                    className="px-4 py-2.5 rounded-xl text-base font-medium transition-colors"
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
        </>,
        document.body
      )}
    </header>
  );
}
