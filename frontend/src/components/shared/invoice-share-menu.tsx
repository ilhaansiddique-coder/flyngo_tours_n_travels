'use client';

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Share2, MessageCircle, Mail, Facebook, Check, Send, Loader2, FileDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

interface InvoiceShareMenuProps {
  invoiceId: string;
  invoiceNumber: string;
  bookingCode?: string;
  currency?: string;
  total?: number;
  onSendEmail?: (id: string) => Promise<unknown>;
  onDownloadPdf?: (id: string) => Promise<void>;
  className?: string;
}

export function InvoiceShareMenu({
  invoiceId,
  invoiceNumber,
  bookingCode,
  currency = 'BDT',
  total = 0,
  onSendEmail,
  onDownloadPdf,
  className,
}: InvoiceShareMenuProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const mounted = useMounted();
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    openUpwards: boolean;
  } | null>(null);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const payUrl = bookingCode ? `${siteUrl}/pay/${bookingCode}` : siteUrl;
  const shareText = `Invoice ${invoiceNumber} — ${currency} ${Number(total).toLocaleString('en-BD', { minimumFractionDigits: 2 })}\n${payUrl}`;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 224; // w-56
    const estimatedHeight = 260;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpwards = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    let left = rect.right - menuWidth;
    if (left + menuWidth > window.innerWidth - 12) {
      left = window.innerWidth - menuWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    const top = openUpwards ? rect.top - 8 : rect.bottom + 8;
    setCoords({ top, left, openUpwards });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleScrollResize = () => {
      updatePosition();
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('resize', handleScrollResize);
    window.addEventListener('scroll', handleScrollResize, true);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('resize', handleScrollResize);
      window.removeEventListener('scroll', handleScrollResize, true);
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, updatePosition]);

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(payUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Invoice ${invoiceNumber} — Flyngo`);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSendEmail = async () => {
    if (!onSendEmail) return;
    setSending(true);
    setSendError(null);
    try {
      await onSendEmail(invoiceId);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err: any) {
      setSendError(err?.message || 'Failed to send email');
      setTimeout(() => setSendError(null), 5000);
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!onDownloadPdf) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await onDownloadPdf(invoiceId);
    } catch (err: any) {
      setDownloadError(err?.message || 'Failed to download PDF');
      setTimeout(() => setDownloadError(null), 5000);
    } finally {
      setDownloading(false);
      setOpen(false);
    }
  };

  return (
    <div className={cn('relative inline-block', className)} ref={triggerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share
      </button>

      {mounted && open && coords && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: coords.openUpwards ? 'translateY(-100%)' : 'none',
            zIndex: 9999,
          }}
          className="w-56 rounded-2xl border border-outline-variant bg-surface shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Share invoice</span>
            <button type="button" onClick={() => setOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
              <span className="sr-only">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-0.5 px-1 pb-1">
            <button
              type="button"
              onClick={() => { handleWhatsApp(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container/70 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => { handleFacebook(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container/70 transition-colors cursor-pointer"
            >
              <Facebook className="w-4 h-4 text-[#1877F2]" />
              Facebook
            </button>
            <button
              type="button"
              onClick={() => { handleEmail(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container/70 transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4 text-on-surface-variant" />
              Email (link)
            </button>

            {onDownloadPdf && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container/70 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4 text-on-surface-variant" />
                )}
                View / Download PDF
              </button>
            )}
            {downloadError && (
              <div className="px-3 py-1 text-xs text-red-500">{downloadError}</div>
            )}

            {onSendEmail && (
              <>
                <div className="border-t border-outline-variant/60 my-1" />
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-surface-container/70 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : sent ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {sent ? 'Sent!' : 'Send to my email'}
                </button>
                {sendError && (
                  <div className="px-3 py-1 text-xs text-red-500">{sendError}</div>
                )}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
