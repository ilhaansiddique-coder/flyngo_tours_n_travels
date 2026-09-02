'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'flyngo_cookie_consent';
const CONSENT_EVENT = 'flyngo:consent';

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) setOpen(true);
  }, []);

  const decide = (decision: 'all' | 'essential') => {
    try {
      localStorage.setItem(STORAGE_KEY, decision);
    } catch {}
    setOpen(false);
    // Let tracking clients react live (pixels load when consent turns 'all')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: decision }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 bg-surface-container-high border border-outline-variant rounded-2xl p-4 shadow-2xl backdrop-blur print:hidden">
      <p className="text-sm font-semibold mb-1">We use cookies</p>
      <p className="text-xs text-on-surface-variant mb-3">
        We use cookies for analytics, marketing (Meta/Google) and personalization. By clicking &ldquo;Accept all&rdquo;, you consent to our use of cookies. Read our <a href="/privacy" className="underline">privacy policy</a>.
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => decide('essential')}>Essential only</Button>
        <Button size="sm" onClick={() => decide('all')}>Accept all</Button>
      </div>
    </div>
  );
}
