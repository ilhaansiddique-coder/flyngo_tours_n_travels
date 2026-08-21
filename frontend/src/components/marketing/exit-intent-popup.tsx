'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, Gift } from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'flyngo_exit_intent_shown';
const DELAY_MS = 30_000;

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/dashboard')) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let triggered = false;
    const show = () => {
      if (triggered) return;
      triggered = true;
      setOpen(true);
      sessionStorage.setItem(STORAGE_KEY, '1');
    };

    // Desktop: mouse leaving the viewport from the top
    const onMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget === null && e.clientY < 50) show();
    };
    document.addEventListener('mouseout', onMouseOut);

    // Mobile fallback: after 30s of scroll inactivity
    const timer = setTimeout(show, DELAY_MS);

    return () => {
      document.removeEventListener('mouseout', onMouseOut);
      clearTimeout(timer);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
      <div className="relative bg-gradient-to-br from-accent/20 via-tertiary/15 to-primary/20 border border-accent/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4 mx-auto">
          <Gift className="w-8 h-8 text-accent" />
        </div>

        <h3 className="font-display text-2xl font-bold text-center mb-2">
          Wait — don't leave without your gift!
        </h3>
        <p className="text-on-surface-variant text-center mb-6 text-sm">
          Get an instant <span className="font-bold text-accent">5% discount</span> on your first Hajj or Umrah booking when you sign up today.
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href="/auth/register"
            className="bg-accent text-on-primary font-bold py-3 rounded-xl text-center hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4 inline mr-2" /> Claim my discount
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-on-surface-variant hover:text-on-surface"
          >
            No thanks, I'll pay full price
          </button>
        </div>
      </div>
    </div>
  );
}
