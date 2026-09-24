'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';

const POLL_INTERVAL_MS = 25_000;

interface VersionPayload {
  version?: string;
  sha?: string;
  shortVersion?: string;
  shortSha?: string;
  message?: string;
  builtAt?: string;
  committedAt?: string;
  author?: string;
}

export function UpdateNotifier() {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [versionData, setVersionData] = useState<VersionPayload | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const initialVersionRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCurrentVersion = useCallback(async (): Promise<VersionPayload | null> => {
    // 1. Try local App Router dynamic endpoint
    try {
      const res = await fetch(`/api/version?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.version || data.sha)) return data;
      }
    } catch {
      // continue to fallback
    }

    // 2. Try static public version.json
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.version || data.sha)) return data;
      }
    } catch {
      // continue to fallback
    }

    // 3. Try backend version endpoint
    try {
      const res = await fetch('/api/v1/version', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.version || data.sha)) return data;
      }
    } catch {
      // silent
    }

    return null;
  }, []);

  const checkForUpdate = useCallback(async () => {
    const data = await fetchCurrentVersion();
    if (!data) return;

    const serverVer = data.version || data.sha || '';
    if (!serverVer) return;

    // Record initial version on first fetch
    if (!initialVersionRef.current) {
      initialVersionRef.current = serverVer;
      return;
    }

    // If server version has changed compared to when this tab loaded
    if (serverVer !== initialVersionRef.current) {
      setVersionData(data);
      setOpen(true);
    }
  }, [fetchCurrentVersion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial check after 3 seconds
    const initialTimer = setTimeout(() => {
      checkForUpdate();
    }, 3_000);

    // Periodic polling
    intervalRef.current = setInterval(checkForUpdate, POLL_INTERVAL_MS);

    // Also check on tab focus or visibility change
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };
    const onFocus = () => {
      checkForUpdate();
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [checkForUpdate]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Hard refresh to reload updated bundles from the server
    window.location.reload();
  };

  if (!mounted || !open) return null;

  const isBn = locale === 'bn';
  const badgeText = isBn ? 'নতুন আপডেট' : 'Live Update';
  const titleText = isBn ? 'নতুন সংস্করণ প্রকাশিত হয়েছে' : 'New Update Deployed';
  const messageText = isBn
    ? 'নতুন আপডেট এসেছে, আপডেট দেখতে রিফ্রেশ বাটনে চাপ দিন'
    : 'Here are some update, press refresh button to check the Update';
  const refreshText = isBn ? 'রিফ্রেশ করে আপডেট দেখুন' : 'Refresh to Update';

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      role="alertdialog"
      aria-labelledby="update-dialog-title"
      aria-describedby="update-dialog-message"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-primary/50 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300 pointer-events-auto"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 14%, var(--color-surface)) 0%, var(--color-surface) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 35px -5px var(--accent-glow-strong)',
        }}
      >
        {/* Ambient glow accent */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />

        <div className="relative p-5 sm:p-6">
          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              {badgeText}
            </span>
          </div>

          {/* Heading */}
          <h3
            id="update-dialog-title"
            className="text-base sm:text-lg font-bold text-on-surface mb-2.5 leading-snug"
          >
            {titleText}
          </h3>

          {/* Main User Notification Text */}
          <p
            id="update-dialog-message"
            className="text-sm text-on-surface/90 leading-relaxed mb-5 rounded-xl bg-surface-container/60 p-3.5 border border-outline-variant/50 font-medium"
          >
            {messageText}
          </p>

          {/* Refresh Action Button (Persistent - no close/later option) */}
          <div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:opacity-95 active:scale-[0.98] disabled:opacity-75 cursor-pointer"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary, var(--color-primary)) 100%)',
                boxShadow: '0 10px 24px -6px var(--accent-glow-strong)',
              }}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
