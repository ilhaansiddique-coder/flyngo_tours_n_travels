'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Activity,
  Heart,
  BookOpen,
  Menu,
  Info,
  Image,
  Users,
  Bell,
  MessageCircle,
  User,
  HelpCircle,
  Calculator,
  X,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

interface TabItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ size?: number; fill?: string; className?: string }>;
  labelEn: string;
  labelBn: string;
  match: (pathname: string) => boolean;
}

interface MoreItem {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  labelEn: string;
  labelBn: string;
}

const TABS: TabItem[] = [
  {
    key: 'home',
    href: '/',
    icon: Home,
    labelEn: 'Home',
    labelBn: 'হোম',
    match: (p) => p === '/',
  },
  {
    key: 'activities',
    href: '/activities',
    icon: Activity,
    labelEn: 'Activities',
    labelBn: 'কার্যক্রম',
    match: (p) => p.startsWith('/activities'),
  },
  {
    key: 'donate',
    href: '/donate',
    icon: Heart,
    labelEn: 'Donate',
    labelBn: 'দান',
    match: (p) => p === '/donate',
  },
  {
    key: 'blog',
    href: '/blog',
    icon: BookOpen,
    labelEn: 'Blog',
    labelBn: 'ব্লগ',
    match: (p) => p.startsWith('/blog'),
  },
  {
    key: 'more',
    href: '#',
    icon: Menu,
    labelEn: 'More',
    labelBn: 'আরও',
    match: () => false,
  },
];

const MORE_ITEMS: MoreItem[] = [
  { href: '/about', icon: Info, labelEn: 'About Us', labelBn: 'আমাদের সম্পর্কে' },
  { href: '/gallery', icon: Image, labelEn: 'Gallery', labelBn: 'গ্যালারি' },
  { href: '/get-involved', icon: Users, labelEn: 'Connect With Us', labelBn: 'আমাদের সাথে যুক্ত হোন' },
  { href: '/notice', icon: Bell, labelEn: 'Notice', labelBn: 'নোটিশ' },
  { href: '/contact', icon: MessageCircle, labelEn: 'Contact', labelBn: 'যোগাযোগ' },
  { href: '/account', icon: User, labelEn: 'Account', labelBn: 'অ্যাকাউন্ট' },
  { href: '/faqs', icon: HelpCircle, labelEn: 'FAQs', labelBn: 'জিজ্ঞাসা' },
  { href: '/zakat-calculator', icon: Calculator, labelEn: 'Zakat Calculator', labelBn: 'যাকাত ক্যালকুলেটর' },
];

/* ------------------------------------------------------------------ */
/*  Language Toggle (reused from nav-bar-client pattern)               */
/* ------------------------------------------------------------------ */

function LangToggle() {
  const { lang, setLang } = useI18n();
  const isEn = lang === 'en';

  return (
    <div className="inline-flex h-9 items-center rounded-lg bg-[var(--color-mist)] p-0.5 text-xs font-bold text-[var(--color-ink-soft)]">
      <button
        type="button"
        onClick={() => { if (!isEn) setLang('en'); }}
        className={`flex h-8 items-center rounded-md px-3 font-semibold transition-all ${
          isEn
            ? 'bg-white text-[var(--color-primary)] shadow-sm'
            : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => { if (isEn) setLang('bn'); }}
        className={`flex h-8 items-center rounded-md px-3 font-semibold transition-all ${
          !isEn
            ? 'bg-white text-[var(--color-primary)] shadow-sm'
            : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
        }`}
        aria-label="Switch to Bangla"
      >
        বাংলা
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bottom Sheet                                                       */
/* ------------------------------------------------------------------ */

function MoreSheet({
  open,
  onClose,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  lang: string;
}) {
  const isBn = lang === 'bn';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-[var(--color-ink-faint)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-2">
              <h3 className="text-base font-bold text-[var(--color-ink)]">
                {isBn ? 'আরও' : 'More'}
              </h3>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink-soft)] hover:bg-black/5"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links grid */}
            <div className="grid grid-cols-4 gap-1 px-4 pb-3">
              {MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-center transition-colors hover:bg-[var(--color-primary-lighter)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-lighter)]">
                      <Icon size={20} className="text-[var(--color-primary)]" />
                    </div>
                    <span className="text-[11px] font-medium leading-tight text-[var(--color-ink-soft)]">
                      {isBn ? item.labelBn : item.labelEn}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Language toggle */}
            <div className="border-t border-black/5 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-ink-soft)]">
                  {isBn ? 'ভাষা পরিবর্তন' : 'Language'}
                </span>
                <LangToggle />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Bottom Nav                                                    */
/* ------------------------------------------------------------------ */

export function MobileBottomNav() {
  const pathname = usePathname() ?? '';
  const { lang } = useI18n();
  const [sheetOpen, setSheetOpen] = useState(false);
  const isBn = lang === 'bn';

  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const toggleSheet = useCallback(() => setSheetOpen((prev) => !prev), []);

  // Hide on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      {/* Bottom tab bar — visible only on mobile (hidden md+) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-black/5 bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-lg md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.match(pathname);
          const isDonate = tab.key === 'donate';
          const isMore = tab.key === 'more';
          const label = isBn ? tab.labelBn : tab.labelEn;

          /* ---------- Donate (center FAB) ---------- */
          if (isDonate) {
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className="relative flex flex-col items-center justify-center -mt-4"
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/30"
                  whileTap={{ scale: 0.92 }}
                  animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Icon size={22} className="text-white" fill="white" />
                </motion.div>
                <span
                  className={`mt-1 text-[10px] font-medium ${
                    isActive
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-ink-muted)]'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          }

          /* ---------- More (opens bottom sheet) ---------- */
          if (isMore) {
            return (
              <button
                key={tab.key}
                type="button"
                onClick={toggleSheet}
                className="flex flex-col items-center justify-center gap-0.5"
              >
                <motion.div
                  animate={sheetOpen ? { scale: 1.15 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Icon
                    size={22}
                    className={
                      sheetOpen
                        ? 'text-[var(--color-primary)]'
                        : 'text-[var(--color-ink-muted)]'
                    }
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-medium ${
                    sheetOpen
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-ink-muted)]'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          }

          /* ---------- Regular tab ---------- */
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5"
            >
              <motion.div
                animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Icon
                  size={22}
                  className={
                    isActive
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-ink-muted)]'
                  }
                />
              </motion.div>
              <span
                className={`text-[10px] font-medium ${
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-ink-muted)]'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* More bottom sheet */}
      <MoreSheet open={sheetOpen} onClose={closeSheet} lang={lang} />
    </>
  );
}
