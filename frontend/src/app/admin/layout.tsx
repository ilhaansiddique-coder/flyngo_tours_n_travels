'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, Users, Map, Building2, Plane, Globe,
  Ticket, Percent, BarChart3, Settings, Gift,
  Shield, FileText, ChevronLeft, Home,
  FileText as FileIcon, Image, Search as SearchIcon, Star, HelpCircle,
  Megaphone, Car, MessageSquare, Bell, CreditCard, Sparkles, FileCheck,
  Languages, MessageCircle, Info, Menu as MenuIcon, LayoutGrid, Target, Coins,
  Smartphone,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';

const ADMIN_ROLES = ['admin', 'super_admin'];

const navigation = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Bookings', href: '/admin/bookings', icon: BookOpen },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Tours', href: '/admin/tours', icon: Map },
  { label: 'Hotels', href: '/admin/hotels', icon: Building2 },
  { label: 'Flights', href: '/admin/flights', icon: Plane },
  { label: 'Visa', href: '/admin/visa', icon: Globe },
  { label: 'Hajj Packages', href: '/admin/hajj', icon: Sparkles },
  { label: 'Hajj Pre-Regs', href: '/admin/hajj-pre-registrations', icon: FileCheck },
  { label: 'Umrah Packages', href: '/admin/umrah', icon: Sparkles },
  { label: 'Hajj/Umrah Bookings', href: '/admin/hajj-umrah-bookings', icon: BookOpen },
  { label: 'Destinations', href: '/admin/destinations', icon: Ticket },
  { label: 'Transport', href: '/admin/transport', icon: Car },
  { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Bank Accounts', href: '/admin/bank-accounts', icon: Building2 },
  { label: 'Mobile Wallets', href: '/admin/mobile-wallets', icon: Smartphone },
  { label: 'Coupons', href: '/admin/coupons', icon: Percent },
  { label: 'Refer & Earn', href: '/admin/affiliates', icon: Gift },
  { label: 'Loyalty & Points', href: '/admin/loyalty', icon: Coins },
  { label: 'Tracking & Ads', href: '/admin/tracking', icon: Target },
  { label: 'Campaigns', href: '/admin/marketing', icon: Megaphone },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Users & Roles', href: '/admin/users', icon: Shield },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  // CMS
  { label: 'CMS Pages', href: '/admin/cms/pages', icon: FileIcon },
  { label: 'CMS Blogs', href: '/admin/cms/blogs', icon: FileIcon },
  { label: 'Hero Section', href: '/admin/cms/hero', icon: Languages },
  { label: 'About Us', href: '/admin/cms/about', icon: Info },
  { label: 'CEO Message', href: '/admin/cms/ceo', icon: MessageCircle },
  { label: 'Globe Cities', href: '/admin/cms/globe', icon: Globe },
  { label: 'Media Library', href: '/admin/cms/media', icon: Image },
  { label: 'SEO Manager', href: '/admin/cms/seo', icon: SearchIcon },
  { label: 'Testimonials', href: '/admin/cms/testimonials', icon: Star },
  { label: 'FAQs', href: '/admin/cms/faqs', icon: HelpCircle },
  // Site chrome (owner-controlled)
  { label: 'Navbar', href: '/admin/site/navbar', icon: MenuIcon },
  { label: 'Footer', href: '/admin/site/footer', icon: LayoutGrid },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { accessToken, user, hasHydrated, setUser } = useAuthStore();
  // 'checking' covers the case where a token is present but the cached profile
  // isn't — resolve the role from the server rather than guessing.
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  // The API rejects unauthorised calls on its own, but without this the entire
  // admin shell — every nav entry, every screen name — rendered for anyone who
  // typed /admin. Wait for hydration first, or a refresh bounces a valid admin.
  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      setStatus('denied');
      return;
    }
    if (user?.role) {
      setStatus(ADMIN_ROLES.includes(user.role) ? 'allowed' : 'denied');
      return;
    }

    // Token but no cached profile: happens when the profile fetch after login
    // failed, or the cookie predates profile caching. Deciding from the empty
    // store would lock a real admin out of their own panel, so ask the server.
    let cancelled = false;
    (async () => {
      try {
        const me = await api.get<{ id: string; email: string | null; fullName: string; role: { code: string; permissions: Array<{ permission: { code: string } }> } }>(
          '/users/me',
          { token: accessToken },
        );
        if (cancelled) return;
        setUser({
          id: me.id,
          email: me.email ?? '',
          fullName: me.fullName,
          role: me.role.code,
          permissions: me.role.permissions.map((p) => p.permission.code),
        });
        setStatus(ADMIN_ROLES.includes(me.role.code) ? 'allowed' : 'denied');
      } catch {
        if (!cancelled) setStatus('denied');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, accessToken, user?.role, setUser]);

  useEffect(() => {
    if (status !== 'denied') return;
    router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const labelize = () => {
      root.querySelectorAll('table').forEach((table) => {
        const headers = Array.from(table.querySelectorAll('thead th')).map((th) =>
          (th.textContent || '').replace(/\s+/g, ' ').trim(),
        );
        table.querySelectorAll('tbody tr').forEach((tr) => {
          const cells = Array.from(tr.querySelectorAll(':scope > td'));
          if (cells.length === 1 && cells[0].hasAttribute('colspan')) {
            cells[0].setAttribute('data-empty-row', 'true');
            return;
          }
          cells.forEach((td, i) => {
            const label = headers[i] || '';
            td.setAttribute('data-label', label);
            const isLast = i === cells.length - 1;
            if (/^actions?$/i.test(label) || (isLast && !label)) {
              td.setAttribute('data-actions', 'true');
            } else {
              td.removeAttribute('data-actions');
            }
          });
        });
      });
    };

    labelize();
    const mo = new MutationObserver(labelize);
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [pathname, status]);

  if (status !== 'allowed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-on-surface-variant">
        <p className="text-sm">{status === 'denied' ? 'Redirecting to sign in…' : 'Loading…'}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-50 h-screen bg-surface-container-low border-r border-outline-variant',
        'transition-all duration-300 flex flex-col',
        'lg:translate-x-0',
        collapsed ? 'lg:w-20' : 'lg:w-64',
        mobileOpen ? 'translate-x-0' : 'w-64 -translate-x-full lg:w-64',
      )}>
        {/* Logo */}
        <div className={cn('h-16 flex items-center border-b border-outline-variant px-4', collapsed ? 'lg:justify-center' : 'gap-3')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
            <Plane className="w-4 h-4 text-white" />
          </div>
          {!collapsed && <span className="font-display text-lg font-bold text-on-surface">FlynGo Admin</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  collapsed && 'lg:justify-center',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-amber-500/10 text-accent border border-accent/30 shadow-lg shadow-accent/5'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-accent')} />
                <span className={cn(collapsed && 'lg:hidden')}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-outline-variant p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full hidden lg:flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors',
              collapsed && 'lg:justify-center',
            )}
          >
            <ChevronLeft className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && 'Collapse'}
          </button>
          <Link
            href="/"
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors',
              collapsed && 'lg:justify-center',
            )}
          >
            <Home className="w-5 h-5" />
            <span className={cn(collapsed && 'lg:hidden')}>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn('flex-1 transition-all duration-300', collapsed ? 'lg:ml-20' : 'lg:ml-64')}>
        <AdminTopbar navigation={navigation} onMenuClick={() => setMobileOpen(true)} />
        {/* Page Content */}
        <div ref={contentRef} className="admin-table-cards px-4 sm:px-6 py-4">{children}</div>
      </main>
    </div>
  );
}
