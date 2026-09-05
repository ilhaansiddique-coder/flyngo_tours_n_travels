'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { DestinationAutocomplete } from '@/components/ui/destination-autocomplete';
import { formatCurrency } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { useApi } from '@/hooks/use-api';
import {
  COUNTRY_DIALS,
  DEFAULT_COUNTRY_CODE,
  findDialByCode,
} from '@/lib/country-dial-codes';
import { useState, useEffect, useRef } from 'react';
import { Check, Loader2, Sparkles, MapPin, Wallet, Users as UsersIcon, Heart, ArrowRight, ArrowLeft, AlertCircle, Compass, Building2, Plane, Briefcase, Banknote, Building, Smartphone, Copy, Upload, X, FileText, Info, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/contexts/locale-context';
import { loadContact, saveContact } from '@/lib/contact-persist';

const STANDARD_STEPS = [
  { number: 1, key: 'booking_step_details' },
  { number: 2, key: 'booking_step_trip' },
  { number: 3, key: 'booking_step_review' },
  { number: 4, key: 'booking_step_checkout' },
];

const STANDARD_STEPS_GENERAL = [
  { number: 1, key: 'booking_step_details' },
  { number: 2, key: 'booking_step_trip' },
  { number: 3, key: 'booking_step_review' },
];

const TOUR_STEPS = [
  { number: 1, key: 'booking_step_details' },
  { number: 2, key: 'booking_step_review' },
  { number: 3, key: 'booking_step_checkout' },
];

const TOUR_STEPS_GENERAL = [
  { number: 1, key: 'booking_step_details' },
  { number: 2, key: 'booking_step_review' },
];

const VISA_STEPS = [
  { number: 1, key: 'booking_step_applicant' },
  { number: 2, key: 'booking_step_travel' },
  { number: 3, key: 'booking_step_documents' },
  { number: 4, key: 'booking_step_confirm' },
];

const VISA_STEPS_PRESET = [
  { number: 1, key: 'booking_step_applicant' },
  { number: 2, key: 'booking_step_documents' },
  { number: 3, key: 'booking_step_confirm' },
];

const CUSTOM_STEPS = [
  { number: 1, key: 'custom_step_destination', icon: MapPin },
  { number: 2, key: 'custom_step_dates', icon: Heart },
  { number: 3, key: 'custom_step_travelers', icon: UsersIcon },
  { number: 4, key: 'custom_step_preferences', icon: Sparkles },
  { number: 5, key: 'custom_step_contact', icon: Wallet },
];

type BookingType = 'tour' | 'hotel' | 'flight' | 'visa' | 'custom';

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

const TYPE_META: Record<BookingType, { icon: typeof Compass; accent: string }> = {
  tour: { icon: Compass, accent: 'primary' },
  hotel: { icon: Building2, accent: 'primary' },
  flight: { icon: Plane, accent: 'primary' },
  visa: { icon: Briefcase, accent: 'primary' },
  custom: { icon: Sparkles, accent: 'primary' },
};

const URL_TYPE_MAP: Record<string, BookingType> = {
  tour: 'tour',
  hotel: 'hotel',
  flight: 'flight',
  visa: 'visa',
  custom: 'custom',
  destination: 'tour',
  hajj: 'tour',
  umrah: 'tour',
  transport: 'tour',
};

const URL_TYPE_SENT: Record<string, string> = {
  hajj: 'hajj',
  umrah: 'umrah',
  transport: 'transport',
  destination: 'destination',
};

function ItemSummaryCard({ t }: { t: (k: any) => string }) {
  const { selectedItem } = useBookingStore();
  const item = (selectedItem as any) || {};
  const hasItem = !!(item?.title || item?.name);

  return (
    <div className="glass rounded-2xl p-5 sticky top-28">
      <div className="text-[10px] uppercase tracking-widest font-bold text-muted mb-2">
        {t('booking_your_selection')}
      </div>
      {hasItem ? (
        <div>
          <div className="font-display text-lg font-bold text-on-surface leading-tight">
            {item.title || item.name}
          </div>
          {item.destination?.name && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted">
              <MapPin className="w-3 h-3" />
              <span>
                {item.destination.name}{item.destination?.country && item.destination.country !== item.destination.name ? `, ${item.destination.country}` : ''}
                {(item.additionalDestinations || []).length
                  ? ` · ${(item.additionalDestinations || [])
                      .map((ad: any) => ad?.destination?.name)
                      .filter(Boolean)
                      .join(' · ')}`
                  : ''}
              </span>
            </div>
          )}
          {item.price != null && (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[10px] uppercase tracking-widest text-muted">From</span>
              <span className="font-display text-base font-bold text-on-surface">
                {formatCurrency(Number(item.price), item.currency || 'USD')}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-muted">{t('booking_no_item')}</div>
      )}
    </div>
  );
}

function StepIndicator({
  steps,
  currentStep,
  t,
  withIcons,
}: {
  steps: { number: number; label?: string; key?: string; icon?: typeof Compass }[];
  currentStep: number;
  t: (k: any) => string;
  withIcons?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-1 mb-8">
      {steps.map((step, i) => {
        const active = currentStep >= step.number;
        const done = currentStep > step.number;
        const Icon = step.icon;
        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  active ? 'text-white shadow-md' : 'text-muted'
                }`}
                style={active ? { background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))' } : { backgroundColor: 'var(--color-surface-container)' }}
              >
                {done ? <Check className="w-4 h-4" /> : withIcons && Icon ? <Icon className="w-4 h-4" /> : step.number}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-semibold leading-tight text-center max-w-[80px] ${
                  active ? 'text-on-surface' : 'text-muted'
                }`}
              >
                {step.key ? t(step.key as any) : step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-colors ${
                  done ? '' : ''
                }`}
                style={{
                  backgroundColor: done
                    ? 'var(--color-primary)'
                    : 'color-mix(in oklab, var(--color-on-surface) 12%, transparent)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-6 p-3 rounded-xl flex items-center gap-2 text-sm border" style={{ backgroundColor: 'color-mix(in oklab, var(--color-error, #ef4444) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--color-error, #ef4444) 30%, transparent)', color: 'var(--color-error, #ef4444)' }}>
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function SectionHeading({ title, help }: { title: string; help?: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-on-surface">{title}</h2>
      {help && <p className="text-sm text-muted mt-1">{help}</p>}
    </div>
  );
}

export default function BookingPage() {
  const { currentStep, setStep, selectedItem, totalAmount, reset, setFormData, formData } = useBookingStore();
  const { createBooking, getPaymentMethods, uploadPaymentReceipt, submitPaymentConfirmation, uploadMedia, getVisaServices } = useApi();
  const { t, locale } = useLocale();
  const isBn = locale === 'bn';
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<BookingType>('tour');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [typeLocked, setTypeLocked] = useState<boolean>(false);
  const [isPresetBooking, setIsPresetBooking] = useState<boolean>(false);
  const [visaCurrency, setVisaCurrency] = useState<string>('BDT');
  const setTotalAmount = useBookingStore((s) => s.setTotalAmount);
  const sentType = useRef<string | null>(null);

  const [wallets, setWallets] = useState<MobileWallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bkashTrxId, setBkashTrxId] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [senderName, setSenderName] = useState('');
  const [receiptUrls, setReceiptUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cashAmount, setCashAmount] = useState('');
  const [bankAmount, setBankAmount] = useState('');
  const [docUrls, setDocUrls] = useState<Record<string, string[]>>({});
  const [docUploading, setDocUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const urlType = sp.get('type');
    const urlId = sp.get('id');
    // The booking store is a module-level singleton, so a previous booking's
    // step/form data would otherwise leak into the next one and jump straight
    // to the submission step. Every visit to /booking starts a fresh booking,
    // so always begin at step 1 and clear stale traveler details.
    useBookingStore.getState().reset();
    if (urlType) {
      const mapped: BookingType | null = urlType in URL_TYPE_MAP ? URL_TYPE_MAP[urlType] : null;
      if (mapped) {
        setIsPresetBooking(true);
        setBookingType(mapped);
        setTypeLocked(true);
        sentType.current = urlType in URL_TYPE_SENT ? URL_TYPE_SENT[urlType] : urlType;
      }
    }
    if (urlId) {
      useBookingStore.getState().setSelectedItem(urlId);
    }

    const saved = loadContact();
    if (saved.firstName || saved.lastName || saved.phone || saved.email) {
      setFormData({
        ...saved,
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const methods = (await getPaymentMethods()) as any;
        if (!mounted) return;
        const nextWallets = resolveCheckoutWallets(methods);
        setWallets(nextWallets);
        if (nextWallets[0]) setSelectedWalletId(nextWallets[0].id);
        setPaymentInstructions(methods?.instructions || null);
        setBankAccounts(methods?.bankAccounts || []);
        if (methods?.bankAccounts?.[0]?.id) setBankAccountId(methods.bankAccounts[0].id);
      } catch {
        // payment settings unavailable; checkout still works without presets
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getPaymentMethods]);

  useEffect(() => {
    if (!isPresetBooking || bookingType !== 'visa') return;
    let mounted = true;
    (async () => {
      try {
        const res = await getVisaServices();
        const svc: Record<string, unknown>[] = Array.isArray(res)
          ? (res as Record<string, unknown>[])
          : ((res as any)?.items ?? []);
        const id = typeof selectedItem === 'string' ? selectedItem : (selectedItem as any)?.id;
        const service = svc.find((s) => (s as any)?.id === id);
        if (mounted && service) {
          const price = Number((service as any)?.price) || 0;
          const currency = (service as any)?.currency || 'BDT';
          setVisaCurrency(currency);
          setTotalAmount(price);
        }
      } catch {
        // visa price unavailable; keep totalAmount as-is
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isPresetBooking, bookingType, selectedItem, getVisaServices, setTotalAmount]);

  useEffect(() => {
    if (!bookingSuccess) return;
    // Keep the confirmation card visible for 5 minutes so the customer can
    // save the reference code and decide to pay now or later — never kick
    // them home after just a few seconds.
    const timer = setTimeout(() => router.push('/'), 300000);
    return () => clearTimeout(timer);
  }, [bookingSuccess, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  const renderPaymentDetailInputs = () => (
    <>
      {wallets.some((w) => w.provider === paymentMethod) && (
        <div className="mt-4 rounded-2xl border border-soft p-5 bg-surface-container/60 space-y-4">
          {(() => {
            const providerWallets = wallets.filter((w) => w.provider === paymentMethod);
            const selected = providerWallets.find((w) => w.id === selectedWalletId) || providerWallets[0];
            const label = WALLET_LABELS[paymentMethod] || paymentMethod;
            return (
              <>
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 shrink-0 mt-0.5 text-muted" />
                  <div className="text-sm">
                    <div className="font-semibold text-on-surface">{isBn ? `${label} এ পাঠান` : `Send to ${label}`}</div>
                    {providerWallets.length > 1 && (
                      <div className="mt-2 space-y-2">
                        {providerWallets.map((w) => (
                          <button
                            key={w.id || w.walletNumber}
                            type="button"
                            onClick={() => setSelectedWalletId(w.id)}
                            className={`w-full text-left p-3 rounded-xl border ${selected?.id === w.id ? 'border-[var(--color-primary)]' : 'border-soft'}`}
                          >
                            <div className="text-xs text-muted">{w.accountName}{w.accountType ? ` · ${w.accountType}` : ''}</div>
                            <div className="font-mono text-lg font-bold tracking-wider text-[var(--color-primary)]">{w.walletNumber}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    {providerWallets.length <= 1 && selected && (
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className="text-2xl font-display font-bold tracking-wider text-[var(--color-primary)]">{selected.walletNumber}</span>
                        {selected.accountName && <span className="text-xs text-muted">({selected.accountName})</span>}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selected.walletNumber)}
                          className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:opacity-70"
                        >
                          <Copy className="w-3.5 h-3.5" /> {isBn ? 'কপি' : 'Copy'}
                        </button>
                      </div>
                    )}
                    {selected?.instructions && <p className="text-xs text-muted mt-2">{selected.instructions}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
                    {isBn ? 'ট্রানজেকশন আইডি' : `${label} Transaction ID`}
                  </label>
                  <Input
                    value={bkashTrxId}
                    onChange={(e) => setBkashTrxId(e.target.value)}
                    placeholder="9J3XXXXXXX"
                  />
                  <p className="text-xs text-muted mt-1">{isBn ? 'সেন্ড মানিতে দেখানো ট্রানজেকশন আইডি লিখুন' : 'Enter the transaction ID shown after you send money'}.</p>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {paymentMethod === 'bank_transfer' && (
        <div className="mt-4 rounded-2xl border border-soft p-5 bg-surface-container/60 space-y-4">
          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 shrink-0 mt-0.5 text-muted" />
            <div className="text-sm">
              <div className="font-semibold text-on-surface">{isBn ? 'ব্যাংক একাউন্টে পাঠান' : 'Transfer to our bank account'}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
              {isBn ? 'ব্যাংক নির্বাচন করুন' : 'Select Bank Account'}
            </label>
            {bankAccounts.length > 0 ? (
              <div className="space-y-2">
                {bankAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setBankAccountId(acc.id)}
                    className={`w-full flex items-center justify-between gap-2 p-3 rounded-xl border text-left transition ${
                      bankAccountId === acc.id ? 'border-[var(--color-primary)]' : 'border-soft hover:border-medium'
                    }`}
                    style={bankAccountId === acc.id ? { backgroundColor: 'color-mix(in oklab, var(--color-primary) 10%, transparent)' } : { backgroundColor: 'var(--color-surface-container)' }}
                  >
                    <div>
                      <div className="text-sm font-semibold text-on-surface">{acc.bankName}</div>
                      <div className="text-xs text-muted">{acc.accountName}</div>
                      {bankAccountId === acc.id && (
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-display font-bold tracking-wider text-[var(--color-primary)]">{acc.accountNumber}</span>
                          <button type="button" onClick={() => copyToClipboard(acc.accountNumber)} className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:opacity-70">
                            <Copy className="w-3.5 h-3.5" /> {isBn ? 'কপি' : 'Copy'}
                          </button>
                        </div>
                      )}
                      {bankAccountId === acc.id && (acc.branch || acc.routingNumber || acc.swiftCode) && (
                        <div className="mt-1 text-[11px] text-muted">
                          {acc.branch && <div>{isBn ? 'শাখা' : 'Branch'}: {acc.branch}</div>}
                          {acc.routingNumber && <div>{isBn ? 'রাউটিং' : 'Routing'}: {acc.routingNumber}</div>}
                          {acc.swiftCode && <div>SWIFT: {acc.swiftCode}</div>}
                        </div>
                      )}
                    </div>
                    {bankAccountId === acc.id && <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} />}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">{isBn ? 'ব্যাংক অ্যাকাউন্ট পাওয়া যায়নি' : 'No bank accounts available'}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
              {isBn ? 'প্রেরকের নাম (আবশ্যক)' : 'Sender Name (required)'}
            </label>
            <Input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder={isBn ? 'আপনার নাম লিখুন' : 'Enter your name'}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
              {isBn ? 'পরিশোধের পরিমাণ (৳)' : 'Amount to Pay (BDT)'}
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={bankAmount}
              onChange={(e) => setBankAmount(e.target.value)}
              placeholder={isBn ? 'পরিমাণ লিখুন (যেমন: 25000)' : 'Enter the amount (e.g. 25000)'}
              required
            />
            {totalAmount ? (
              <p className="text-xs text-muted mt-1">
                {isBn
                  ? `মোট বকেয়া: ${formatCurrency(totalAmount || 0, 'BDT')}`
                  : `Total balance due: ${formatCurrency(totalAmount || 0, 'BDT')}`}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
              {isBn ? 'রসিদ আপলোড করুন (আবশ্যক)' : 'Upload Payment Receipt (required)'}
            </label>
            <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border border-dashed border-soft cursor-pointer hover:border-[var(--color-primary)] bg-surface-container/60 transition">
              <Upload className="w-5 h-5 text-muted" />
              <span className="text-sm text-muted text-center">
                {uploading ? (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...') : (isBn ? 'ছবি বা PDF আপলোড করুন' : 'Click to upload an image or PDF')}
              </span>
              <input type="file" accept="image/*,.pdf" multiple className="hidden" onChange={(e) => uploadReceipt(e.target.files)} />
            </label>
            {paymentError && (
              <p className="mt-2 text-xs" style={{ color: 'var(--color-error, #ef4444)' }}>{paymentError}</p>
            )}
            {receiptUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {receiptUrls.map((url, i) => (
                  <div key={url} className="relative rounded-xl overflow-hidden border border-soft bg-surface-container">
                    {url.match(/\.(jpe?g|png|gif|webp)(\?|$)/i) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="receipt" className="w-full h-20 object-cover" />
                    ) : (
                      <div className="w-full h-20 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setReceiptUrls((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {paymentMethod === 'cash' && (
        <div className="mt-4 rounded-2xl border border-soft p-5 bg-surface-container/60 space-y-4">
          <div className="flex items-start gap-3">
            <Banknote className="w-5 h-5 shrink-0 mt-0.5 text-muted" />
            <div className="text-sm">
              <div className="font-semibold text-on-surface">{isBn ? 'ক্যাশ পেমেন্ট' : 'Cash Payment'}</div>
              <p className="text-xs text-muted mt-1">
                {isBn
                  ? 'আমাদের অফিসে বা কালেকশনের মাধ্যমে পরিশোধ করুন। আমাদের টিম আপনার সাথে যোগাযোগ করবে।'
                  : 'Pay at our office or via collection. Our team will contact you to arrange the payment.'}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
              {isBn ? 'ক্যাশের পরিমাণ (৳)' : 'Cash Amount (BDT)'}
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              placeholder={isBn ? 'শুধুমাত্র পরিমাণ লিখুন (যেমন: 5000)' : 'Enter the amount to pay (e.g. 5000)'}
            />
            {totalAmount ? (
              <p className="text-xs text-muted mt-1">
                {isBn
                  ? `মোট বকেয়া: ${formatCurrency(totalAmount || 0, 'BDT')}`
                  : `Total balance due: ${formatCurrency(totalAmount || 0, 'BDT')}`}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </>
  );

  const uploadReceipt = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setPaymentError(null);
    try {
      for (const file of Array.from(files)) {
        const res = (await uploadPaymentReceipt(file)) as { url: string };
        if (res?.url) setReceiptUrls((prev) => [...prev, res.url]);
      }
    } catch (err: any) {
      setPaymentError(err.message || (isBn ? 'রসিদ আপলোড ব্যর্থ হয়েছে' : 'Receipt upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const uploadVisaDoc = async (key: string, files: FileList | null) => {
    if (!files?.length) return;
    setDocUploading((prev) => ({ ...prev, [key]: true }));
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const res = (await uploadMedia(file, { folder: 'visa-documents' })) as { url: string };
        if (res?.url) uploadedUrls.push(res.url);
      }
      if (uploadedUrls.length > 0) {
        setDocUrls((prev) => {
          const current = prev[key] ?? [];
          return { ...prev, [key]: [...current, ...uploadedUrls] };
        });
        const existing = docUrls[key] ?? [];
        updateForm(key, [...existing, ...uploadedUrls].join(','));
      }
    } catch {
      setError(isBn ? 'ফাইল আপলোড ব্যর্থ হয়েছে' : 'File upload failed');
    } finally {
      setDocUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const removeVisaDoc = (key: string, url: string) => {
    setDocUrls((prev) => {
      const existing = prev[key] ?? [];
      const next = existing.filter((u) => u !== url);
      const nextObj = { ...prev, [key]: next };
      updateForm(key, next.length ? next.join(',') : '');
      return nextObj;
    });
  };

  const updateForm = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    if (['firstName', 'lastName', 'phone', 'email'].includes(key)) {
      saveContact({ [key]: value });
    }
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function validatePhone(v: string) {
    const digits = v.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  }

  function getStoredPhoneParts(): { code: string; number: string } {
    const combined = formData.phone || '';
    const matched = COUNTRY_DIALS.find((c) => combined.startsWith(c.dial + ' ') || combined.startsWith(c.dial));
    if (matched) {
      const rest = combined.startsWith(matched.dial + ' ')
        ? combined.slice(matched.dial.length + 1)
        : combined.slice(matched.dial.length);
      return { code: matched.code, number: rest.trim() };
    }
    return { code: formData.phoneCountry || DEFAULT_COUNTRY_CODE, number: combined };
  }

  function setPhoneParts(code: string, number: string) {
    const dial = findDialByCode(code)?.dial ?? '';
    const trimmedNumber = number.replace(/^\s+/, '');
    const combined = trimmedNumber ? `${dial} ${trimmedNumber}` : '';
    setFormData({ ...formData, phoneCountry: code, phone: combined });
    if (combined) saveContact({ phone: combined });
    setFieldErrors((prev) => {
      if (!prev.phone) return prev;
      const next = { ...prev };
      delete next.phone;
      return next;
    });
  }

  function validateCurrentStep(): { ok: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    const reqMissing = (key: string, label: string) => {
      if (!formData[key] || !String(formData[key]).trim()) errors[key] = `${label} is required`;
    };

    if (bookingType === 'custom') {
      if (currentStep === 1) {
        reqMissing('destination', 'Destination');
      } else if (currentStep === 2) {
        reqMissing('startDate', 'Start date');
      } else if (currentStep === 3) {
        reqMissing('guests', 'Number of travelers');
      } else if (currentStep === 5) {
        reqMissing('firstName', 'Full name');
        reqMissing('phone', 'Phone');
        if (formData.email && !validateEmail(formData.email)) errors.email = 'Enter a valid email';
        if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Enter a valid phone';
      }
    } else if (bookingType === 'visa') {
      if (currentStep === 1) {
        reqMissing('firstName', 'First name');
        reqMissing('lastName', 'Last name');
        reqMissing('phone', 'Phone');
        if (formData.email && !validateEmail(formData.email)) errors.email = 'Enter a valid email';
        if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Enter a valid phone';
      } else if (currentStep === 2 && !isPresetBooking) {
        reqMissing('destination', 'Destination country');
        reqMissing('arrivalDate', 'Arrival date');
        reqMissing('departureDate', 'Departure date');
        reqMissing('purpose', 'Purpose of travel');
      }
      // step 3 = documents checklist (no required text fields); step 4 = review/confirm (nothing to validate)
    } else {
      // tour / hotel / flight
      if (currentStep === 1) {
        reqMissing('firstName', 'First name');
        reqMissing('lastName', 'Last name');
        reqMissing('phone', 'Phone');
        if (formData.email && !validateEmail(formData.email)) errors.email = 'Enter a valid email';
        if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Enter a valid phone';
      } else if (currentStep === 2 && bookingType !== 'tour') {
        reqMissing('destination', 'Destination');
        reqMissing('startDate', 'Start date');
        reqMissing('guests', 'Number of guests');
      }
    }

    return { ok: Object.keys(errors).length === 0, errors };
  }

  function tryAdvance() {
    const result = validateCurrentStep();
    setFieldErrors(result.errors);
    if (!result.ok) {
      setError(t('booking_validation_required'));
      if (typeof window !== 'undefined') window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }
    // Checkout step: payment is optional for preset bookings — only validate
    // the chosen method's fields when one has been selected (booking can be
    // submitted without payment and paid later via the invoice page).
    const max = bookingType === 'custom' ? 5 : bookingType === 'visa' ? (isPresetBooking ? 3 : 4) : bookingType === 'tour' ? (isPresetBooking ? 3 : 2) : (isPresetBooking ? 4 : 3);
    if (currentStep === max && bookingType !== 'custom' && isPresetBooking && paymentMethod) {
      const isWalletMethod = wallets.some((w) => w.provider === paymentMethod);
      if (isWalletMethod && !bkashTrxId.trim()) {
        const label = WALLET_LABELS[paymentMethod] || paymentMethod;
        setError(isBn ? `${label} ট্রানজেকশন আইডি দিন` : `Please enter the ${label} transaction ID`);
        return;
      }
      if (paymentMethod === 'bank_transfer') {
        if (!bankAccountId) {
          setError(isBn ? 'ব্যাংক অ্যাকাউন্ট নির্বাচন করুন' : 'Please select a bank account');
          return;
        }
        if (!senderName.trim()) {
          setError(isBn ? 'প্রেরকের নাম দিন' : 'Please enter the sender name');
          return;
        }
        const amt = Number(bankAmount);
        if (!bankAmount || !Number.isFinite(amt) || amt <= 0) {
          setError(isBn ? 'অনুগ্রহ করে পরিশোধের পরিমাণ দিন' : 'Please enter the amount to pay');
          return;
        }
        if (receiptUrls.length === 0) {
          setError(isBn ? 'অনুগ্রহ করে রসিদ আপলোড করুন (ছবি বা PDF)' : 'Please upload your payment receipt (image or PDF)');
          return;
        }
      }
      if (paymentMethod === 'cash') {
        const amt = Number(cashAmount);
        if (!cashAmount || !Number.isFinite(amt) || amt <= 0) {
          setError(isBn ? 'অনুগ্রহ করে ক্যাশের পরিমাণ দিন' : 'Please enter the cash amount to pay');
          return;
        }
      }
    }
    setError(null);
    if (bookingType === 'custom') {
      if (currentStep < 5) setStep(currentStep + 1);
      else handleSubmit();
    } else {
      if (currentStep < max) setStep(currentStep + 1);
      else handleSubmit();
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = (await createBooking({
        type: sentType.current || bookingType,
        itemId: (typeof selectedItem === 'string' ? selectedItem : (selectedItem as any)?.id) || (bookingType === 'custom' ? 'custom-quote' : isPresetBooking ? 'demo' : 'inquiry'),
        startDate: new Date(formData.startDate || new Date()).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        guests: Number(formData.guests) || 1,
        notes: formData.notes,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        paymentMethod: isPresetBooking && bookingType !== 'visa' && bookingType !== 'custom' ? paymentMethod : undefined,
        meta: bookingType === 'custom'
          ? {
              destination: formData.destination,
              travelStyle: formData.travelStyle,
              accommodation: formData.accommodation,
              meals: formData.meals,
              budget: formData.budget,
            }
          : bookingType === 'visa'
          ? {
              ...(formData.destination ? { destination: formData.destination } : {}),
              ...(formData.visaType ? { visaType: formData.visaType } : {}),
              ...(formData.arrivalDate ? { arrivalDate: formData.arrivalDate } : {}),
              ...(formData.departureDate ? { departureDate: formData.departureDate } : {}),
              ...(formData.purpose ? { purpose: formData.purpose } : {}),
              ...(['doc_passport', 'doc_photos', 'doc_bank', 'doc_nid', 'doc_ticket', 'doc_hotel', 'doc_cover', 'doc_employment'].reduce<Record<string, string | boolean>>((acc, key) => {
                if (formData[key]) acc[key] = formData[key];
                return acc;
              }, {})),
            }
          : undefined,
      })) as any;
      const code = result?.bookingCode || (bookingType === 'custom' ? 'QUOTE-PENDING' : '');
      setBookingCode(code || 'FLY-XXXX-XXXX');
      if (isPresetBooking && bookingType !== 'custom' && code) {
        const isWalletMethod = wallets.some((w) => w.provider === paymentMethod);
        if (paymentMethod && (isWalletMethod || paymentMethod === 'bank_transfer' || paymentMethod === 'cash')) {
          try {
            await submitPaymentConfirmation({
              bookingCode: code,
              method: paymentMethod,
              amount:
                paymentMethod === 'cash'
                  ? Math.round(Number(cashAmount) * 100) / 100
                  : paymentMethod === 'bank_transfer'
                  ? Math.round(Number(bankAmount) * 100) / 100
                  : undefined,
              bkashTrxId: isWalletMethod ? bkashTrxId.trim() : undefined,
              mobileWalletId: isWalletMethod && selectedWalletId ? selectedWalletId : undefined,
              bankAccountId: paymentMethod === 'bank_transfer' ? bankAccountId : undefined,
              receiptUrls,
              senderName: paymentMethod === 'bank_transfer' ? senderName : undefined,
            });
          } catch {
            // payment confirmation failed; booking is still created and can be paid later
          }
        }
        setPaymentConfirmed(true);
      }
      setBookingSuccess(true);
      setStep(bookingType === 'custom' ? 6 : 5);
    } catch (err: any) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const item = (selectedItem as any) || {};
  const displayName =
    item?.title ||
    item?.name ||
    (bookingType === 'custom' ? (isBn ? 'কাস্টম প্যাকেজ' : 'Custom Package') : 'Your Booking');

  if (bookingSuccess) {
    return (
      <main className="min-h-screen surface-page pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="glass text-center p-10 sm:p-12 rounded-2xl">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border"
              style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 15%, transparent)', borderColor: 'color-mix(in oklab, var(--color-primary) 40%, transparent)' }}
            >
              <Check className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="font-display text-2xl font-bold text-on-surface mb-2">
              {(bookingType === 'custom' || !isPresetBooking)
                ? t('booking_success_title_quote')
                : t('booking_success_title')}
            </h2>
            <p className="text-muted mb-2">
              {(bookingType === 'custom' || !isPresetBooking)
                ? t('booking_success_help_quote')
                : t('booking_success_help')}
            </p>
            {paymentConfirmed && (
              <p className="text-xs text-muted rounded-xl p-3 bg-surface-container/60">
                {isBn
                  ? 'পেমেন্ট রেকর্ড হয়েছে এবং ইনভয়েস তৈরি হয়েছে। আপনার ইনভয়েস ড্যাশবোর্ড/ইনভয়েস পেজ থেকে দেখতে ও ডাউনলোড করতে পারবেন।'
                  : 'Payment recorded and your invoice has been generated. You can view and download it from the invoice/payment page.'}
              </p>
            )}
            {isPresetBooking && bookingCode && bookingCode !== 'FLY-XXXX-XXXX' && !paymentConfirmed && (
              <p className="text-xs text-muted rounded-xl p-3 bg-surface-container/60">
                {isBn
                  ? 'আপনি এখনো পেমেন্ট করেননি। এখনই পরিশোধ করুন, অথবা পরে আপনার প্রোফাইল/বুকিং কোড দিয়ে ট্র্যাক করে পরিশোধ করতে পারবেন।'
                  : "You haven't paid yet. Pay now, or later from your account or by tracking your booking code."}
              </p>
            )}
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted mt-4">{t('booking_booking_code')}</p>
            <div className="flex items-center justify-center gap-2 mb-8">
              <p className="font-mono text-lg font-bold text-on-surface">{bookingCode}</p>
              {bookingCode && bookingCode !== 'FLY-XXXX-XXXX' && (
                <button
                  type="button"
                  onClick={() => {
                    copyToClipboard(bookingCode);
                    setCodeCopied(true);
                    setTimeout(() => setCodeCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 p-1.5 rounded-lg text-[10px] font-semibold transition-colors text-[var(--color-primary)] hover:bg-surface-container"
                  title={isBn ? 'কোড কপি করুন' : 'Copy code'}
                >
                  {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {codeCopied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <Link href="/track" className="flex-1">
                <Button variant="ghost" size="lg" className="w-full">
                  {isBn ? 'ট্র্যাক বুকিং' : 'Track booking'}
                </Button>
              </Link>
              {isPresetBooking && bookingCode && bookingCode !== 'FLY-XXXX-XXXX' && (
                <Link href={`/pay/${encodeURIComponent(bookingCode)}`} className="flex-1">
                  <Button size="lg" className="w-full">
                    {isBn ? 'ইনভয়েস / পেমেন্ট' : 'Invoice / Payment'}
                  </Button>
                </Link>
              )}
            </div>
            <Link href="/booking" className="block">
              <Button
                size="lg"
                className="w-full mt-3"
                variant="ghost"
              >
                {t('booking_new')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // -------- CUSTOM PACKAGE multi-step flow --------
  if (bookingType === 'custom') {
    return (
      <main className="min-h-screen surface-page pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full text-[10px] tracking-widest uppercase font-bold border" style={{ color: 'var(--color-primary)', borderColor: 'color-mix(in oklab, var(--color-primary) 30%, transparent)', backgroundColor: 'color-mix(in oklab, var(--color-primary) 8%, transparent)' }}>
              <Sparkles className="w-3 h-3" />
              {t('booking_type_custom')}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface">
              {isBn ? 'আপনার স্বপ্নের যাত্রা তৈরি করুন' : 'Design Your Dream Journey'}
            </h1>
            <p className="text-muted mt-2">
              {isBn ? '৫টি সহজ ধাপে আপনার নিখুঁত প্যাকেজ।' : '5 quick steps. We handle the rest.'}
            </p>
          </div>

          <StepIndicator steps={CUSTOM_STEPS} currentStep={currentStep} t={t} withIcons />

          <div className="glass p-6 sm:p-8 rounded-2xl">
            {error && <ErrorBanner message={error} />}

            {currentStep === 1 && (
              <div className="space-y-4">
                <SectionHeading title={t('custom_step_destination')} />
                <DestinationAutocomplete
                  label={isBn ? 'গন্তব্য দেশ/শহর' : 'Destination country / city'}
                  value={formData.destination || ''}
                  onChange={(v) => updateForm('destination', v)}
                  placeholder={isBn ? 'যেমন: তুরস্ক, বালি, মালদ্বীপ' : 'e.g. Turkey, Bali, Maldives'}
                  required
                  error={fieldErrors.destination}
                />
                <Input
                  label={isBn ? 'একাধিক গন্তব্য (ঐচ্ছিক)' : 'Multiple stops (optional)'}
                  value={formData.stops || ''}
                  onChange={(e) => updateForm('stops', e.target.value)}
                  placeholder={isBn ? 'দুবাই → আবুধাবি' : 'Dubai → Abu Dhabi'}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <SectionHeading title={t('custom_step_dates')} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={isBn ? 'শুরুর তারি�' : 'Start date'}
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => updateForm('startDate', e.target.value)}
                    required
                    error={fieldErrors.startDate}
                  />
                  <Input
                    label={isBn ? 'শেষ তারিখ (আনুমানিক)' : 'End date (approx)'}
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => updateForm('endDate', e.target.value)}
                  />
                </div>
                <Input
                  label={isBn ? 'ভ্রমণের নমনীয়তা' : 'Flexibility'}
                  value={formData.flexibility || ''}
                  onChange={(e) => updateForm('flexibility', e.target.value)}
                  placeholder={isBn ? 'যেমন: ±৩ দিন নমনীয়' : 'e.g. ±3 days flexible'}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <SectionHeading title={t('custom_step_travelers')} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('custom_travelers')}
                    type="number"
                    min={1}
                    value={formData.guests || ''}
                    onChange={(e) => updateForm('guests', e.target.value)}
                    required
                    error={fieldErrors.guests}
                  />
                  <Input
                    label={t('custom_budget')}
                    type="number"
                    min={0}
                    value={formData.budget || ''}
                    onChange={(e) => updateForm('budget', e.target.value)}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
                    {t('custom_travel_style')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(['relaxed', 'adventure', 'cultural', 'luxury', 'business'] as const).map(
                      (style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => updateForm('travelStyle', style)}
                          className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                            formData.travelStyle === style
                              ? 'border-[var(--color-primary)] text-on-surface'
                              : 'border-soft text-muted hover:border-medium'
                          }`}
                          style={formData.travelStyle === style ? { backgroundColor: 'color-mix(in oklab, var(--color-primary) 15%, transparent)' } : { backgroundColor: 'var(--color-surface-container)' }}
                        >
                          {t(`custom_travel_style_${style}` as any)}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <SectionHeading title={t('custom_step_preferences')} />
                <div>
                  <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
                    {t('custom_accommodation')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['budget', 'mid', 'luxury'] as const).map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => updateForm('accommodation', a)}
                        className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                          formData.accommodation === a
                            ? 'border-[var(--color-primary)] text-on-surface'
                            : 'border-soft text-muted hover:border-medium'
                        }`}
                        style={formData.accommodation === a ? { backgroundColor: 'color-mix(in oklab, var(--color-primary) 15%, transparent)' } : { backgroundColor: 'var(--color-surface-container)' }}
                      >
                        {t(`custom_accommodation_${a}` as any)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
                    {t('custom_meals')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['none', 'breakfast', 'half', 'full'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => updateForm('meals', m)}
                        className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                          formData.meals === m
                            ? 'border-[var(--color-primary)] text-on-surface'
                            : 'border-soft text-muted hover:border-medium'
                        }`}
                        style={formData.meals === m ? { backgroundColor: 'color-mix(in oklab, var(--color-primary) 15%, transparent)' } : { backgroundColor: 'var(--color-surface-container)' }}
                      >
                        {t(`custom_meals_${m}` as any)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
                    {t('custom_requests')}
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateForm('notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-on-surface placeholder:text-muted outline-none border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all bg-surface-container/60 backdrop-blur-md"
                    placeholder={t('custom_requests_ph')}
                  />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <SectionHeading title={t('custom_step_contact')} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={isBn ? 'পুরো নাম' : 'Full name'}
                    value={formData.firstName || ''}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                    required
                    error={fieldErrors.firstName}
                  />
                  <PhoneInput
                    label={isBn ? 'ফোন' : 'Phone'}
                    countryCode={getStoredPhoneParts().code}
                    number={getStoredPhoneParts().number}
                    onCountryCodeChange={(c) => {
                      const parts = getStoredPhoneParts();
                      setPhoneParts(c, parts.number);
                    }}
                    onNumberChange={(v) => {
                      const parts = getStoredPhoneParts();
                      setPhoneParts(parts.code, v);
                    }}
                    required
                    error={fieldErrors.phone}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateForm('email', e.target.value)}
                  error={fieldErrors.email}
                />
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8 pt-6 border-t border-soft">
              <Button
                variant="ghost"
                onClick={() => {
                  if (currentStep === 1) {
                    setBookingType('tour');
                  } else {
                    setStep(currentStep - 1);
                  }
                  setFieldErrors({});
                  setError(null);
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep === 1 ? t('booking_back_to_types') : t('booking_previous')}
              </Button>
              <Button
                size="lg"
                disabled={submitting}
                onClick={tryAdvance}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isBn ? 'পাঠানো হচ্ছে...' : 'Sending...'}
                  </>
                ) : currentStep === 5 ? (
                  isBn ? 'অনুরোধ পাঠান' : 'Submit Request'
                ) : (
                  <>
                    {isBn ? 'পরবর্তী' : t('booking_next')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // -------- STANDARD booking flow --------
  const isTour = bookingType === 'tour';
  const isPresetVisa = bookingType === 'visa' && isPresetBooking;
  const maxStep = bookingType === 'visa' ? (isPresetBooking ? 3 : 4) : isTour ? (isPresetBooking ? 3 : 2) : (isPresetBooking ? 4 : 3);
  const steps = bookingType === 'visa' ? (isPresetBooking ? VISA_STEPS_PRESET : VISA_STEPS) : isTour ? (isPresetBooking ? TOUR_STEPS : TOUR_STEPS_GENERAL) : (isPresetBooking ? STANDARD_STEPS : STANDARD_STEPS_GENERAL);
  const isLastStep = currentStep === maxStep;

  return (
    <main className="min-h-screen surface-page pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface">
            {t('booking_title')}
          </h1>
          <p className="text-muted mt-2">{t('booking_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div>
            {/* Type selector */}
            {!typeLocked && (
              <div className="mb-6">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-muted mb-2">
                  {t('booking_type_label')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['tour', 'hotel', 'flight', 'visa', 'custom'] as BookingType[]).map((type) => {
                    const Icon = TYPE_META[type].icon;
                    const active = bookingType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (type === 'custom') {
                            setStep(1);
                            setBookingType('custom');
                          } else {
                            setBookingType(type);
                            setStep(1);
                          }
                          setFieldErrors({});
                          setError(null);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                          active ? 'text-on-surface' : 'text-muted hover:border-medium'
                        }`}
                        style={
                          active
                            ? {
                                background: 'linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 18%, transparent), color-mix(in oklab, var(--color-tertiary) 18%, transparent))',
                                borderColor: 'var(--color-primary)',
                              }
                            : { backgroundColor: 'var(--color-surface-container)', borderColor: 'var(--color-outline-variant)' }
                        }
                      >
                        <Icon className="w-4 h-4" />
                        {t(`booking_type_${type}` as any)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <StepIndicator steps={steps} currentStep={currentStep} t={t} />

            <div className="glass p-6 sm:p-8 rounded-2xl">
              {error && <ErrorBanner message={error} />}

              {/* VISA FLOW */}
              {currentStep === 1 && bookingType === 'visa' && (
                <div className="space-y-5">
                  <SectionHeading title={t('booking_step_applicant')} help={t('booking_visa_applicant_help')} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label={t('booking_first_name')} value={formData.firstName || ''} onChange={(e) => updateForm('firstName', e.target.value)} required error={fieldErrors.firstName} />
                    <Input label={t('booking_last_name')} value={formData.lastName || ''} onChange={(e) => updateForm('lastName', e.target.value)} required error={fieldErrors.lastName} />
                  </div>
                  <Input label={t('booking_email')} type="email" value={formData.email || ''} onChange={(e) => updateForm('email', e.target.value)} error={fieldErrors.email} />
                  <PhoneInput
                    label={t('booking_phone')}
                    countryCode={getStoredPhoneParts().code}
                    number={getStoredPhoneParts().number}
                    onCountryCodeChange={(c) => {
                      const parts = getStoredPhoneParts();
                      setPhoneParts(c, parts.number);
                    }}
                    onNumberChange={(v) => {
                      const parts = getStoredPhoneParts();
                      setPhoneParts(parts.code, v);
                    }}
                    required
                    error={fieldErrors.phone}
                  />
                </div>
              )}

              {currentStep === 2 && bookingType === 'visa' && !isPresetBooking && (
                <div className="space-y-5">
                  <SectionHeading title={t('booking_step_travel')} help={t('booking_visa_travel_help')} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DestinationAutocomplete
                      label={isBn ? 'গন্তব্য দেশ' : 'Destination country'}
                      value={formData.destination || ''}
                      onChange={(v) => updateForm('destination', v)}
                      required
                      placeholder="e.g. Malaysia"
                      error={fieldErrors.destination}
                    />
                    <Input label={isBn ? 'ভিসার ধরন' : 'Visa type'} value={formData.visaType || 'tourist'} onChange={(e) => updateForm('visaType', e.target.value)} placeholder="tourist / business / student" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label={isBn ? 'আগমনের তারিখ' : 'Intended arrival'} type="date" value={formData.arrivalDate || ''} onChange={(e) => updateForm('arrivalDate', e.target.value)} required error={fieldErrors.arrivalDate} />
                    <Input label={isBn ? 'প্রস্থানের তারিখ' : 'Intended departure'} type="date" value={formData.departureDate || ''} onChange={(e) => updateForm('departureDate', e.target.value)} required error={fieldErrors.departureDate} />
                  </div>
                  <Input label={isBn ? 'ভ্রমণের উদ্দেশ্য' : 'Purpose of travel'} value={formData.purpose || ''} onChange={(e) => updateForm('purpose', e.target.value)} required placeholder="e.g. Tourism, family visit, business meeting" error={fieldErrors.purpose} />
                </div>
              )}

              {bookingType === 'visa' && currentStep === (isPresetBooking ? 2 : 3) && (
                <div className="space-y-5">
                  <SectionHeading title={t('booking_step_documents')} help={t('booking_visa_docs_help')} />
                  <div className="space-y-3">
                    {[
                      { key: 'doc_passport', label: 'Valid passport', hint: 'Min 6 months validity' },
                      { key: 'doc_photos', label: 'Passport-size photos', hint: '2 photos, white background' },
                      { key: 'doc_bank', label: 'Bank statement', hint: 'Last 6 months' },
                      { key: 'doc_nid', label: 'National ID / birth certificate', hint: '' },
                      { key: 'doc_ticket', label: 'Confirmed return ticket', hint: '' },
                      { key: 'doc_hotel', label: 'Hotel booking / invitation letter', hint: '' },
                      { key: 'doc_cover', label: 'Cover letter', hint: 'We can draft this for you' },
                      { key: 'doc_employment', label: 'Employment / student letter', hint: '' },
                    ].map((d) => {
                      const uploaded = docUrls[d.key] ?? [];
                      const uploadedCount = uploaded.length;
                      return (
                        <div key={d.key} className={`rounded-xl border p-4 transition-all ${uploaded.length > 0 ? 'border-primary/40 bg-primary/[0.03]' : 'border-soft bg-surface-container/60'}`}>
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={!!formData[d.key]}
                              onChange={(e) => updateForm(d.key, e.target.checked ? (uploaded.length ? uploaded.join(',') : 'yes') : '')}
                              className="mt-1"
                              style={{ accentColor: 'var(--color-primary)' }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-on-surface">{d.label}</p>
                                {uploaded.length > 0 && (
                                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success">
                                    <Check className="w-3 h-3" /> {uploaded.length} file{uploaded.length > 1 ? 's' : ''} uploaded
                                  </span>
                                )}
                              </div>
                              {d.hint && <p className="text-xs text-on-surface-variant mt-0.5">{d.hint}</p>}
                            </div>
                          </div>

                          {isPresetBooking && (
                            <div className="mt-3 pl-7">
                              {/* Uploaded files */}
                              {uploaded.length > 0 && (
                                <div className="space-y-1.5 mb-2">
                                  {uploaded.map((url) => (
                                    <div key={url} className="flex items-center gap-2 rounded-lg bg-surface-container px-2.5 py-1.5 border border-outline-variant">
                                      <FileText className="w-3.5 h-3.5 shrink-0 text-on-surface-variant" />
                                      <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0">
                                        <span className="block text-xs font-medium text-primary hover:underline truncate">
                                          {url.split('/').pop()?.split('?')[0] || 'File'}
                                        </span>
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => removeVisaDoc(d.key, url)}
                                        className="p-1 rounded-md hover:bg-danger-soft text-on-surface-variant hover:text-error transition-colors"
                                        aria-label="Remove file"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Upload button */}
                              <label className="group flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                                uploaded.length > 0 ? 'border-primary/40 bg-primary/5 hover:bg-primary/10' : 'border-outline-variant hover:border-primary/40'
                              }">
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => { void uploadVisaDoc(d.key, e.target.files); e.currentTarget.value = ''; }}
                                />
                                {docUploading[d.key] ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    <span className="text-xs font-medium text-primary">{isBn ? 'আপলোড হচ্ছে...' : 'Uploading...'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-medium text-primary">
                                      {uploaded.length > 0
                                        ? isBn ? `আরও ফাইল যোগ করুন (${uploaded.length} আপলোড হয়েছে)` : `Add ${d.key === 'doc_photos' ? 'more photos' : 'more files'} (${uploaded.length} uploaded)`
                                        : isBn ? 'ফাইল আপলোড করুন' : `Upload ${d.label.toLowerCase()}`}
                                    </span>
                                  </>
                                )}
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Input label={isBn ? 'নোট (ঐ�্ছিক)' : t('booking_notes')} value={formData.notes || ''} onChange={(e) => updateForm('notes', e.target.value)} placeholder="Anything we should know?" />
                </div>
              )}

              {/* STANDARD FLOW */}
              {currentStep === 1 && bookingType !== 'visa' && (
                <div className="space-y-5">
                  <SectionHeading title={t('booking_section_contact')} help={t('booking_section_contact_help')} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label={t('booking_first_name')} value={formData.firstName || ''} onChange={(e) => updateForm('firstName', e.target.value)} required error={fieldErrors.firstName} />
                    <Input label={t('booking_last_name')} value={formData.lastName || ''} onChange={(e) => updateForm('lastName', e.target.value)} required error={fieldErrors.lastName} />
                  </div>
                  <Input label={t('booking_email')} type="email" value={formData.email || ''} onChange={(e) => updateForm('email', e.target.value)} error={fieldErrors.email} />
                  <PhoneInput
                    label={t('booking_phone')}
                    countryCode={getStoredPhoneParts().code}
                    number={getStoredPhoneParts().number}
                    onCountryCodeChange={(c) => {
                      const parts = getStoredPhoneParts();
                      setPhoneParts(c, parts.number);
                    }}
                    onNumberChange={(v) => {
                      const parts = getStoredPhoneParts();
                      setPhoneParts(parts.code, v);
                    }}
                    required
                    error={fieldErrors.phone}
                  />
                  {bookingType === 'tour' && (
                    <div>
                      <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
                        {t('booking_notes')}
                      </label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => updateForm('notes', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl text-on-surface placeholder:text-muted outline-none border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all bg-surface-container/60 backdrop-blur-md"
                        placeholder={isBn ? 'আপনার ভ্রমণ সম্পর্কে একটি সংক্ষিপ্ত নোট লিখুন' : 'Leave a short note about your trip (optional)'}
                      />
                      <p className="text-xs text-muted mt-1">
                        {isBn ? 'আপনার বুকিং নিশ্চিত হওয়ার পর আমরা কল/এসএমএস/ইমেইলের মাধ্যমে আপনার সাথে যোগাযোগ করব।' : 'We will contact you by call, SMS or email after your booking is confirmed.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && bookingType !== 'visa' && bookingType !== 'tour' && (
                <div className="space-y-5">
                  <SectionHeading title={t('booking_section_trip')} help={t('booking_section_trip_help')} />
                  <DestinationAutocomplete
                    label={t('booking_destination')}
                    value={formData.destination || ''}
                    onChange={(v) => updateForm('destination', v)}
                    placeholder={t('booking_destination_ph')}
                    required
                    error={fieldErrors.destination}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label={t('booking_start_date')} type="date" value={formData.startDate || ''} onChange={(e) => updateForm('startDate', e.target.value)} required error={fieldErrors.startDate} />
                    <Input label={t('booking_end_date')} type="date" value={formData.endDate || ''} onChange={(e) => updateForm('endDate', e.target.value)} />
                  </div>
                  <Input label={t('booking_guests')} type="number" min={1} value={formData.guests || ''} onChange={(e) => updateForm('guests', e.target.value)} required error={fieldErrors.guests} />
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">
                      {t('booking_notes')}
                    </label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => updateForm('notes', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl text-on-surface placeholder:text-muted outline-none border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all bg-surface-container/60 backdrop-blur-md"
                      placeholder={t('booking_notes_ph')}
                    />
                  </div>
                </div>
              )}

              {/* REVIEW (standard step 3 / tour step 2 / visa step 3 or 4) */}
              {((currentStep === 3 && bookingType !== 'visa') || (bookingType === 'visa' && currentStep === (isPresetBooking ? 3 : 4)) || (currentStep === 2 && bookingType === 'tour')) && (
                <div className="space-y-5">
                  <SectionHeading title={t('booking_review_title')} help={t('booking_review_help')} />
                  {bookingType === 'visa' ? (
                    <div className="space-y-3">
                      <ReviewRow label={isBn ? 'আবেদনকারী' : 'Applicant'} value={`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || '—'} />
                      <ReviewRow label={t('booking_email')} value={formData.email || '—'} />
                      {!isPresetBooking && (
                        <>
                          <ReviewRow label={isBn ? 'গন্তব্য' : 'Destination'} value={formData.destination || '—'} />
                          <ReviewRow label={isBn ? 'ভিসার ধরন' : 'Visa type'} value={<span className="capitalize">{formData.visaType || '—'}</span>} />
                          <ReviewRow label={t('booking_dates')} value={`${formData.arrivalDate || '—'} → ${formData.departureDate || '—'}`} />
                        </>
                      )}
                      <div className="rounded-2xl border border-soft p-5 mt-2 bg-surface-container/60">
                        <div className="text-[10px] uppercase tracking-widest text-muted mb-2">{t('booking_field_service_fee')}</div>
                        <div className="font-display text-3xl font-bold text-on-surface">{formatCurrency(totalAmount || 0, 'BDT')}</div>
                        <p className="text-xs text-muted mt-2">{t('booking_field_embassy_help')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <ReviewRow label={t('booking_service')} value={displayName} />
                      <ReviewRow label={t('booking_type_label')} value={t(`booking_type_${bookingType}` as any)} />
                      {bookingType !== 'tour' && <ReviewRow label={t('booking_destination')} value={formData.destination || '—'} />}
                      <ReviewRow label={isBn ? 'অতিথির নাম' : 'Guest name'} value={`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || '—'} />
                      <ReviewRow label={t('booking_email')} value={formData.email || '—'} />
                      <ReviewRow label={t('booking_phone')} value={formData.phone || '—'} />
                      {bookingType !== 'tour' && <ReviewRow label={t('booking_dates')} value={`${formData.startDate || '—'}${formData.endDate ? ` — ${formData.endDate}` : ''}`} />}
                      {bookingType !== 'tour' && <ReviewRow label={t('booking_guests')} value={String(formData.guests || 1)} />}
                      {formData.notes && <ReviewRow label={t('booking_notes')} value={formData.notes} />}
                    </div>
                  )}
                </div>
              )}

              {/* CHECKOUT (preset bookings only: standard step 4 / tour step 3) */}
              {isPresetBooking && ((currentStep === 4 && bookingType !== 'visa' && bookingType !== 'tour') || (currentStep === 3 && bookingType === 'tour')) && (
                <div className="space-y-6">
                  <SectionHeading title={t('booking_step_checkout')} help={t('booking_checkout_help')} />
                  
                  <div className="rounded-2xl border border-soft p-5 bg-surface-container/60">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-muted mb-3">
                      {isBn ? 'পেমেন্ট সারসংক্ষেপ' : 'Payment Summary'}
                    </div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm text-muted">{displayName}</span>
                      <span className="font-display text-xl font-bold text-on-surface">
                        {formatCurrency(totalAmount || 0, 'BDT')}
                      </span>
                    </div>
                    <div className="text-xs text-muted">
                      {isBn ? 'পেমেন্ট ঐচ্ছিক — এখনই বা পরে পরিশোধ করতে পারবেন' : 'Payment is optional — pay now or later'}
                    </div>
                  </div>

                  {paymentInstructions && (
                    <div className="flex items-start gap-2 rounded-xl border border-soft p-3 bg-surface-container/60">
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-primary)]" />
                      <p className="text-xs text-muted">{paymentInstructions}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-3">
                      {isBn ? 'পেমেন্ট পদ্ধতি নির্বাচন করুন' : 'Select Payment Method'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        ...Array.from(new Set(wallets.map((w) => w.provider))).map((provider) => ({
                          id: provider,
                          icon: Smartphone,
                          label: WALLET_LABELS[provider] || provider,
                          desc: isBn ? `${WALLET_LABELS[provider] || provider} পাঠিয়ে ট্রানজেকশন আইডি দিন` : `Send ${WALLET_LABELS[provider] || provider} and submit your transaction ID`,
                        })),
                        { id: 'bank_transfer', icon: Building, label: isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer', desc: isBn ? 'আমাদের হিসাবে পাঠিয়ে রসিদ আপলোড করুন' : 'Transfer to our account and upload the receipt' },
                        { id: 'cash', icon: Banknote, label: isBn ? 'নগদ' : 'Cash', desc: isBn ? 'অফিসে বা কালেকশনের মাধ্যমে পরিশোধ' : 'Pay at our office or via collection' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(m.id);
                            const first = wallets.find((w) => w.provider === m.id);
                            if (first) setSelectedWalletId(first.id);
                          }}
                          className={`flex items-start gap-3 p-4 rounded-xl border text-left transition ${
                            paymentMethod === m.id
                              ? 'border-[var(--color-primary)]'
                              : 'border-soft hover:border-medium'
                          }`}
                          style={paymentMethod === m.id ? { backgroundColor: 'color-mix(in oklab, var(--color-primary) 12%, transparent)' } : { backgroundColor: 'var(--color-surface-container)' }}
                        >
                          <m.icon
                            className="w-5 h-5 mt-0.5 shrink-0"
                            style={{ color: paymentMethod === m.id ? 'var(--color-primary)' : 'var(--color-muted)' }}
                          />
                          <div>
                            <div className="text-sm font-semibold text-on-surface">{m.label}</div>
                            <div className="text-xs text-muted mt-0.5">{m.desc}</div>
                          </div>
                          {paymentMethod === m.id && (
                            <Check className="w-4 h-4 ml-auto mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                          )}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('');
                          setSelectedWalletId('');
                        }}
                        className={`flex items-start gap-3 p-4 rounded-xl border text-left transition ${
                          !paymentMethod
                            ? 'border-[var(--color-primary)]'
                            : 'border-soft hover:border-medium'
                        }`}
                        style={!paymentMethod ? { backgroundColor: 'color-mix(in oklab, var(--color-primary) 12%, transparent)' } : { backgroundColor: 'var(--color-surface-container)' }}
                      >
                        <Clock
                          className="w-5 h-5 mt-0.5 shrink-0"
                          style={{ color: !paymentMethod ? 'var(--color-primary)' : 'var(--color-muted)' }}
                        />
                        <div>
                          <div className="text-sm font-semibold text-on-surface">{isBn ? 'পরে পরিশোধ করুন' : 'Pay Later'}</div>
                          <div className="text-xs text-muted mt-0.5">{isBn ? 'এখনই পেমেন্ট ছাড়াই বুকিং জমা দিন' : 'Submit booking now and pay later'}</div>
                        </div>
                        {!paymentMethod && (
                          <Check className="w-4 h-4 ml-auto mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                        )}
                      </button>
                    </div>
                    {!paymentMethod && (
                      <p className="text-xs text-muted mt-3 text-center">{isBn ? 'পেমেন্ট ঐচ্ছিক — আপনি পরে পরিশোধ করতে পারবেন' : 'Payment is optional — you can pay later'}</p>
                    )}

                    {renderPaymentDetailInputs()}
                  </div>

                  <p className="text-xs text-muted text-center">{t('booking_terms')}</p>
                </div>
              )}

              {/* CONFIRM (visa step 4 / preset step 3) */}
              {bookingType === 'visa' && currentStep === (isPresetBooking ? 3 : 4) && (
                <div className="space-y-6">
                  <SectionHeading title={t('booking_step_confirm')} help={t('booking_confirm_help')} />
                  <div className="space-y-3">
                    <ReviewRow label={isBn ? 'আবেদনকারী' : 'Applicant'} value={`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || '—'} />
                    <ReviewRow label={t('booking_email')} value={formData.email || '—'} />
                  </div>

                  <div className="rounded-2xl border border-soft p-5 bg-surface-container/60">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-muted mb-3">
                      {isBn ? 'পেমেন্ট সারসংক্ষেপ' : 'Payment Summary'}
                    </div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm text-muted">{displayName}</span>
                      <span className="font-display text-xl font-bold text-on-surface">
                        {formatCurrency(totalAmount || 0, visaCurrency)}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{t('booking_field_embassy_help')}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-3">
                      {isBn ? 'পেমেন্ট পদ্ধতি নির্বাচন করুন' : 'Select Payment Method'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        ...Array.from(new Set(wallets.map((w) => w.provider))).map((provider) => ({
                          id: provider,
                          icon: Smartphone,
                          label: WALLET_LABELS[provider] || provider,
                          desc: isBn ? `${WALLET_LABELS[provider] || provider} পাঠিয়ে ট্রানজেকশন আইডি দিন` : `Send ${WALLET_LABELS[provider] || provider} and submit your transaction ID`,
                        })),
                        { id: 'bank_transfer', icon: Building, label: isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer', desc: isBn ? 'আমাদের হিসাবে পাঠিয়ে রসিদ আপলোড করুন' : 'Transfer to our account and upload the receipt' },
                        { id: 'cash', icon: Banknote, label: isBn ? 'নগদ' : 'Cash', desc: isBn ? 'অফিসে বা কালেকশনের মাধ্যমে পরিশোধ' : 'Pay at our office or via collection' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(m.id);
                            const first = wallets.find((w) => w.provider === m.id);
                            if (first) setSelectedWalletId(first.id);
                          }}
                          className={`flex items-start gap-3 p-4 rounded-xl border text-left transition ${
                            paymentMethod === m.id
                              ? 'border-[var(--color-primary)]'
                              : 'border-soft hover:border-medium'
                          }`}
                          style={paymentMethod === m.id ? { backgroundColor: 'color-mix(in oklab, var(--color-primary) 12%, transparent)' } : { backgroundColor: 'var(--color-surface-container)' }}
                        >
                          <m.icon
                            className="w-5 h-5 mt-0.5 shrink-0"
                            style={{ color: paymentMethod === m.id ? 'var(--color-primary)' : 'var(--color-muted)' }}
                          />
                          <div>
                            <div className="text-sm font-semibold text-on-surface">{m.label}</div>
                            <div className="text-xs text-muted mt-0.5">{m.desc}</div>
                          </div>
                          {paymentMethod === m.id && (
                            <Check className="w-4 h-4 ml-auto mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                          )}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('');
                          setSelectedWalletId('');
                        }}
                        className={`flex items-start gap-3 p-4 rounded-xl border text-left transition ${
                          !paymentMethod
                            ? 'border-[var(--color-primary)]'
                            : 'border-soft hover:border-medium'
                        }`}
                        style={!paymentMethod ? { backgroundColor: 'color-mix(in oklab, var(--color-primary) 12%, transparent)' } : { backgroundColor: 'var(--color-surface-container)' }}
                      >
                        <Clock
                          className="w-5 h-5 mt-0.5 shrink-0"
                          style={{ color: !paymentMethod ? 'var(--color-primary)' : 'var(--color-muted)' }}
                        />
                        <div>
                          <div className="text-sm font-semibold text-on-surface">{isBn ? 'পরে পরিশোধ করুন' : 'Pay Later'}</div>
                          <div className="text-xs text-muted mt-0.5">{isBn ? 'এখনই পেমেন্ট ছাড়াই বুকিং জমা দিন' : 'Submit booking now and pay later'}</div>
                        </div>
                        {!paymentMethod && (
                          <Check className="w-4 h-4 ml-auto mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {renderPaymentDetailInputs()}

                  <p className="text-xs text-muted text-center">{t('booking_terms')}</p>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8 pt-6 border-t border-soft">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (currentStep === 1 && !typeLocked) setBookingType('tour');
                    else if (currentStep === 1 && typeLocked) return;
                    else setStep(currentStep - 1);
                    setFieldErrors({});
                    setError(null);
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {currentStep === 1 && !typeLocked ? t('booking_back_to_types') : t('booking_previous')}
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => { reset(); setDocUrls({}); setDocUploading({}); }}>{t('booking_cancel')}</Button>
                  <Button
                    size="lg"
                    disabled={submitting}
                    onClick={tryAdvance}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isBn ? 'পাঠানো হচ্ছে...' : 'Submitting...'}
                      </>
                    ) : isLastStep ? (
                      t('booking_submit')
                    ) : (
                      <>
                        {t('booking_next')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar summary */}
          <aside className="hidden lg:block">
            <ItemSummaryCard t={t} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-soft">
      <span className="text-sm text-muted shrink-0">{label}</span>
      <span className="text-sm font-medium text-on-surface text-right break-words">{value}</span>
    </div>
  );
}
