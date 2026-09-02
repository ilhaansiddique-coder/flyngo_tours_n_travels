'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/tracking-client';

interface TrackingPublicSettings {
  whatsappNumber?: string | null;
  whatsappGreeting?: string | null;
}

export function FloatingWhatsApp() {
  const [settings, setSettings] = useState<TrackingPublicSettings | null>(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = (await api.get('/tracking/settings/public')) as TrackingPublicSettings;
        if (mounted) setSettings(res);
      } catch { /* silent */ }
    })();
    return () => { mounted = false; };
  }, []);

  // Show after a small scroll so it doesn't cover the hero CTA
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!settings?.whatsappNumber) return null;
  if (!visible) return null;

  const phone = settings.whatsappNumber.replace(/[^\d]/g, '');
  const greeting = settings.whatsappGreeting || 'Hi! I am interested in your Hajj/Umrah/travel packages. Could you share more details?';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <div className="bg-surface-container-high border border-outline-variant rounded-2xl shadow-2xl w-72 p-4 backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold">Chat with us</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mb-3">
            Average response time: <span className="font-bold text-on-surface">under 2 minutes</span>
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('contact', { contentName: 'whatsapp_click' })}
            className="block text-center bg-[#25D366] hover:bg-[#1FB358] text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Start WhatsApp chat
          </a>
          <p className="text-[10px] text-center text-on-surface-variant mt-2">
            Hajj · Umrah · Tours · Visa
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-[#25D366] hover:bg-[#1FB358] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
          1
        </span>
      </button>
    </div>
  );
}
