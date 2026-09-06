'use client';

import { useRef, useState } from 'react';
import { Camera, CheckCircle2, Loader2 } from 'lucide-react';
import { clientApi } from '@/lib/api';
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
      consent: true,
      slug: 'saint-martin-trip-2026',
      tag: 'saintmartin',
    };

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
    <section id="register" className="section-pad bg-[var(--color-mist)]">
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
              <div className="sm:col-span-2 rounded-xl border border-black/10 bg-[var(--color-mist)] p-4">
                <label className="flex items-start gap-3 text-sm leading-relaxed">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                  />
                  <span>
                    {f(
                      'I agree to abide by all the terms, conditions and instructions of "Saint Martin Cleanup Campaign, Free Blood Grouping & Free Medical Camp 2026" and to actively take part in the cleanup and other social and humanitarian activities.',
                      'আমি উপরোক্ত সকল শর্ত, নিয়ম ও নির্দেশনা মেনে চলতে সম্মত।',
                    )}
                  </span>
                </label>
              </div>
            </div>

            {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-primary-darker)] disabled:opacity-60 sm:w-auto"
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