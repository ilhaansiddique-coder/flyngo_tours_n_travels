'use client';

import { useState } from 'react';
import { Share2, MessageCircle, Mail, Facebook, Check, Send, Loader2, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const payUrl = bookingCode ? `${siteUrl}/pay/${bookingCode}` : siteUrl;
  const shareText = `Invoice ${invoiceNumber} — ${currency} ${Number(total).toLocaleString('en-BD', { minimumFractionDigits: 2 })}\n${payUrl}`;

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
    <div className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-on-surface-variant hover:text-primary transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share
      </button>

      {open && (
        <div className="absolute z-50 mt-2 right-0 w-56 rounded-2xl border border-outline-variant bg-surface shadow-xl p-1.5">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Share invoice</span>
            <button type="button" onClick={() => setOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
              <span className="sr-only">Close</span>
              &times;
            </button>
          </div>

          <div className="space-y-0.5 px-1 pb-1">
            <button
              type="button"
              onClick={() => { handleWhatsApp(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container/70 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => { handleFacebook(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container/70 transition-colors"
            >
              <Facebook className="w-4 h-4 text-[#1877F2]" />
              Facebook
            </button>
            <button
              type="button"
              onClick={() => { handleEmail(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container/70 transition-colors"
            >
              <Mail className="w-4 h-4 text-on-surface-variant" />
              Email (link)
            </button>

            {onDownloadPdf && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container/70 transition-colors disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4 text-on-surface-variant" />
                )}
                Download PDF
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
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-surface-container/70 transition-colors disabled:opacity-50"
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
        </div>
      )}
    </div>
  );
}
