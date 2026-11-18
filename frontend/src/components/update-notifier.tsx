'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';

const POLL_INTERVAL_MS = 25_000;

export function UpdateNotifier() {
  const { locale } = useLocale();
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);
  // Compare against the loaded bundle, including updates before the first poll.
  const initialVersion = useRef<string | null>(process.env.NEXT_PUBLIC_BUILD_SHA || null);
  const dismissedVersion = useRef<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let checking = false;
    const controller = new AbortController();
    const check = async () => {
      if (checking || document.visibilityState === 'hidden') return;
      checking = true;
      try {
        const response = await fetch('/api/version', { cache: 'no-store', signal: controller.signal });
        if (!response.ok || disposed) return;
        const data = await response.json();
        const version = data.version || data.sha;
        if (typeof version !== 'string' || !version || disposed) return;
        if (!initialVersion.current) initialVersion.current = version;
        if (version !== initialVersion.current && version !== dismissedVersion.current) setAvailableVersion(version);
      } catch { /* Update checks must never interrupt work on network failure. */ }
      finally { checking = false; }
    };
    const initialTimer = setTimeout(check, 3_000);
    const interval = setInterval(check, POLL_INTERVAL_MS);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      disposed = true;
      controller.abort();
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);

  if (!availableVersion) return null;
  const isBn = locale === 'bn';
  return createPortal(
    <aside aria-label={isBn ? 'ওয়েবসাইট আপডেট' : 'Website update'}
      className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:w-96 rounded-2xl border border-hairline bg-surface p-4 shadow-xl">
      <p role="status" className="text-sm text-on-surface">
        {isBn ? 'নতুন আপডেট এসেছে। কাজ চালিয়ে যেতে পারেন। রিফ্রেশ করার আগে পরিবর্তনগুলো সেভ করুন।'
          : 'An update is available. You can keep working. Save your changes before refreshing.'}
      </p>
      <div className="mt-3 flex justify-end gap-3">
        <button type="button" className="rounded-lg px-3 py-2 text-sm text-on-surface" onClick={() => {
          dismissedVersion.current = availableVersion;
          setAvailableVersion(null);
        }}>{isBn ? 'পরে' : 'Later'}</button>
        <button type="button" className="rounded-lg bg-primary px-3 py-2 text-sm text-white" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 inline h-4 w-4" />{isBn ? 'রিফ্রেশ করুন' : 'Refresh'}
        </button>
      </div>
    </aside>, document.body,
  );
}
