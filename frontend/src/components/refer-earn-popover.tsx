'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '@/contexts/locale-context';
import {
  Gift, Sparkles, Award, Star, Heart, Crown, BadgePercent, Trophy,
  Coins, Wallet, Plane, X, ArrowRight, LucideIcon,
} from 'lucide-react';

const DISMISS_KEY = 'flyngo:refer-earn:dismissedAt';
const ICON_MAP: Record<string, LucideIcon> = {
  Gift,
  Sparkles,
  Award,
  Star,
  Heart,
  Crown,
  BadgePercent,
  Trophy,
  Coins,
  Wallet,
  Plane,
};

interface ReferEarnConfig {
  id?: string;
  isActive: boolean;
  badgeTextEn?: string | null;
  badgeTextBn?: string | null;
  titleEn?: string | null;
  titleBn?: string | null;
  bodyEn?: string | null;
  bodyBn?: string | null;
  rewardAmountEn?: string | null;
  rewardAmountBn?: string | null;
  rewardLabelEn?: string | null;
  rewardLabelBn?: string | null;
  currencyCode?: string;
  ctaTextEn?: string | null;
  ctaTextBn?: string | null;
  ctaHref?: string | null;
  imageUrl?: string | null;
  iconName?: string | null;
  delaySeconds: number;
  dismissDays: number;
  showOnPaths: string;
}

function shouldShow(path: string, pattern: string): boolean {
  if (!pattern) return true;
  try {
    const re = new RegExp(pattern);
    return re.test(path);
  } catch {
    return path.startsWith(pattern);
  }
}

function isDismissed(dismissDays: number): boolean {
  if (typeof window === 'undefined') return false;
  if (!dismissDays || dismissDays <= 0) return false;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    const ageMs = Date.now() - ts;
    return ageMs < dismissDays * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markDismissed() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function ReferEarnPopover() {
  const { locale } = useLocale();
  const [config, setConfig] = useState<ReferEarnConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    if (path.startsWith('/admin') || path.startsWith('/auth') || path.startsWith('/api')) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/refer-earn', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as ReferEarnConfig;
        if (cancelled) return;
        if (!data || !data.isActive) return;
        if (!shouldShow(path, data.showOnPaths ?? '/')) return;
        if (isDismissed(data.dismissDays ?? 7)) return;
        setConfig(data);
        const delayMs = Math.max(0, (data.delaySeconds ?? 8) * 1000);
        timerRef.current = setTimeout(() => {
          if (!cancelled) setOpen(true);
        }, delayMs);
      } catch {
        // silent — popover is non-critical
      }
    })();
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDismiss = () => {
    if (config) markDismissed();
    setOpen(false);
  };

  const handleCta = () => {
    if (config?.ctaHref) {
      window.location.href = config.ctaHref;
    }
  };

  const content = useMemo(() => {
    if (!config) return null;
    const isBn = locale === 'bn';
    const pick = <T,>(en: T | null | undefined, bn: T | null | undefined): T | undefined =>
      (isBn ? bn ?? en : en ?? bn) ?? undefined;
    return {
      badge: pick(config.badgeTextEn, config.badgeTextBn) || (isBn ? 'রেফার ও আয়' : 'Refer & Earn'),
      title: pick(config.titleEn, config.titleBn) || (isBn ? 'বন্ধুদের রেফার করুন, পুরস্কার নিন' : 'Refer friends, earn rewards'),
      body: pick(config.bodyEn, config.bodyBn) || (isBn ? 'আপনার লিঙ্ক শেয়ার করুন।' : 'Share your link.'),
      amount: pick(config.rewardAmountEn, config.rewardAmountBn) || '',
      rewardLabel: pick(config.rewardLabelEn, config.rewardLabelBn) || (isBn ? 'প্রতি বন্ধু' : 'per friend'),
      cta: pick(config.ctaTextEn, config.ctaTextBn) || (isBn ? 'আমার লিঙ্ক' : 'Get my link'),
      ctaHref: config.ctaHref || '/dashboard',
      imageUrl: config.imageUrl,
      iconName: config.iconName,
    };
  }, [config, locale]);

  if (!mounted || !open || !config || !content) return null;

  const Icon = (content.iconName && ICON_MAP[content.iconName]) || Gift;

  return createPortal(
    <div
      className="fixed bottom-4 left-4 z-[9998] w-[min(360px,calc(100vw-2rem))] animate-in slide-in-from-bottom-4 fade-in duration-500"
      role="dialog"
      aria-label={content.title}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-amber-500/30 shadow-2xl backdrop-blur-xl"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, #f59e0b 10%, var(--color-surface)) 0%, var(--color-surface) 100%)',
        }}
      >
        <div className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl" />

        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="absolute top-3 right-3 rounded-lg p-1 text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface transition z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-5">
          <div className="flex items-center gap-3 mb-3">
            {content.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={content.imageUrl}
                alt=""
                className="w-12 h-12 rounded-xl object-cover border border-amber-500/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="min-w-0 flex-1 pr-6">
              <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                {content.badge}
              </p>
              <p className="text-base font-bold text-on-surface truncate">{content.title}</p>
            </div>
          </div>

          <p className="text-sm text-on-surface-variant mb-4 line-clamp-3">
            {content.body}
          </p>

          {content.amount && (
            <div className="flex items-baseline gap-2 mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{content.amount}</span>
              <span className="text-xs text-on-surface-variant">{content.rewardLabel}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCta}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                boxShadow: '0 8px 20px -6px rgba(245, 158, 11, 0.5)',
              }}
            >
              {content.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface border border-outline-variant transition"
              aria-label="Later"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
