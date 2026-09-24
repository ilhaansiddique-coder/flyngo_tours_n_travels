'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';

const POLL_INTERVAL_MS = 25_000;
const DISMISSED_KEY = 'flyngo:dismissed_version';

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
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [versionData, setVersionData] = useState<VersionPayload | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const initialVersionRef = useRef<string | null>(null);
  const dismissedVersionRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      dismissedVersionRef.current = window.sessionStorage.getItem(DISMISSED_KEY);
    } catch {
      // ignore
    }
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
      // Check if user dismissed this specific version in this session
      if (dismissedVersionRef.current === serverVer) {
        return;
      }

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
    const ver = versionData?.version || versionData?.sha;
    if (ver) {
      try {
        window.sessionStorage.removeItem(DISMISSED_KEY);
      } catch {
        // ignore
      }
    }
    // Hard refresh to reload updated bundles from the server
    window.location.reload();
  };

  const handleDismiss = () => {
    const ver = versionData?.version || versionData?.sha;
    if (ver) {
      dismissedVersionRef.current = ver;
      try {
        window.sessionStorage.setItem(DISMISSED_KEY, ver);
      } catch {
        // ignore
      }
    }
    setOpen(false);
  };

  if (!mounted || !open) return null;

  const isBn = locale === 'bn';
  const badgeText = isBn ? 'নতুন আপডেট' : 'Live Update';
  const titleText = isBn ? 'নতুন সংস্করণ প্রকাশিত হয়েছে' : 'New Update Deployed';
  const messageText = isBn
    ? 'নতুন আপডেট এসেছে, আপডেট দেখতে রিফ্রেশ বাটনে চাপ দিন'
    : 'Here are some update, press refresh button to check the Update';
  const refreshText = isBn ? 'রিফ্রেশ করুন' : 'Refresh';
  const laterText = isBn ? 'পরে' : 'Later';

  return createPortal(
    <div
      className="fixed bottom-5 right-5 z-[99999] w-[min(400px,calc(100vw-2.5rem))] animate-in slide-in-from-bottom-5 fade-in duration-300"
      role="alertdialog"
      aria-labelledby="update-dialog-title"
      aria-describedby="update-dialog-message"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-primary/40 shadow-2xl backdrop-blur-xl"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 12%, var(--color-surface)) 0%, var(--color-surface) 100%)',
        }}
      >
        {/* Ambient glow accent */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/25 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="absolute top-3.5 right-3.5 rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-5">
          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {badgeText}
            </span>
          </div>

          {/* Heading */}
          <h3
            id="update-dialog-title"
            className="text-base font-bold text-on-surface mb-2 pr-6 leading-snug"
          >
            {titleText}
          </h3>

          {/* Main User Notification Text */}
          <p
            id="update-dialog-message"
            className="text-sm text-on-surface/90 leading-relaxed mb-4 rounded-xl bg-surface-container/50 p-3 border border-outline-variant/40"
          >
            {messageText}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary, var(--color-primary)) 100%)',
                boxShadow: '0 8px 20px -6px var(--accent-glow-strong)',
              }}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshText}
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center justify-center gap-1 rounded-xl px-3.5 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface border border-outline-variant transition cursor-pointer"
            >
              {laterText}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
