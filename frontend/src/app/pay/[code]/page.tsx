'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InvoiceShareMenu } from '@/components/shared/invoice-share-menu';
import {
  Check, Copy, Loader2, AlertCircle, Building, Smartphone, Banknote,
  Upload, X, Image as ImageIcon, FileText,
} from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';

type Method = string;

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string | null;
  routingNumber?: string | null;
  swiftCode?: string | null;
  instructions?: string | null;
}

interface MobileWallet {
  id: string;
  provider: string;
  accountName: string;
  walletNumber: string;
  accountType?: string | null;
  instructions?: string | null;
}

const WALLET_LABELS: Record<string, string> = {
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
  upay: 'Upay',
  tap: 'Tap',
  surecash: 'SureCash',
  mcash: 'mCash',
};

function resolveCheckoutWallets(methods: any): MobileWallet[] {
  const list = Array.isArray(methods?.wallets) ? (methods.wallets as MobileWallet[]) : [];
  if (list.length) return list.filter((w) => w.walletNumber);
  if (methods?.bkash?.walletNumber) {
    return [{
      id: '',
      provider: 'bkash',
      accountName: methods.bkash.merchantName || 'bKash',
      walletNumber: methods.bkash.walletNumber,
      accountType: 'merchant',
    }];
  }
  return [];
}

interface PaymentRow {
  id: string;
  amount: number;
  method: string;
  status: string;
  bkashTrxId?: string | null;
  createdAt: string;
  invoice?: { id: string; invoiceNumber: string } | null;
}

interface Summary {
  bookingCode: string;
  bookingType: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  currency: string;
  customerName?: string | null;
  payments: PaymentRow[];
}

