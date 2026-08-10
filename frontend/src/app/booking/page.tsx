'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DestinationAutocomplete } from '@/components/ui/destination-autocomplete';
import { formatCurrency } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { useApi } from '@/hooks/use-api';
import { useState } from 'react';
import { Check, Loader2, Sparkles, MapPin, Wallet, Users as UsersIcon, Heart, ArrowRight, ArrowLeft, AlertCircle, Compass, Building2, Plane, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/contexts/locale-context';

const STANDARD_STEPS = [
  { number: 1, key: 'booking_step_details' },
  { number: 2, key: 'booking_step_trip' },
  { number: 3, key: 'booking_step_review' },
  { number: 4, key: 'booking_step_confirm' },
];

const VISA_STEPS = [
  { number: 1, key: 'booking_step_applicant' },
  { number: 2, key: 'booking_step_travel' },
  { number: 3, key: 'booking_step_documents' },
  { number: 4, key: 'booking_step_confirm' },
];

const CUSTOM_STEPS = [
  { number: 1, key: 'custom_step_destination', icon: MapPin },
  { number: 2, key: 'custom_step_dates', icon: Heart },
  { number: 3, key: 'custom_step_travelers', icon: UsersIcon },
  { number: 4, key: 'custom_step_preferences', icon: Sparkles },
  { number: 5, key: 'custom_step_contact', icon: Wallet },
];

type BookingType = 'tour' | 'hotel' | 'flight' | 'visa' | 'custom';

const TYPE_META: Record<BookingType, { icon: typeof Compass; accent: string }> = {
  tour: { icon: Compass, accent: 'primary' },
  hotel: { icon: Building2, accent: 'primary' },
  flight: { icon: Plane, accent: 'primary' },
  visa: { icon: Briefcase, accent: 'primary' },
  custom: { icon: Sparkles, accent: 'primary' },
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
              <span>{item.destination.name}{item.destination?.country ? `, ${item.destination.country}` : ''}</span>
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
                className={`text-[10px] sm:text-xs font-semibold whitespace-nowrap text-center max-w-[80px] ${
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
  const { createBooking } = useApi();
  const { t, locale } = useLocale();
  const isBn = locale === 'bn';
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<BookingType>('tour');

  const updateForm = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
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
        reqMissing('email', 'Email');
        if (formData.email && !validateEmail(formData.email)) errors.email = 'Enter a valid email';
        if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Enter a valid phone';
      }
    } else if (bookingType === 'visa') {
      if (currentStep === 1) {
        reqMissing('firstName', 'First name');
        reqMissing('lastName', 'Last name');
        reqMissing('dob', 'Date of birth');
        reqMissing('placeOfBirth', 'Place of birth');
        reqMissing('email', 'Email');
        reqMissing('phone', 'Phone');
        if (formData.email && !validateEmail(formData.email)) errors.email = 'Enter a valid email';
        if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Enter a valid phone';
      } else if (currentStep === 2) {
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
        reqMissing('email', 'Email');
        reqMissing('phone', 'Phone');
        if (formData.email && !validateEmail(formData.email)) errors.email = 'Enter a valid email';
        if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Enter a valid phone';
      } else if (currentStep === 2) {
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
    setError(null);
    if (bookingType === 'custom') {
      if (currentStep < 5) setStep(currentStep + 1);
      else handleSubmit();
    } else {
      const max = bookingType === 'visa' ? 4 : 4;
      if (currentStep < max) setStep(currentStep + 1);
      else handleSubmit();
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = (await createBooking({
        type: bookingType,
        itemId: selectedItem || (bookingType === 'custom' ? 'custom-quote' : 'demo'),
        startDate: new Date(formData.startDate || new Date()).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        guests: Number(formData.guests) || 1,
        notes: formData.notes,
        meta: bookingType === 'custom'
          ? {
              destination: formData.destination,
              travelStyle: formData.travelStyle,
              accommodation: formData.accommodation,
              meals: formData.meals,
              budget: formData.budget,
            }
          : undefined,
      })) as any;
      setBookingCode(
        result?.bookingCode ||
          (bookingType === 'custom' ? 'QUOTE-PENDING' : 'FLY-XXXX-XXXX')
      );
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
              {bookingType === 'custom'
                ? t('booking_success_title_quote')
                : t('booking_success_title')}
            </h2>
            <p className="text-muted mb-2">
              {bookingType === 'custom'
                ? t('booking_success_help_quote')
                : t('booking_success_help')}
            </p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted mt-4">{t('booking_booking_code')}</p>
            <p className="font-mono text-lg font-bold text-on-surface mb-8">{bookingCode}</p>
            <div className="flex gap-3">
              <Link href="/" className="flex-1">
                <Button variant="ghost" size="lg" className="w-full">
                  {t('booking_back_home')}
                </Button>
              </Link>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => {
                  setBookingSuccess(false);
                  reset();
                }}
              >
                {t('booking_new')}
              </Button>
            </div>
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
                  <Input
                    label={isBn ? 'ফোন' : 'Phone'}
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    required
                    error={fieldErrors.phone}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateForm('email', e.target.value)}
                  required
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
  const maxStep = bookingType === 'visa' ? 4 : 4;
  const steps = bookingType === 'visa' ? VISA_STEPS : STANDARD_STEPS;
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label={isBn ? 'জন্ম তারিখ' : 'Date of birth'} type="date" value={formData.dob || ''} onChange={(e) => updateForm('dob', e.target.value)} required error={fieldErrors.dob} />
                    <Input label={isBn ? 'জন্মস্থান' : 'Place of birth'} value={formData.placeOfBirth || ''} onChange={(e) => updateForm('placeOfBirth', e.target.value)} required error={fieldErrors.placeOfBirth} />
                  </div>
                  <Input label={t('booking_email')} type="email" value={formData.email || ''} onChange={(e) => updateForm('email', e.target.value)} required error={fieldErrors.email} />
                  <Input label={t('booking_phone')} type="tel" value={formData.phone || ''} onChange={(e) => updateForm('phone', e.target.value)} required error={fieldErrors.phone} />
                </div>
              )}

              {currentStep === 2 && bookingType === 'visa' && (
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
                  <Input label={isBn ? 'থাকার ঠিকানা' : 'Accommodation address'} value={formData.accommodation || ''} onChange={(e) => updateForm('accommodation', e.target.value)} placeholder="Hotel name and city" />
                </div>
              )}

              {currentStep === 3 && bookingType === 'visa' && (
                <div className="space-y-5">
                  <SectionHeading title={t('booking_step_documents')} help={t('booking_visa_docs_help')} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'doc_passport', label: 'Valid passport (min 6 months validity)' },
                      { key: 'doc_photos', label: '2 passport-size photos (white background)' },
                      { key: 'doc_bank', label: 'Bank statement (last 6 months)' },
                      { key: 'doc_nid', label: 'National ID / birth certificate' },
                      { key: 'doc_ticket', label: 'Confirmed return ticket' },
                      { key: 'doc_hotel', label: 'Hotel booking or invitation letter' },
                      { key: 'doc_cover', label: 'Cover letter (we can draft this for you)' },
                      { key: 'doc_employment', label: 'Employment / student letter' },
                    ].map((d) => (
                      <label key={d.key} className="flex items-start gap-3 rounded-xl border border-soft p-3 cursor-pointer hover:border-medium transition-colors bg-surface-container/60">
                        <input
                          type="checkbox"
                          checked={!!formData[d.key]}
                          onChange={(e) => updateForm(d.key, e.target.checked ? 'yes' : '')}
                          className="mt-0.5"
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        <span className="text-sm text-on-surface">{d.label}</span>
                      </label>
                    ))}
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
                  <Input label={t('booking_email')} type="email" value={formData.email || ''} onChange={(e) => updateForm('email', e.target.value)} required error={fieldErrors.email} />
                  <Input label={t('booking_phone')} type="tel" value={formData.phone || ''} onChange={(e) => updateForm('phone', e.target.value)} required error={fieldErrors.phone} />
                </div>
              )}

              {currentStep === 2 && bookingType !== 'visa' && (
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

              {/* REVIEW (standard step 3 / visa step 4) */}
              {((currentStep === 3 && bookingType !== 'visa') || (currentStep === 4 && bookingType === 'visa')) && (
                <div className="space-y-5">
                  <SectionHeading title={t('booking_review_title')} help={t('booking_review_help')} />
                  {bookingType === 'visa' ? (
                    <div className="space-y-3">
                      <ReviewRow label={isBn ? 'আবেদনকারী' : 'Applicant'} value={`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || '—'} />
                      <ReviewRow label={t('booking_email')} value={formData.email || '—'} />
                      <ReviewRow label={isBn ? 'গন্তব্য' : 'Destination'} value={formData.destination || '—'} />
                      <ReviewRow label={isBn ? 'ভিসার ধরন' : 'Visa type'} value={<span className="capitalize">{formData.visaType || '—'}</span>} />
                      <ReviewRow label={t('booking_dates')} value={`${formData.arrivalDate || '—'} → ${formData.departureDate || '—'}`} />
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
                      <ReviewRow label={t('booking_destination')} value={formData.destination || '—'} />
                      <ReviewRow label={isBn ? 'অতিথির নাম' : 'Guest name'} value={`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || '—'} />
                      <ReviewRow label={t('booking_email')} value={formData.email || '—'} />
                      <ReviewRow label={t('booking_phone')} value={formData.phone || '—'} />
                      <ReviewRow label={t('booking_dates')} value={`${formData.startDate || '—'}${formData.endDate ? ` — ${formData.endDate}` : ''}`} />
                      <ReviewRow label={t('booking_guests')} value={String(formData.guests || 1)} />
                      {formData.notes && <ReviewRow label={t('booking_notes')} value={formData.notes} />}
                    </div>
                  )}
                </div>
              )}

              {/* CONFIRM (standard step 4) */}
              {currentStep === 4 && bookingType !== 'visa' && (
                <div className="space-y-5">
                  <SectionHeading title={t('booking_step_confirm')} help={t('booking_confirm_help')} />
                  <p className="text-xs text-muted text-center">{t('booking_terms')}</p>
                </div>
              )}

              {/* CONFIRM (visa step 4) */}
              {currentStep === 4 && bookingType === 'visa' && (
                <div className="space-y-5">
                  <SectionHeading title={t('booking_step_confirm')} help={t('booking_confirm_help')} />
                  <p className="text-xs text-muted text-center">{t('booking_terms')}</p>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8 pt-6 border-t border-soft">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (currentStep === 1) setBookingType('tour');
                    else setStep(currentStep - 1);
                    setFieldErrors({});
                    setError(null);
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {currentStep === 1 ? t('booking_back_to_types') : t('booking_previous')}
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={reset}>{t('booking_cancel')}</Button>
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
