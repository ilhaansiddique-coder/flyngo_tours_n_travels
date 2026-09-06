'use client';

import { useRef, useState } from 'react';
import { Camera, CheckCircle2, Copy, FileText, Loader2, Phone } from 'lucide-react';
import { assetUrl, clientApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface LandingFormSectionProps {
  headingEn?: string;
  headingBn?: string;
  bodyEn?: string;
  bodyBn?: string;
  responseUrl?: string;
  formUrl?: string;
  fbzx?: string;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BKASH_MERCHANT = '01970534363';

const CONTACT_NUMBER = '01681635657';

const PAYMENT_TYPES: Array<{
  value: string;
  labelEn: string;
  labelBn: string;
}> = [
  { value: 'full_6250', labelEn: 'Full payment — BDT 6,250', labelBn: 'সম্পূর্ণ টাকা পরিশোধ — ৬,২৫০ টাকা' },
  { value: 'full_7250', labelEn: 'Full payment — BDT 7,250 (Couple Room)', labelBn: 'সম্পূর্ণ টাকা পরিশোধ — ৭,২৫০ টাকা (কাপল রুম)' },
  { value: 'advance_2000', labelEn: 'Advance payment — BDT 2,000 (non-refundable)', labelBn: 'অগ্রিম পেমেন্ট — ২,০০০ টাকা (অফেরতযোগ্য)' },
];

function inputClass(extra = '') {
  return cn(
    'mt-1.5 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]',
    extra,
  );
}

function addHidden(form: HTMLFormElement, name: string, value: string) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value || '';
  form.appendChild(input);
}

export function LandingFormSection({
  headingEn,
  headingBn,
  bodyEn,
  bodyBn,
  responseUrl,
  fbzx,
}: LandingFormSectionProps) {
  const { lang } = useI18n();
  const bn = lang === 'bn';
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoError, setPhotoError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const [receipt, setReceipt] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const receiptInput = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [paymentType, setPaymentType] = useState('');

  const copyBkash = async () => {
    try {
      await navigator.clipboard.writeText(BKASH_MERCHANT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const onReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^(image\/(png|jpe?g|webp)|application\/pdf)$/i.test(file.type)) {
      setReceiptError(f('Please choose a PNG, JPG, WebP image or PDF.', 'অনুগ্রহ করে PNG, JPG, WebP ছবি বা PDF নির্বাচন করুন।'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setReceiptError(f('Receipt must be under 5MB.', 'রিসিটের আকার ৫ এমবির কম হতে হবে।'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setReceipt(String(reader.result || ''));
      setReceiptName(file.name);
      setReceiptError('');
    };
    reader.readAsDataURL(file);
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setPhotoError(f('Please choose a PNG, JPG or WebP image.', 'অনুগ্রহ করে PNG, JPG বা WebP ছবি নির্বাচন করুন।'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError(f('Image must be under 2MB.', 'ছবির আকার ২ এমবির কম হতে হবে।'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result || ''));
      setPhotoError('');
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setSending(true);
    setError('');

    const payload = {
      name: String(data.name || '').trim(),
      mobile: String(data.mobile || '').trim(),
      emergency: String(data.emergency || '').trim(),
      organization: String(data.organization || '').trim(),
      bloodGroup: String(data.bloodGroup || '').trim(),
      address: String(data.address || '').trim(),
      reference: String(data.reference || '').trim(),
      fbProfile: String(data.fbProfile || '').trim(),
      photo,
      paymentType,
      bkashTrxId: String(data.bkashTrxId || '').trim(),
      receipt,
      consent: true,
      slug: 'saint-martin-trip-2026',
      tag: 'saintmartin',
    };

    if (!paymentType) {
      setError(f('Please select a payment type.', 'অনুগ্রহ করে একটি পেমেন্ট টাইপ নির্বাচন করুন।'));
      setSending(false);
      return;
    }
    if (!payload.bkashTrxId || !receipt) {
      setError(f('Please enter your bKash transaction ID and upload the payment receipt.', 'অনুগ্রহ করে আপনার বিকাশ ট্রানজেকশন আইডি দিন এবং পেমেন্ট রিসিট আপলোড করুন।'));
      setSending(false);
      return;
    }

    try {
      await clientApi('/public/registrations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setSending(false);
      setDone(true);
      return;
    } catch {
      // fall back to the Google Form so no registration is ever lost
      submitToGoogle(data);
    }
  };

  const submitToGoogle = (data: Record<string, FormDataEntryValue>) => {
    if (!responseUrl) {
      setSending(false);
      setError('Registration could not be submitted. Please try again.');
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.name = 'vbt_gform_frame';
    iframe.style.display = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = responseUrl;
    form.target = iframe.name;

    addHidden(form, 'entry.324351436', String(data.name || '').trim());
    addHidden(form, 'entry.2140043166', String(data.mobile || '').trim());
    addHidden(form, 'entry.996255683', String(data.emergency || '').trim());
    addHidden(form, 'entry.1962826868', String(data.address || '').trim());
    addHidden(form, 'entry.1187053140', String(data.organization || '').trim());
    addHidden(form, 'entry.1345482650', String(data.bloodGroup || '').trim());
    addHidden(form, 'entry.1605399676', String(data.reference || '').trim());
    addHidden(form, 'entry.316623609', String(data.fbProfile || '').trim());
    addHidden(
      form,
      'entry.116842694',
      'আমি উপরোক্ত সকল শর্ত, নিয়ম ও নির্দেশনা মেনে চলতে সম্মত।',
    );
    addHidden(form, 'fbzx', fbzx || '');
    addHidden(form, 'pageHistory', '0');
    addHidden(form, 'draftResponse', '[]');
    addHidden(form, 'fvv', '1');

    document.body.appendChild(form);
    form.submit();

    window.setTimeout(() => {
      form.remove();
      setSending(false);
      setDone(true);
    }, 400);
  };

  const f = (en: string, b: string) => (bn ? b : en);

  return (
    <section id="register" className="section-pad-sm bg-[var(--color-mist)]">
      <div className="container-site max-w-3xl">
        <h2 className="text-2xl font-bold">{headingEn || headingBn ? (bn ? headingBn : headingEn) : ''}</h2>
        {bodyEn || bodyBn ? (
          <p className="mt-3 leading-relaxed text-[var(--color-ink-soft)]">{bn ? bodyBn : bodyEn}</p>
        ) : null}

        {done ? (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="mt-4 text-xl font-bold text-green-900">
              {f('Registration recorded!', 'নিবন্ধন গ্রহণ করা হয়েছে!')}
            </h3>
            <p className="mt-2 text-sm text-green-800">
              {f(
                'Thank you. Our team will contact you shortly to confirm your seat.',
                'ধন্যবাদ। আমাদের টিম শীঘ্রই আসন নিশ্চিত করতে আপনার সাথে যোগাযোগ করবে।',
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" htmlFor="name">
                  {f('Name', 'নাম')} <span className="text-red-600">*</span>
                </label>
                <input id="name" name="name" required placeholder={bn ? 'আপনার নাম' : 'Your name'} className={inputClass()} />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="mobile">
                  {f('Mobile Number', 'মোবাইল নম্বর')} <span className="text-red-600">*</span>
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  placeholder={bn ? 'আপনার মোবাইল নম্বর' : 'Your mobile number'}
                  className={inputClass()}
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="emergency">
                  {f('Emergency Contact (Guardian Name & Number)', 'জরুরি যোগাযোগ (অভিভাবকের নাম ও নম্বর)')}{' '}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  id="emergency"
                  name="emergency"
                  required
                  placeholder={bn ? 'নাম ও নম্বর' : 'Name & number'}
                  className={inputClass()}
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="organization">
                  {f('Organization Name', 'প্রতিষ্ঠানের নাম')} <span className="text-red-600">*</span>
                </label>
                <input
                  id="organization"
                  name="organization"
                  required
                  placeholder={bn ? 'প্রতিষ্ঠানের নাম (নেই থাকলে লিখুন — নেই)' : 'Organization name'}
                  className={inputClass()}
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="bloodGroup">
                  {f('Blood Group', 'রক্তের গ্রুপ')} <span className="text-red-600">*</span>
                </label>
                <select id="bloodGroup" name="bloodGroup" required className={inputClass()}>
                  <option value="">{bn ? 'নির্বাচন করুন' : 'Select'}</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="reference">
                  {f('Name of Reference', 'রেফারেন্সের নাম')} {`(${bn ? 'ঐচ্ছিক' : 'optional'})`}
                </label>
                <input
                  id="reference"
                  name="reference"
                  placeholder={bn ? 'আপনার উত্তরের' : 'Your answer'}
                  className={inputClass()}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold" htmlFor="address">
                  {f('Address', 'ঠিকানা')} <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={2}
                  placeholder={bn ? 'আপনার ঠিকানা' : 'Your address'}
                  className={inputClass()}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold" htmlFor="fbProfile">
                  {f('FB Profile link', 'ফেসবুক প্রোফাইল লিংক')} <span className="text-red-600">*</span>
                </label>
                <input
                  id="fbProfile"
                  name="fbProfile"
                  type="url"
                  required
                  placeholder="https://facebook.com/your.profile"
                  className={inputClass()}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold" htmlFor="photo">
                  {f('Profile photo', 'প্রোফাইল ছবি')} <span className="font-normal text-[var(--color-ink-muted)]">({f('optional', 'ঐচ্ছিক')})</span>
                </label>
                <div className="mt-1.5 flex items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-[var(--color-mist)]">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="absolute inset-0 m-auto h-5 w-5 text-[var(--color-ink-muted)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <input
                      ref={fileInput}
                      id="photo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={onPhotoChange}
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="rounded-lg border border-black/10 bg-[var(--color-mist)] px-4 py-2 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                      >
                        {photo ? f('Change photo', 'ছবি পরিবর্তন করুন') : f('Upload photo', 'ছবি আপলোড করুন')}
                      </button>
                      {photo ? (
                        <button
                          type="button"
                          onClick={() => {
                            setPhoto('');
                            setPhotoError('');
                            if (fileInput.current) fileInput.current.value = '';
                          }}
                          className="rounded-lg bg-[var(--color-crimson-light)] px-3 py-2 text-sm font-semibold text-[var(--color-crimson)]"
                        >
                          {f('Remove', 'মুছে ফেলুন')}
                        </button>
                      ) : null}
                    </div>
                    {photoError ? <p className="mt-1.5 text-xs font-medium text-red-600">{photoError}</p> : null}
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2 rounded-xl border border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)] p-4">
                <p className="text-sm font-bold text-[var(--color-primary-dark)]">{f('Payment via bKash Merchant', 'বিকাশ মার্চেন্টের মাধ্যমে পেমেন্ট')}</p>
                <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                  {f('Scan the QR code or send to the bKash merchant number below, then enter the transaction ID (TrxID) and upload the receipt.', 'QR কোড স্ক্যান করুন অথবা নিচের বিকাশ মার্চেন্ট নম্বরে পেমেন্ট পাঠান, তারপর TrxID দিন এবং রিসিট আপলোড করুন।')}
                </p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assetUrl('/images/landing/payment.jpeg')}
                    alt="bKash QR code"
                    className="h-64 w-64 shrink-0 rounded-xl border border-black/10 bg-white object-contain p-2"
                  />
                  <div className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">{f('bKash Merchant Number', 'বিকাশ মার্চেন্ট নম্বর')}</p>
                    <p className="mt-0.5 text-lg font-bold tracking-wide text-[var(--color-primary-dark)]">{BKASH_MERCHANT}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={copyBkash}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-[var(--color-mist)] px-3 py-1.5 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                      >
                        {copied ? <CheckCircle2 size={15} className="text-green-600" /> : <Copy size={15} />}
                        {copied ? f('Copied!', 'কপি হয়েছে!') : f('Copy number', 'নম্বর কপি করুন')}
                      </button>
                      <a
                        href={`tel:${CONTACT_NUMBER}`}
                        title={CONTACT_NUMBER}
                        aria-label={CONTACT_NUMBER}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-[var(--color-mist)] text-[var(--color-ink-soft)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                      >
                        <Phone size={15} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold">
                  {f('Payment Type', 'পেমেন্ট টাইপ')} <span className="text-red-600">*</span>
                </label>
                <div className="mt-2 grid gap-2 sm:grid-cols-1">
                  {PAYMENT_TYPES.map((pt) => (
                    <label
                      key={pt.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm transition',
                        paymentType === pt.value
                          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]'
                          : 'border-black/10 hover:border-[var(--color-primary)]',
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        value={pt.value}
                        required
                        checked={paymentType === pt.value}
                        onChange={() => setPaymentType(pt.value)}
                        className="h-4 w-4 cursor-pointer accent-[var(--color-primary)]"
                      />
                      <span className="font-medium text-[var(--color-ink)]">
                        {bn ? pt.labelBn : pt.labelEn}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="bkashTrxId">
                  {f('bKash Transaction ID (TrxID)', 'বিকাশ ট্রানজেকশন আইডি (TrxID)')} <span className="text-red-600">*</span>
                </label>
                <input
                  id="bkashTrxId"
                  name="bkashTrxId"
                  required
                  placeholder="e.g. 9HK4A6BD7C"
                  className={inputClass()}
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="receipt">
                  {f('Payment Receipt (image or PDF)', 'পেমেন্ট রিসিট (ছবি বা PDF)')} <span className="text-red-600">*</span>
                </label>
                <div className="mt-1.5 flex items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-[var(--color-mist)]">
                    {receipt && !receipt.startsWith('data:application/pdf') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={receipt} alt="" className="h-full w-full object-cover" />
                    ) : receipt && receipt.startsWith('data:application/pdf') ? (
                      <FileText className="absolute inset-0 m-auto h-6 w-6 text-[var(--color-crimson)]" />
                    ) : (
                      <Camera className="absolute inset-0 m-auto h-5 w-5 text-[var(--color-ink-muted)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <input
                      ref={receiptInput}
                      id="receipt"
                      name="receipt"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      onChange={onReceiptChange}
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => receiptInput.current?.click()}
                        className="rounded-lg border border-black/10 bg-[var(--color-mist)] px-4 py-2 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                      >
                        {receipt ? f('Change receipt', 'রিসিট পরিবর্তন করুন') : f('Upload receipt', 'রিসিট আপলোড করুন')}
                      </button>
                      {receipt ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReceipt('');
                            setReceiptName('');
                            setReceiptError('');
                            if (receiptInput.current) receiptInput.current.value = '';
                          }}
                          className="rounded-lg bg-[var(--color-crimson-light)] px-3 py-2 text-sm font-semibold text-[var(--color-crimson)]"
                        >
                          {f('Remove', 'মুছে ফেলুন')}
                        </button>
                      ) : null}
                    </div>
                    {receiptName ? <p className="mt-1.5 truncate text-xs text-[var(--color-ink-muted)]">{receiptName}</p> : null}
                    {receiptError ? <p className="mt-1.5 text-xs font-medium text-red-600">{receiptError}</p> : null}
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2 rounded-xl border border-black/10 bg-[var(--color-mist)] p-4">
                <label className="flex items-start gap-3 text-sm leading-relaxed">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                  />
                  <span>
                    {f(
                      'UNDERTAKING AND DECLARATION, I hereby declare and undertake that I will duly comply with all the rules, terms, conditions, and instructions of the **“Saint Martin Cleanliness Campaign, Free Blood Grouping & Free Medical Camp 2026”** and will actively participate in the cleanliness campaign and other social and humanitarian activities organized as part of the event. I further declare that all information provided by me in the registration form is true, accurate, and complete. I voluntarily agree to participate in the event entirely at my own responsibility, including transportation to and from Saint Martin by trawler. During my participation in the event, I will remain responsible for my personal safety, health, and necessary precautions, and will act responsibly at all times. I hereby confirm that I have read, understood, and agreed to abide by all the above-mentioned terms, rules, and instructions.',
                      'অঙ্গীকারনামা, আমি এই মর্মে ঘোষণা ও অঙ্গীকার করছি যে, “সেন্টমার্টিন পরিচ্ছন্নতা অভিযান, ফ্রি ব্লাড গ্রুপিং ও ফ্রি মেডিকেল ক্যাম্প ২০২৬”-এর সকল নিয়ম, শর্ত ও নির্দেশনা যথাযথভাবে মেনে চলব এবং পরিচ্ছন্নতা অভিযানসহ অন্যান্য সামাজিক ও মানবিক কার্যক্রমে সক্রিয়ভাবে অংশগ্রহণ করব। আমি আরও ঘোষণা করছি যে, রেজিস্ট্রেশন ফরমে আমার প্রদত্ত সকল তথ্য সঠিক ও সত্য। আমি স্বেচ্ছায় এবং সম্পূর্ণ নিজ দায়িত্বে ট্রলারযোগে যাতায়াতসহ উক্ত আয়োজনে অংশগ্রহণ করতে সম্মত। আয়োজনে অংশগ্রহণকালীন আমার ব্যক্তিগত নিরাপত্তা, স্বাস্থ্য ও প্রয়োজনীয় সতর্কতার বিষয়ে আমি নিজ দায়িত্বে সচেতন থাকব। আমি উপরোক্ত সকল শর্ত, নিয়ম ও নির্দেশনা মেনে চলতে সম্মত।',
                    )}
                  </span>
                </label>
              </div>
            </div>

            {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={sending || !paymentType || !receipt}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-primary-darker)] disabled:opacity-50 disabled:pointer-events-none sm:w-auto"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  f('Submit Registration', 'নিবন্ধন জমা দিন')
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