export default function PayPage() {
  const params = useParams<{ code: string }>();
  const code = decodeURIComponent(params.code || '');
  const { t, locale } = useLocale();
  const isBn = locale === 'bn';
  const {
    getPaymentMethods, getBookingPayment, uploadPaymentReceipt, submitPaymentConfirmation, sendInvoiceEmail,
  } = useApi();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [wallets, setWallets] = useState<MobileWallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [instructions, setInstructions] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [method, setMethod] = useState<Method>('');
  const [bkashTrxId, setBkashTrxId] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [senderName, setSenderName] = useState('');
  const [receiptUrls, setReceiptUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, methods] = await Promise.all([
        getBookingPayment(code) as Promise<Summary>,
        getPaymentMethods() as Promise<any>,
      ]);
      setSummary(sum);
      const nextWallets = resolveCheckoutWallets(methods);
      setWallets(nextWallets);
      if (nextWallets[0]) {
        setSelectedWalletId((prev) => prev || nextWallets[0].id);
        setMethod((prev) => prev || nextWallets[0].provider);
      } else {
        setMethod((prev) => prev || 'bank_transfer');
      }
      setInstructions(methods?.instructions || null);
      setAccounts(methods?.bankAccounts || []);
      if (methods?.bankAccounts?.[0]?.id) setBankAccountId((prev) => prev || methods.bankAccounts[0].id);
    } catch (err: any) {
      setError(err.message || 'Booking not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('method');
    if (q) setMethod(q);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  const onReceipt = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const res = (await uploadPaymentReceipt(file)) as { url: string };
        if (res?.url) setReceiptUrls((prev) => [...prev, res.url]);
      }
    } catch (err: any) {
      setError(err.message || 'Receipt upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!summary) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitPaymentConfirmation({
        bookingCode: summary.bookingCode,
        method,
        bkashTrxId: wallets.some((w) => w.provider === method) ? bkashTrxId : undefined,
        mobileWalletId: wallets.some((w) => w.provider === method) && selectedWalletId ? selectedWalletId : undefined,
        bankAccountId: method === 'bank_transfer' ? bankAccountId : undefined,
        receiptUrls,
        senderName: senderName || undefined,
      });
      setDone(true);
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen surface-page pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </main>
    );
  }

  if (error && !summary) {
    return (
      <main className="min-h-screen surface-page pt-24 pb-16 flex items-center justify-center">
        <div className="glass max-w-md w-full p-8 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-500" />
          <p className="text-on-surface font-semibold mb-4">{error}</p>
          <Link href="/"><Button variant="ghost">{isBn ? 'হোমে যান' : 'Back home'}</Button></Link>
        </div>
      </main>
    );
  }

  const paid = !summary || summary.balanceDue <= 0;
  const selectedBank = accounts.find((a) => a.id === bankAccountId);

  return (
    <main className="min-h-screen surface-page pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted">{t('booking_booking_code')}</p>
          <h1 className="font-display text-3xl font-bold text-on-surface font-mono">{summary?.bookingCode}</h1>
          <p className="text-muted mt-1 capitalize">{summary?.bookingType} · {summary?.customerName || ''}</p>
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted">{isBn ? 'বকেয়া' : 'Balance due'}</span>
            <span className="font-display text-2xl font-bold">
              {formatCurrency(summary?.balanceDue || 0, summary?.currency || 'BDT')}
            </span>
          </div>
          <div className="text-xs text-muted mt-1">
            {isBn ? 'মোট' : 'Total'} {formatCurrency(summary?.totalAmount || 0, summary?.currency || 'BDT')}
            {' · '}
            {isBn ? 'পরিশোধিত' : 'Paid'} {formatCurrency(summary?.paidAmount || 0, summary?.currency || 'BDT')}
          </div>
        </div>

        {done && (
          <div className="mb-6 p-4 rounded-xl border text-sm" style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--color-primary) 30%, transparent)' }}>
            <div className="flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4" />
              {isBn ? 'পেমেন্ট রেকর্ড হয়েছে এবং ইনভয়েস তৈরি হয়েছে।' : 'Payment recorded and your invoice has been generated.'}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-xl flex items-center gap-2 text-sm border" style={{ backgroundColor: 'color-mix(in oklab, var(--color-error, #ef4444) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--color-error, #ef4444) 30%, transparent)', color: 'var(--color-error, #ef4444)' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!paid && (
          <div className="glass rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                ...Array.from(new Set(wallets.map((w) => w.provider))).map((provider) => ({
                  id: provider,
                  icon: Smartphone,
                  label: WALLET_LABELS[provider] || provider,
                })),
                { id: 'bank_transfer', icon: Building, label: isBn ? 'ব্যাংক' : 'Bank' },
                { id: 'cash', icon: Banknote, label: isBn ? 'নগদ' : 'Cash' },
              ]).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMethod(m.id);
                    const first = wallets.find((w) => w.provider === m.id);
                    if (first) setSelectedWalletId(first.id);
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left ${method === m.id ? 'border-[var(--color-primary)]' : 'border-soft'}`}
                  style={method === m.id ? { backgroundColor: 'color-mix(in oklab, var(--color-primary) 12%, transparent)' } : undefined}
                >
                  <m.icon className="w-4 h-4" style={{ color: method === m.id ? 'var(--color-primary)' : 'var(--color-muted)' }} />
                  <span className="text-sm font-semibold">{m.label}</span>
                </button>
              ))}
            </div>

            {instructions && <p className="text-sm text-muted">{instructions}</p>}

            {wallets.some((w) => w.provider === method) && (
              <div className="space-y-4">
                {wallets.filter((w) => w.provider === method).map((w) => (
                  <button
                    key={w.id || w.walletNumber}
                    type="button"
                    onClick={() => setSelectedWalletId(w.id)}
                    className={`w-full rounded-xl border p-4 flex items-center justify-between text-left ${(!selectedWalletId && wallets.filter((x) => x.provider === method)[0]?.id === w.id) || selectedWalletId === w.id ? 'border-[var(--color-primary)]' : 'border-soft'}`}
                  >
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted">{w.accountName || WALLET_LABELS[w.provider] || w.provider}{w.accountType ? ` · ${w.accountType}` : ''}</div>
                      <div className="font-mono text-lg font-bold">{w.walletNumber}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copy(w.walletNumber); }}><Copy className="w-4 h-4" /></Button>
                  </button>
                ))}
                <Input
                  label={isBn ? `${WALLET_LABELS[method] || method} ট্রানজেকশন আইডি` : `${WALLET_LABELS[method] || method} Transaction ID`}
                  value={bkashTrxId}
                  onChange={(e) => setBkashTrxId(e.target.value)}
                  placeholder="e.g. 9J3XXXXXXX"
                />
              </div>
            )}

            {method === 'bank_transfer' && (
              <div className="space-y-4">
                {accounts.length === 0 ? (
                  <p className="text-sm text-muted">{isBn ? 'কোনো ব্যাংক হিসাব পাওয়া যায়নি।' : 'No bank accounts configured yet.'}</p>
                ) : (
                  <div className="space-y-2">
                    {accounts.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setBankAccountId(a.id)}
                        className={`w-full text-left p-4 rounded-xl border ${bankAccountId === a.id ? 'border-[var(--color-primary)]' : 'border-soft'}`}
                      >
                        <div className="font-semibold text-sm">{a.bankName}</div>
                        <div className="text-xs text-muted">{a.accountName}</div>
                        <div className="font-mono text-sm mt-1">{a.accountNumber}</div>
                        {a.branch && <div className="text-xs text-muted">{a.branch}</div>}
                      </button>
                    ))}
                  </div>
                )}
                {selectedBank && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copy(selectedBank.accountNumber)}>
                      <Copy className="w-3 h-3 mr-1" /> {isBn ? 'হিসাব নম্বর কপি' : 'Copy account no.'}
                    </Button>
                  </div>
                )}
                {selectedBank?.instructions && <p className="text-xs text-muted">{selectedBank.instructions}</p>}
                <Input
                  label={isBn ? 'প্রেরকের নাম (ঐচ্ছিক)' : 'Sender name (optional)'}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
              </div>
            )}

            {method === 'cash' && (
              <p className="text-sm text-muted">
                {isBn ? 'নগদ পরিশোধের অনুরোধ জমা দিন। আমাদের টিম যোগাযোগ করবে।' : 'Submit a cash payment request. Our team will contact you to collect.'}
              </p>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                {isBn ? 'মানি রিসিপ্ট ছবি' : 'Money receipt image'}
                {method === 'bank_transfer' ? ' *' : ` (${isBn ? 'ঐচ্ছিক' : 'optional'})`}
              </label>
              <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed border-soft cursor-pointer text-sm text-muted">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {isBn ? 'ছবি আপলোড করুন' : 'Upload receipt photo'}
                <input type="file" accept="image/*,.pdf" className="hidden" multiple onChange={(e) => onReceipt(e.target.files)} />
              </label>
              {receiptUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {receiptUrls.map((url) => (
                    <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-soft">
                      {url.match(/\.pdf($|\?)/i) ? (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5" /></div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="receipt" className="w-full h-full object-cover" />
                      )}
                      <button type="button" className="absolute top-0 right-0 bg-black/60 text-white p-0.5" onClick={() => setReceiptUrls((p) => p.filter((u) => u !== url))}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button size="lg" className="w-full" disabled={submitting || uploading} onClick={submit}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isBn ? 'পেমেন্ট নিশ্চিত করুন' : 'Submit payment confirmation'}
            </Button>
          </div>
        )}

        {paid && (
          <div className="glass rounded-2xl p-6 text-center">
            <Check className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
            <p className="font-semibold">{isBn ? 'এই বুকিং পরিশোধিত' : 'This booking is paid'}</p>
          </div>
        )}

        {summary && summary.payments.length > 0 && (
          <div className="mt-8 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted">{isBn ? 'জমাকৃত পেমেন্ট' : 'Submitted payments'}</h2>
            {summary.payments.map((p) => (
              <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{formatCurrency(Number(p.amount), summary.currency)} · {p.method}</div>
                  <div className="text-xs text-muted">{p.bkashTrxId || p.status} · {new Date(p.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase">{p.status}</span>
                  {p.invoice && (
                    <>
                      <a
                        href={`/api/v1/invoices/public/${encodeURIComponent(summary?.bookingCode || '')}/${p.invoice.id}/pdf?inline=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-soft text-[10px] font-mono font-semibold text-primary hover:underline transition-colors"
                        title={`Open ${p.invoice.invoiceNumber}`}
                      >
                        <FileText className="w-3 h-3" />
                        {p.invoice.invoiceNumber}
                      </a>
                      <InvoiceShareMenu
                        invoiceId={p.invoice.id}
                        invoiceNumber={p.invoice.invoiceNumber}
                        bookingCode={summary?.bookingCode}
                        currency={summary?.currency}
                        total={Number(p.amount)}
                        onSendEmail={sendInvoiceEmail}
                        onDownloadPdf={async (id) => {
                          window.open(`/api/v1/invoices/public/${encodeURIComponent(summary?.bookingCode || '')}/${id}/pdf?inline=1`, '_blank');
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/dashboard"><Button variant="ghost">{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</Button></Link>
        </div>
      </div>
    </main>
  );
}
