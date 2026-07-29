'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import logoImg from '@/images/flyngo_transparent.png';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Tours', href: '/tours' },
  { label: 'Hotels', href: '/hotels' },
  { label: 'Tickets', href: '/flights' },
  { label: 'Transport', href: '/transport' },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

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

  return (
    <header className="fixed top-0 w-full z-50 h-20 transition-all duration-300 bg-white/10 backdrop-blur-xl border-b border-white/20">
      <div className="flex justify-between items-center px-16 max-w-[1440px] mx-auto h-full">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center">
            <Image
              src={logoImg}
              alt="Fly&Go"
              width={120}
              height={48}
              priority
              className="rounded-xl object-cover w-auto h-auto"
            />
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
                      ? 'text-white font-bold border-b-2 border-white pb-1'
                      : 'text-white/80 hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center glass px-4 py-2 rounded-full border-white/20 transition-all hover:bg-white/20">
            <Search className="text-white/70 mr-2 w-4 h-4" />
            <input
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/60 w-32 focus:w-48 transition-all"
              placeholder="Search..."
              type="text"
            />
          </div>

          {isAuthenticated() && user ? (
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="hidden sm:flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                <span className="glass px-3 py-1.5 rounded-full border-white/10 text-xs font-semibold tracking-wider uppercase">
                  {user.role}
                </span>
                <span className="hidden lg:inline">{user.fullName}</span>
              </Link>
              <button
                onClick={() => { logout(); window.location.href = '/'; }}
                className="text-white/60 hover:text-white transition-all hover:scale-110 p-2"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/booking"
                className="bg-white text-[#031427] px-6 py-2.5 rounded-full text-sm font-bold tracking-wider transition-all duration-300 hover:bg-[#00eefc] hover:text-[#00686f] shadow-lg"
              >
                Book Now
              </Link>
              <Link href="/auth/login" className="text-white transition-all hover:scale-110">
                <User className="w-8 h-8" />
              </Link>
            </>
          )}

          <button
            className="lg:hidden text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-surface z-40 animate-slide-up">
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
                        ? 'text-[#00eefc] bg-white/5'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-white/10 my-4" />
              {isAuthenticated() && user ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="px-4 py-4 rounded-xl text-base font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
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
                    className="px-4 py-4 rounded-xl text-base font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-4 rounded-xl text-base font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
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
