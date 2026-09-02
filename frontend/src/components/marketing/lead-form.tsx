'use client';

import { useState } from 'react';
import { Phone, Mail, User, Loader2, CheckCircle2, MapPin, Users, Wallet } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import { DEFAULT_COUNTRY_CODE, findDialByCode } from '@/lib/country-dial-codes';
import { submitLead, trackEvent } from '@/lib/tracking-client';

export interface LeadFormProps {
  formSlug: string;
  packageSlug?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  compact?: boolean;
  showTravelers?: boolean;
  showDepartureCity?: boolean;
  showBudget?: boolean;
}

export function LeadForm({
  formSlug,
  packageSlug,
  title,
  subtitle,
  cta = 'Get a callback',
  compact = false,
  showTravelers = true,
  showDepartureCity = true,
  showBudget = true,
}: LeadFormProps) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    travelers: 1,
    departureCity: '',
    budget: '',
    message: '',
  });
  const [phoneCountry, setPhoneCountry] = useState<string>(DEFAULT_COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const dialCode = findDialByCode(phoneCountry)?.dial ?? '';
      await submitLead({
        fullName: form.fullName,
        phone: dialCode + phoneNumber,
        email: form.email || undefined,
        message: form.message || undefined,
        formSlug,
        packageSlug,
        travelers: form.travelers,
        departureCity: form.departureCity || undefined,
        budget: form.budget || undefined,
      });
      await trackEvent('submit_application', {
        contentName: formSlug,
        value: 0,
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className={`p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center ${compact ? 'p-4' : ''}`}>
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
        <h3 className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">Thanks! We&apos;ll be in touch shortly.</h3>
        <p className="text-sm text-on-surface-variant">
          A Hajj/Umrah specialist will call you within the next 2 hours.
        </p>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none";

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${compact ? 'text-sm' : ''}`}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="font-display font-bold text-lg mb-1">{title}</h3>}
          {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
        </div>
      )}

      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
        <input
          required
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className={inputCls + ' pl-9'}
        />
      </div>

      <PhoneInput
        countryCode={phoneCountry}
        number={phoneNumber}
        onCountryCodeChange={setPhoneCountry}
        onNumberChange={setPhoneNumber}
        required
        placeholder="Phone number"
        name="phone"
      />

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
        <input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputCls + ' pl-9'}
        />
      </div>

      {!compact && (
        <>
          {showTravelers && (
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              <input
                type="number"
                min={1}
                max={20}
                placeholder="Travelers"
                value={form.travelers}
                onChange={(e) => setForm({ ...form, travelers: Number(e.target.value) || 1 })}
                className={inputCls + ' pl-9'}
              />
            </div>
          )}
          {showDepartureCity && (
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              <input
                placeholder="Departure city (e.g. Dhaka, Chittagong)"
                value={form.departureCity}
                onChange={(e) => setForm({ ...form, departureCity: e.target.value })}
                className={inputCls + ' pl-9'}
              />
            </div>
          )}
          {showBudget && (
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              <input
                placeholder="Budget (optional, e.g. ৳3,50,000)"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className={inputCls + ' pl-9'}
              />
            </div>
          )}
        </>
      )}

      <textarea
        placeholder="Anything else we should know? (optional)"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        rows={compact ? 1 : 2}
        className={inputCls}
      />

      {error && (
        <p className="text-xs text-rose-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-accent text-on-accent font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
        {submitting ? 'Submitting…' : cta}
      </button>
      <p className="text-[10px] text-center text-on-surface-variant">
        By submitting, you agree to our <a href="/privacy" className="underline">privacy policy</a>. We&apos;ll never spam.
      </p>
    </form>
  );
}
