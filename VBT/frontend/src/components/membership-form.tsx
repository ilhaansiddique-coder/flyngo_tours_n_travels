'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Upload } from 'lucide-react';
import { clientApi } from '@/lib/api';
import { authHeaders } from '@/lib/session';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface MemberCategory {
  key: string;
  labelEn: string;
  labelBn?: string;
  fee?: number;
  descEn?: string;
  descBn?: string;
}

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function inputClass(extra = '') {
  return cn(
    'mt-1.5 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]',
    extra,
  );
}

export function MembershipForm() {
  const { lang } = useI18n();
  const bn = lang === 'bn';

  const [categories, setCategories] = useState<MemberCategory[]>([]);
  const [category, setCategory] = useState('');
  const [photo, setPhoto] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<{ memberId: string; status: string } | null>(null);

  useEffect(() => {
    clientApi<MemberCategory[]>('/public/member-categories')
      .then((list) => {
        setCategories(list);
        if (list.length) setCategory(list[0].key);
      })
      .catch(() => setCategories([]));
  }, []);

  const selected = useMemo(() => categories.find((c) => c.key === category), [categories, category]);

  const onPhoto = (file?: File) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|jpg|webp)$/.test(file.type)) {
      setMessage(bn ? 'ছবি অবশ্যই PNG/JPEG হোতে হবে।' : 'Photo must be a PNG/JPEG/WebP image.');
      setState('error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage(bn ? 'ছবির আকার ২ MB-এর মধ্যে রাখুন।' : 'Photo must be under 2MB.');
      setState('error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
      setMessage('');
      setState('idle');
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState('loading');
    setMessage('');
    try {
      const payload = {
        category,
        fullName: String(data.fullName || '').trim(),
        fatherName: String(data.fatherName || '').trim() || undefined,
        motherName: String(data.motherName || '').trim() || undefined,
        nidNo: String(data.nidNo || '').trim() || undefined,
        birthDate: String(data.birthDate || '').trim() || undefined,
        gender: String(data.gender || '') || undefined,
        bloodGroup: String(data.bloodGroup || '') || undefined,
        mobile: String(data.mobile || '').trim(),
        email: String(data.email || '').trim(),
        presentAddress: String(data.presentAddress || '').trim() || undefined,
        permanentAddress: String(data.permanentAddress || '').trim() || undefined,
        education: String(data.education || '').trim() || undefined,
        profession: String(data.profession || '').trim() || undefined,
        institution: String(data.institution || '').trim() || undefined,
        emergencyContact: String(data.emergencyContact || '').trim() || undefined,
        emergencyMobile: String(data.emergencyMobile || '').trim() || undefined,
        volunteerExperience: String(data.volunteerExperience || '').trim() || undefined,
        reference: String(data.reference || '').trim() || undefined,
        fbLink: String(data.fbLink || '').trim() || undefined,
        photo: photo || undefined,
        consent: data.consent === 'on',
        password: String(data.password || '') || undefined,
      };
      const res = await clientApi<{ success: boolean; memberId: string; status: string; message: string }>(
        '/public/members',
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        },
      );
      setResult({ memberId: res.memberId, status: res.status });
      setState('done');
      setMessage(res.message);
      form.reset();
      setPhoto('');
    } catch (err) {
      setState('error');
      setMessage((err as Error).message);
    }
  };

  const statusChip = (s: string) =>
    cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
      s === 'APPROVED' && 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]',
      s === 'REJECTED' && 'bg-[var(--color-crimson-light)] text-[var(--color-crimson)]',
      s === 'PENDING' && 'bg-[var(--color-gold-lighter)] text-[var(--color-gold-deep)]',
    );

  if (state === 'done' && result) {
    return (
      <div className="rounded-2xl border border-[var(--color-primary-light)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <CheckCircle2 size={44} className="mx-auto text-[var(--color-primary)]" />
        <h2 className="mt-4 text-2xl font-bold">
          {bn ? 'আবেদন জমা হয়েছে!' : 'Application submitted!'}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-ink-soft)]">{message}</p>
        <div className="mx-auto mt-6 max-w-sm rounded-xl border border-black/5 bg-[var(--color-mist)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
            {bn ? 'সদস্য রেফারেন্স' : 'Member reference'}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-[var(--color-royal)]">{result.memberId}</p>
          <div className="mt-3 flex justify-center">{statusChip(result.status)}</div>
          <p className="mt-3 text-xs text-[var(--color-ink-soft)]">
            {bn
              ? 'এই রেফারেন্স দিয়ে /membership পৃষ্ঠায় স্থিতি দেখুন। অনুমোদনের পর সদস্য ফি প্রদান করুন।'
              : 'Use this reference to track your status on the Membership page. Pay your membership fee once approved.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setState('idle');
            setResult(null);
            setMessage('');
            setCategory(categories[0]?.key || '');
          }}
          className="mt-6 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)]"
        >
          {bn ? 'আরেকটি আবেদন' : 'Submit another application'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      {/* Category selection */}
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((c) => {
          const active = c.key === category;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={cn(
                'flex items-center justify-between gap-3 rounded-xl border-2 p-4 text-left transition',
                active
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-lighter)]'
                  : 'border-black/5 bg-white hover:border-[var(--color-primary-light)]',
              )}
            >
              <div>
                <p className={cn('font-bold', active ? 'text-[var(--color-primary-dark)]' : 'text-[var(--color-ink)]')}>
                  {bn ? c.labelBn || c.labelEn : c.labelEn}
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
                  {bn ? c.descBn || c.descEn : c.descEn}
                </p>
              </div>
              <div className={cn('h-5 w-5 shrink-0 rounded-full border-2', active ? 'border-[var(--color-primary)]' : 'border-[var(--color-ink-faint)]')}>
                {active ? <div className="m-1 h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" /> : null}
              </div>
            </button>
          );
        })}
      </div>
      {selected ? (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-gold-lighter)] px-4 py-1.5 text-sm font-bold text-[var(--color-gold-deep)]">
          {bn ? 'লেবার ফি' : 'Membership fee'}: ৳{selected.fee?.toLocaleString('en-US')}
          {selected.key === 'volunteer' || selected.key === 'general' || selected.key === 'donor'
            ? bn ? ' / বছর' : ' / year'
            : bn ? ' (এককালীন)' : ' (one-time)'}
        </p>
      ) : null}

      {/* Personal info */}
      <SectionTitle>{bn ? 'ব্যক্তিগত তথ্য' : 'Personal information'}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={bn ? 'পূর্ণ নাম *' : 'Full name *'}>
          <input name="fullName" required className={inputClass()} />
        </Field>
        <Field label={bn ? 'ইমেইল *' : 'Email *'}>
          <input name="email" type="email" required className={inputClass()} />
        </Field>
        <Field label={bn ? 'মোবাইল নম্বর *' : 'Mobile number *'}>
          <input name="mobile" required className={inputClass()} />
        </Field>
        <Field label={bn ? 'জন্ম তারিখ' : 'Date of birth'}>
          <input name="birthDate" type="date" className={inputClass()} />
        </Field>
        <Field label={bn ? 'পিতার নাম' : "Father's name"}>
          <input name="fatherName" className={inputClass()} />
        </Field>
        <Field label={bn ? 'মাতার নাম' : "Mother's name"}>
          <input name="motherName" className={inputClass()} />
        </Field>
        <Field label={bn ? 'জাতীয় পরিচয়পত্র নম্বর (ঐচ্ছিক)' : 'NID number (optional)'}>
          <input name="nidNo" className={inputClass()} />
        </Field>
        <Field label={bn ? 'লিঙ্গ' : 'Gender'}>
          <select name="gender" className={inputClass()}>
            <option value="">{bn ? 'নির্বাচন করুন' : 'Select'}</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </Field>
        <Field label={bn ? 'রক্তের গ্রুপ' : 'Blood group'}>
          <select name="bloodGroup" className={inputClass()}>
            <option value="">{bn ? 'নির্বাচন করুন' : 'Select'}</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </Field>
        <Field label={bn ? 'ছবি' : 'Photo'}>
          <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-black/15 bg-[var(--color-mist)] px-4 py-3 text-sm text-[var(--color-ink-soft)] hover:border-[var(--color-primary)]">
            <Upload size={16} />
            <span className="flex-1 truncate">
              {photo
                ? bn ? 'ছবি যুক্ত হয়েছে' : 'Photo attached'
                : bn ? 'ছবি আপলোড করুন (PNG/JPEG, ২ MB)' : 'Upload photo (PNG/JPEG, 2MB)'}
            </span>
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="preview" className="mt-3 h-24 w-24 rounded-xl border border-black/5 object-cover" />
          ) : null}
        </Field>
      </div>

      {/* Address */}
      <SectionTitle>{bn ? 'ঠিকানা' : 'Address'}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={bn ? 'বর্তমান ঠিকানা' : 'Present address'}>
          <input name="presentAddress" className={inputClass()} />
        </Field>
        <Field label={bn ? 'স্থায়ী ঠিকানা' : 'Permanent address'}>
          <input name="permanentAddress" className={inputClass()} />
        </Field>
      </div>

      {/* Profession & education */}
      <SectionTitle>{bn ? 'শিক্ষা ও পেশা' : 'Education & profession'}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={bn ? 'শিক্ষাগত যোগ্যতা' : 'Education'}>
          <input name="education" className={inputClass()} />
        </Field>
        <Field label={bn ? 'পেশা' : 'Profession'}>
          <input name="profession" className={inputClass()} />
        </Field>
        <Field label={bn ? 'প্রতিষ্ঠান' : 'Institution'}>
          <input name="institution" className={inputClass()} />
        </Field>
      </div>

      {/* Emergency + reference */}
      <SectionTitle>{bn ? 'জরুরি যোগাযোগ ও রেফারেন্স' : 'Emergency & reference'}</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={bn ? 'জরুরি যোগাযোগের নাম' : 'Emergency contact name'}>
          <input name="emergencyContact" className={inputClass()} />
        </Field>
        <Field label={bn ? 'জরুরি যোগাযোগের মোবাইল' : 'Emergency contact mobile'}>
          <input name="emergencyMobile" className={inputClass()} />
        </Field>
        <Field label={bn ? 'স্বেচ্ছাসেবী অভিজ্ঞতা (ঐচ্ছিক)' : 'Volunteer experience (years)'}>
          <input name="volunteerExperience" className={inputClass()} />
        </Field>
        <Field label={bn ? 'রেফারেন্স (ঐচ্ছিক)' : 'Name of reference'}>
          <input name="reference" className={inputClass()} />
        </Field>
        <Field label={bn ? 'ফেসবুক প্রোফাইল লিংক' : 'FB profile link'}>
          <input name="fbLink" type="url" placeholder="https://facebook.com/..." className={inputClass()} />
        </Field>
      </div>

      {/* Portal account (optional) */}
      <SectionTitle>{bn ? 'একাউন্ট (ঐচ্ছিক)' : 'Portal account (optional)'}</SectionTitle>
      <p className="text-sm text-[var(--color-ink-soft)]">
        {bn
          ? 'পাসওয়ার্ড দিলে একটি সদস্য একাউন্ট তৈরি হবে — দিয়ে আপনি আবেদনের স্থিতি নিজে দেখতে পারবেন।'
          : 'Set a password to create a member account and track your application status from the account page.'}
      </p>
      <div className="mt-3 max-w-sm">
        <Field label={bn ? 'পাসওয়ার্ড' : 'Password (min 6 chars)'}>
          <input name="password" type="password" minLength={6} className={inputClass()} />
        </Field>
      </div>

      {/* Consent */}
      <label className="mt-6 flex items-start gap-3 rounded-xl border border-black/5 bg-[var(--color-mist)] p-4">
        <input name="consent" type="checkbox" required className="mt-0.5 h-5 w-5 accent-[var(--color-primary)]" />
        <span className="text-sm text-[var(--color-ink-soft)]">
          {bn
            ? 'আমি এই মর্মে অঙ্গীকার করছি যে, উপরের বর্ণিত সকল তথ্য সত্য ও শুদ্ধ। আমি সংগঠনের আইন-কানুন ও নীতিমালা মেনে চলব।'
            : 'I declare that the information I provided is true and accurate, and I agree to abide by the rules and regulations of the organisation.'}{' '}
          <span className="font-semibold text-[var(--color-crimson)]">*</span>
        </span>
      </label>

      <button
        type="submit"
        disabled={state === 'loading' || categories.length === 0}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--color-primary-dark)] disabled:opacity-70 sm:w-auto"
      >
        {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null}
        {state === 'loading' ? (bn ? 'জমা হচ্ছে…' : 'Submitting…') : bn ? 'আবেদন জমা দিন' : 'Submit application'}
      </button>

      {message ? (
        <p className={cn('mt-4 flex items-center gap-2 text-sm', state === 'done' ? 'text-[var(--color-primary-dark)]' : 'text-[var(--color-crimson)]')}>
          {state === 'done' ? <CheckCircle2 size={16} /> : null}
          {message}
        </p>
      ) : null}
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 border-l-4 border-[var(--color-primary)] pl-3 text-base font-bold text-[var(--color-ink)] first:mt-0">
      {children}
    </h3>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-[var(--color-ink-soft)]">{label}
      {children}
    </label>
  );
}