'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, Users, Map, Building2, Plane, Globe,
  Ticket, Percent, UserPlus, BarChart3, Settings,
  Shield, FileText, ChevronLeft, Home,
  FileText as FileIcon, Image, Search as SearchIcon, Star, HelpCircle,
  Megaphone, Car, MessageSquare, Bell, CreditCard, Sparkles, Flag, FileCheck,
  Languages, MessageCircle, Info
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Bookings', href: '/admin/bookings', icon: BookOpen },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Tours', href: '/admin/tours', icon: Map },
  { label: 'Hotels', href: '/admin/hotels', icon: Building2 },
  { label: 'Flights', href: '/admin/flights', icon: Plane },
  { label: 'Visa', href: '/admin/visa', icon: Globe },
  { label: 'Visa Countries', href: '/admin/visa-countries', icon: Flag },
  { label: 'Hajj Packages', href: '/admin/hajj', icon: Sparkles },
  { label: 'Hajj Pre-Regs', href: '/admin/hajj-pre-registrations', icon: FileCheck },
  { label: 'Umrah Packages', href: '/admin/umrah', icon: Sparkles },
  { label: 'Destinations', href: '/admin/destinations', icon: Ticket },
  { label: 'Transport', href: '/admin/transport', icon: Car },
  { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Coupons', href: '/admin/coupons', icon: Percent },
  { label: 'Affiliates', href: '/admin/affiliates', icon: UserPlus },
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
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-surface-container-low border-r border-outline-variant',
        'transition-all duration-300 flex flex-col',
        collapsed ? 'w-20' : 'w-64',
      )}>
        {/* Logo */}
        <div className={cn('h-16 flex items-center border-b border-outline-variant px-4', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
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
                  collapsed && 'justify-center',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-amber-500/10 text-accent border border-accent/30 shadow-lg shadow-accent/5'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-accent')} />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-outline-variant p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors',
              collapsed && 'justify-center',
            )}
          >
            <ChevronLeft className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && 'Collapse'}
          </button>
          <Link
            href="/"
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors',
              collapsed && 'justify-center',
            )}
          >
            <Home className="w-5 h-5" />
            {!collapsed && 'Back to Site'}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn('flex-1 transition-all duration-300', collapsed ? 'ml-20' : 'ml-64')}>
        {/* Page Content */}
        <div className="px-6 py-4">{children}</div>
      </main>
    </div>
  );
}
