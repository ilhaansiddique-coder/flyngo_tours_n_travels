'use client';

import { usePathname } from 'next/navigation';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      <main className={!isHome ? 'pt-16 lg:pt-20' : 'pt-20'}>{children}</main>
      {!isAdmin && <ScrollToTop />}
    </>
  );
}