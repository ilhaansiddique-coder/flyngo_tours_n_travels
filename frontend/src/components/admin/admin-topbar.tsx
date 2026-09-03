'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { GlobalCustomerSearch } from '@/components/admin/global-customer-search';
import { Home, LogOut, Menu as MenuIcon } from 'lucide-react';

/**
 * Admin content-area top bar: shows which module the admin is currently in and
 * who they're signed in as, plus the controls that were previously only on the
 * public site (theme + language) and quick home / sign-out actions.
 */
export function AdminTopbar({
  navigation,
  onMenuClick,
}: {
  navigation: { label: string; href: string }[];
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Longest matching href wins, so /admin/cms/blogs beats /admin/cms.
  const current = navigation
    .filter((n) => pathname === n.href || pathname?.startsWith(n.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const moduleName = current?.label ?? 'Admin';

  const displayName = user?.fullName || user?.email || 'Signed in';
  const initial = (user?.fullName || user?.email || 'A').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-outline-variant bg-surface/80 px-4 sm:px-6 py-3 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            title="Open menu"
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        )}
        {/* Current module */}
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            Admin panel
          </div>
          <h1 className="truncate font-display text-lg font-bold text-on-surface">{moduleName}</h1>
        </div>
      </div>

      {/* Global customer search */}
      <div className="hidden min-w-0 shrink md:block">
        <GlobalCustomerSearch />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />

        <Link
          href="/"
          title="Go to site home"
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
        >
          <Home className="h-4 w-4" />
        </Link>

        {/* Signed-in user */}
        <div className="ml-1 flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container/60 py-1 pl-1 pr-3">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-[var(--color-on-primary)]"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))' }}
          >
            {initial}
          </span>
          <span className="hidden max-w-[160px] truncate text-sm font-medium text-on-surface sm:block">
            {displayName}
          </span>
        </div>

        <button
          type="button"
          onClick={logout}
          title="Sign out"
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-danger-soft hover:text-error"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
