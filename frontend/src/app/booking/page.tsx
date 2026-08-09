'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { useApi } from '@/hooks/use-api';
import { useState } from 'react';
import { Check, Loader2, Sparkles, MapPin, Wallet, Users as UsersIcon, Heart } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/contexts/locale-context';

const STANDARD_STEPS = [
  { number: 1, label: 'Details' },
  { number: 2, label: 'Review' },
  { number: 3, label: 'Payment' },
];

const CUSTOM_STEPS = [
  { number: 1, key: 'custom_step_destination', icon: MapPin },
  { number: 2, key: 'custom_step_dates', icon: Heart },
  { number: 3, key: 'custom_step_travelers', icon: UsersIcon },
  { number: 4, key: 'custom_step_preferences', icon: Sparkles },
  { number: 5, key: 'custom_step_contact', icon: Wallet },
];

type BookingType = 'tour' | 'hotel' | 'flight' | 'visa' | 'custom';

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
  };

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
      setStep(bookingType === 'custom' ? 6 : 4);
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
      <div className="min-h-screen bg-surface flex items-center justify-center pt-20">
        <div className="max-w-md w-full px-4">
          <div className="glass text-center p-12 rounded-2xl border-outline-variant">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-on-surface mb-2">
              {bookingType === 'custom'
                ? isBn
                  ? 'অনুরোধ পাঠানো হয়েছে!'
                  : 'Request Submitted!'
                : isBn
                ? 'বুকিং নিশ্চিত!'
                : 'Booking Confirmed!'}
            </h2>
            <p className="text-on-surface-variant mb-4">
              {bookingType === 'custom'
                ? isBn
                  ? 'আমাদের টিম ২৪ ঘন্টার মধ্যে আপনার সাথে যোগাযোগ করবে।'
                  : 'Our team will contact you within 24 hours with a tailored quote.'
                : isBn
                ? 'আপনার বুকিং সফলভাবে জমা হয়েছে।'
                : 'Your booking has been submitted successfully.'}
            </p>
            <p className="font-mono text-lg font-bold text-[#00eefc] mb-8">{bookingCode}</p>
            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button variant="ghost" size="lg" className="w-full">
                  {isBn ? 'হোমে ফিরুন' : 'Back to Home'}
                </Button>
              </Link>
              <Button
                size="lg"
                className="flex-1 bg-white text-surface hover:bg-[#00eefc] font-bold"
                onClick={() => {
                  setBookingSuccess(false);
                  reset();
                }}
              >
                {isBn ? 'নতুন বুকিং' : 'New Booking'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------- CUSTOM PACKAGE multi-step flow --------
  if (bookingType === 'custom') {
    return (
      <div className="min-h-screen bg-[#020617] pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full text-[10px] tracking-widest uppercase font-bold text-rose-300 border border-rose-400/30 bg-rose-500/5">
              <Sparkles className="w-3 h-3" />
              {t('booking_type_custom')}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              {isBn ? 'আপনার স্বপ্নের যাত্রা তৈরি করুন' : 'Design Your Dream Journey'}
            </h1>
            <p className="text-white/60 mt-2">
              {isBn ? '৫টি সহজ ধাপে আপনার নিখুঁত প্যাকেজ।' : '5 quick steps. We handle the rest.'}
            </p>
          </div>

          <div className="flex items-center justify-between mb-10 gap-1">
            {CUSTOM_STEPS.map((step, i) => {
              const Icon = step.icon;
              const active = currentStep >= step.number;
              return (
                <div key={step.number} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        active ? 'bg-rose-500 text-white' : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {currentStep > step.number ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                        active ? 'text-white' : 'text-white/40'
                      }`}
                    >
                      {t(step.key as any)}
                    </span>
                  </div>
                  {i < CUSTOM_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 ${
                        currentStep > step.number ? 'bg-rose-500' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="glass p-6 sm:p-8 rounded-2xl border-white/10">
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-white mb-4">
                  {t('custom_step_destination')}
                </h2>
                <Input
                  label={isBn ? 'গন্তব্য দেশ/শহর' : 'Destination country / city'}
                  value={formData.destination || ''}
                  onChange={(e) => updateForm('destination', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={isBn ? 'যেমন: তুরস্ক, বালি, মালদ্বীপ' : 'e.g. Turkey, Bali, Maldives'}
                  required
                />
                <Input
                  label={isBn ? 'একাধিক গন্তব্য (ঐচ্ছিক)' : 'Multiple stops (optional)'}
                  value={formData.stops || ''}
                  onChange={(e) => updateForm('stops', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={isBn ? 'দুবাই → আবুধাবি' : 'Dubai → Abu Dhabi'}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-white mb-4">
                  {t('custom_step_dates')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={isBn ? 'শুরুর তারিখ' : 'Start date'}
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => updateForm('startDate', e.target.value)}
                    className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                    required
                  />
                  <Input
                    label={isBn ? 'শেষ তারিখ (আনুমানিক)' : 'End date (approx)'}
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => updateForm('endDate', e.target.value)}
                    className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                  />
                </div>
                <Input
                  label={isBn ? 'ভ্রমণের নমনীয়তা' : 'Flexibility'}
                  value={formData.flexibility || ''}
                  onChange={(e) => updateForm('flexibility', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={isBn ? 'যেমন: ±৩ দিন নমনীয়' : 'e.g. ±3 days flexible'}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-white mb-4">
                  {t('custom_step_travelers')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('custom_travelers')}
                    type="number"
                    min={1}
                    value={formData.guests || ''}
                    onChange={(e) => updateForm('guests', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                  <Input
                    label={t('custom_budget')}
                    type="number"
                    min={0}
                    value={formData.budget || ''}
                    onChange={(e) => updateForm('budget', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
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
                              ? 'bg-rose-500/20 border-rose-400 text-white'
                              : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                          }`}
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
                <h2 className="font-display text-xl font-bold text-white mb-4">
                  {t('custom_step_preferences')}
                </h2>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
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
                            ? 'bg-rose-500/20 border-rose-400 text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                        }`}
                      >
                        {t(`custom_accommodation_${a}` as any)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
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
                            ? 'bg-rose-500/20 border-rose-400 text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                        }`}
                      >
                        {t(`custom_meals_${m}` as any)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                    {t('custom_requests')}
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateForm('notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 outline-none focus:border-rose-400/60"
                    placeholder={t('custom_requests_ph')}
                  />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-white mb-4">
                  {t('custom_step_contact')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={isBn ? 'পুরো নাম' : 'Full name'}
                    value={formData.firstName || ''}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                  <Input
                    label={isBn ? 'ফোন' : 'Phone'}
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={() => (currentStep === 1 ? setBookingType('tour') : setStep(currentStep - 1))}
                className="text-white/60 hover:text-white"
              >
                {currentStep === 1
                  ? isBn
                    ? 'বুকিং ধরন'
                    : 'Booking type'
                  : isBn
                  ? 'পূর্ববর্তী'
                  : 'Previous'}
              </Button>
              <Button
                size="lg"
                className="bg-rose-500 hover:bg-rose-400 text-white font-bold"
                disabled={submitting}
                onClick={() => {
                  if (currentStep < 5) setStep(currentStep + 1);
                  else handleSubmit();
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isBn ? 'পাঠানো হচ্ছে...' : 'Sending...'}
                  </>
                ) : currentStep === 5 ? (
                  isBn ? 'অনুরোধ পাঠান' : 'Submit Request'
                ) : isBn ? (
                  'পরবর্তী'
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------- STANDARD booking flow with type selector --------
  return (
    <div className="min-h-screen bg-surface pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
            {t('booking_type_label')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['tour', 'hotel', 'flight', 'visa', 'custom'] as BookingType[]).map((type) => (
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
                }}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition ${
                  bookingType === type
                    ? 'bg-[#00eefc]/20 border-[#00eefc] text-on-surface'
                    : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-[#00eefc]/50'
                }`}
              >
                {t(`booking_type_${type}` as any)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-12">
          {STANDARD_STEPS.map((step, i) => (
            <div key={step.number} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    currentStep >= step.number
                      ? 'bg-[#00eefc] text-surface'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-on-surface' : 'text-on-surface-variant'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STANDARD_STEPS.length - 1 && (
                <div
                  className={`w-12 h-0.5 ${
                    currentStep > step.number ? 'bg-[#00eefc]' : 'bg-surface-container'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="glass p-8 rounded-2xl border-outline-variant">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-on-surface">Booking Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName || ''}
                  onChange={(e) => updateForm('firstName', e.target.value)}
                  className="bg-surface-container border-outline-variant text-on-surface"
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.lastName || ''}
                  onChange={(e) => updateForm('lastName', e.target.value)}
                  className="bg-surface-container border-outline-variant text-on-surface"
                  required
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateForm('email', e.target.value)}
                className="bg-surface-container border-outline-variant text-on-surface"
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => updateForm('phone', e.target.value)}
                className="bg-surface-container border-outline-variant text-on-surface"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => updateForm('startDate', e.target.value)}
                  className="bg-surface-container border-outline-variant text-on-surface [color-scheme:dark]"
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => updateForm('endDate', e.target.value)}
                  className="bg-surface-container border-outline-variant text-on-surface [color-scheme:dark]"
                />
              </div>
              <Input
                label="Number of Guests"
                type="number"
                value={formData.guests || ''}
                onChange={(e) => updateForm('guests', e.target.value)}
                className="bg-surface-container border-outline-variant text-on-surface"
                min={1}
              />
              <Input
                label="Special Requests"
                value={formData.notes || ''}
                onChange={(e) => updateForm('notes', e.target.value)}
                className="bg-surface-container border-outline-variant text-on-surface"
                placeholder="Any special requirements?"
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-on-surface">Review Your Booking</h2>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-outline-variant text-on-surface-variant">
                  <span>Service</span>
                  <span className="font-medium text-on-surface">{displayName}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-outline-variant text-on-surface-variant">
                  <span>Type</span>
                  <span className="font-medium text-on-surface">
                    {t(`booking_type_${bookingType}` as any)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-outline-variant text-on-surface-variant">
                  <span>Guest Name</span>
                  <span className="font-medium text-on-surface">
                    {formData.firstName} {formData.lastName}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-outline-variant text-on-surface-variant">
                  <span>Email</span>
                  <span className="font-medium text-on-surface">{formData.email}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-outline-variant text-on-surface-variant">
                  <span>Phone</span>
                  <span className="font-medium text-on-surface">{formData.phone || '—'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-outline-variant text-on-surface-variant">
                  <span>Dates</span>
                  <span className="font-medium text-on-surface">
                    {formData.startDate || '—'} {formData.endDate ? ` — ${formData.endDate}` : ''}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-outline-variant text-on-surface-variant">
                  <span>Guests</span>
                  <span className="font-medium text-on-surface">{formData.guests || 1}</span>
                </div>
                {formData.notes && (
                  <div className="flex justify-between py-3 border-b border-outline-variant text-on-surface-variant">
                    <span>Notes</span>
                    <span className="font-medium text-on-surface">{formData.notes}</span>
                  </div>
                )}
                <div className="flex justify-between py-3">
                  <span className="text-lg font-bold text-on-surface">Total</span>
                  <span className="text-lg font-bold text-[#00eefc]">
                    {formatCurrency(totalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-on-surface">Confirm & Pay</h2>
              <p className="text-on-surface-variant">Review your details and submit your booking.</p>
              <div className="glass-deep p-6 rounded-xl">
                <div className="flex justify-between text-sm text-on-surface-variant mb-2">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-on-surface-variant mb-2">
                  <span>Processing Fee</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-outline-variant">
                  <span className="text-on-surface">Total</span>
                  <span className="text-[#00eefc]">{formatCurrency(totalAmount || 0)}</span>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant text-center">
                By submitting, you agree to our Terms of Service. Payment will be processed separately
                after confirmation.
              </p>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-outline-variant">
            <Button
              variant="ghost"
              onClick={() => (currentStep === 1 ? window.history.back() : setStep(currentStep - 1))}
              className="text-on-surface-variant hover:text-on-surface"
            >
              {currentStep === 1 ? 'Back' : 'Previous'}
            </Button>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={reset}
                className="text-on-surface-variant hover:text-on-surface"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                className="bg-white text-surface hover:bg-[#00eefc] font-bold"
                disabled={submitting}
                onClick={() => {
                  if (currentStep < 3) setStep(currentStep + 1);
                  else handleSubmit();
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentStep === 3 ? (
                  'Confirm Booking'
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
