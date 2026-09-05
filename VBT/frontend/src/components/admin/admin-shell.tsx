'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  CalendarDays,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Loader2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { adminFetch, clearAdminToken, getAdminToken } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/events', label: 'Events', icon: CalendarDays },
  { href: '/admin/landing-pages', label: 'Landing Pages', icon: LayoutTemplate },
  { href: '/admin/users', label: 'Users', icon: ShieldCheck },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace('/admin/login');
      return;
    }
    adminFetch<{ email: string }>('/admin/me')
      .then(() => setChecked(true))
      .catch(() => {
        clearAdminToken();
        router.replace('/admin/login');
      });
  }, [router]);

  const isLogin = pathname === '/admin/login';

  if (!checked && !isLogin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-[var(--color-ink-soft)]">
        <Loader2 size={20} className="animate-spin" /> Loading dashboard…
      </div>
    );
  }

  if (isLogin) return <>{children}</>;

  const logout = () => {
    clearAdminToken();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-[80vh] bg-[var(--color-mist)]">
      <div className="hidden border-b border-black/5 bg-[var(--color-primary-darker)] lg:block">
        <div className="container-site flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <ShieldCheck size={18} className="text-[var(--color-gold-deep)]" />
            <span className="font-bold">Volunteer Bangladesh Trust Admin</span>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      <div className="container-site flex flex-col gap-6 py-8 lg:flex-row">
        <aside className="shrink-0 lg:w-56">
          <div className="space-y-1 rounded-2xl border border-black/5 bg-white p-3 shadow-[var(--shadow-card)]">
            {NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                    active
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-primary-lighter)]',
                  )}
                >
                  <Icon size={16} /> {item.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--color-crimson)] hover:bg-[var(--color-crimson-light)] lg:hidden"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}