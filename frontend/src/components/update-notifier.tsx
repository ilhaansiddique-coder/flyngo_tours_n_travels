'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw, GitCommit, ArrowRight } from 'lucide-react';

const POLL_INTERVAL_MS = 30_000;
const STORAGE_KEY = 'flyngo:installedSha';

interface VersionInfo {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  committedAt: string;
  repo: string;
  branch: string;
  deployedAt: string;
}

const CURRENT_SHA = process.env.NEXT_PUBLIC_BUILD_SHA || '';

export function UpdateNotifier() {
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSeenRef = useRef<string>(CURRENT_SHA);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Suppress the notifier entirely in local dev, where the build has no SHA.
    if (!CURRENT_SHA) return;

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== CURRENT_SHA) {
      try {
        const parsed = JSON.parse(stored);
        lastSeenRef.current = parsed.sha || stored;
      } catch {
        lastSeenRef.current = stored;
      }
    } else {
      lastSeenRef.current = CURRENT_SHA;
    }

    const check = async () => {
      try {
        const res = await fetch('/api/v1/version', { cache: 'no-store' });
        if (!res.ok) return;
        const data: VersionInfo = await res.json();
        if (!data.sha) return;
        if (data.sha !== lastSeenRef.current && data.sha !== CURRENT_SHA) {
          setVersion(data);
          setOpen(true);
        }
      } catch {
        // silent
      }
    };

    const initialTimer = setTimeout(check, 3_000);
    intervalRef.current = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleRefresh = () => {
    if (version) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(version));
    }
    window.location.reload();
  };

  const handleDismiss = () => {
    if (version) {
      lastSeenRef.current = version.sha;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(version));
    }
    setOpen(false);
  };

  if (!mounted || !open || !version) return null;

  const message = version.message.split('\n')[0];
  const date = new Date(version.committedAt).toLocaleString();

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-[9999] w-[min(380px,calc(100vw-2rem))] animate-in slide-in-from-bottom-4 fade-in duration-300"
      role="alertdialog"
      aria-labelledby="update-title"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-primary/30 shadow-2xl backdrop-blur-xl"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 8%, var(--color-surface)) 0%, var(--color-surface) 100%)',
        }}
      >
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />

        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="absolute top-3 right-3 rounded-lg p-1 text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Live Update Available
            </span>
          </div>

          <h3 id="update-title" className="text-base font-semibold text-on-surface mb-2 pr-6">
            New version deployed
          </h3>

          <div className="flex items-start gap-2.5 mb-3 rounded-lg bg-surface-container/40 p-2.5 border border-outline-variant/50">
            <GitCommit className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              {message && (
                <p className="text-sm text-on-surface break-words line-clamp-2">{message}</p>
              )}
              <div className="mt-1.5 flex items-center gap-2 text-xs text-on-surface-variant">
                <code className="font-mono px-1.5 py-0.5 rounded bg-surface-container-high">
                  {version.shortSha}
                </code>
                {version.author && (
                  <>
                    <span>·</span>
                    <span className="truncate">{version.author}</span>
                  </>
                )}
                <span>·</span>
                <span className="shrink-0">{date}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
                boxShadow: '0 8px 20px -6px var(--accent-glow-strong)',
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh now
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface border border-outline-variant transition"
            >
              Later
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
