'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, Users, Map, Building2, Plane, Globe,
  Ticket, Percent, UserPlus, BarChart3, Settings,
  Shield, FileText, ChevronLeft, Home,
  FileText as FileIcon, Image, Search as SearchIcon, Star, HelpCircle,
  Megaphone, Car, MessageSquare, Bell, CreditCard
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
  { label: 'Media Library', href: '/admin/cms/media', icon: Image },
  { label: 'SEO Manager', href: '/admin/cms/seo', icon: SearchIcon },
  { label: 'Testimonials', href: '/admin/cms/testimonials', icon: Star },
  { label: 'FAQs', href: '/admin/cms/faqs', icon: HelpCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-[#07111f] border-r border-white/10',
        'transition-all duration-300 flex flex-col',
        collapsed ? 'w-20' : 'w-64',
      )}>
        {/* Logo */}
        <div className={cn('h-16 flex items-center border-b border-white/10 px-4', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          {!collapsed && <span className="font-display text-lg font-bold text-white">Fly&Go Admin</span>}
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
                    ? 'bg-gradient-to-r from-blue-600/20 to-amber-500/10 text-[#00eefc] border border-[#00eefc]/30 shadow-lg shadow-[#00eefc]/5'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-[#00eefc]')} />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white transition-colors',
              collapsed && 'justify-center',
            )}
          >
            <ChevronLeft className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && 'Collapse'}
          </button>
          <Link
            href="/"
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors',
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
        {/* Top Bar */}
        <div className="h-16 border-b border-white/10 bg-[#07111f]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <h1 className="font-display text-xl font-bold text-white">
            {navigation.find((n) => n.href === pathname)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
              title="Go to Home Page"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00eefc] to-blue-500 flex items-center justify-center text-[#020617] font-bold">
              <span className="text-sm font-bold">A</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
