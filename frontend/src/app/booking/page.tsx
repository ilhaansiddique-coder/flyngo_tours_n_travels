'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Section } from '@/components/ui/section';
import { formatCurrency } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { useApi } from '@/hooks/use-api';
import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

const steps = [
  { number: 1, label: 'Details' },
  { number: 2, label: 'Review' },
  { number: 3, label: 'Payment' },
];

export default function BookingPage() {
  const { currentStep, setStep, selectedItem, totalAmount, reset, setFormData, formData } = useBookingStore();
  const { createBooking } = useApi();
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const updateForm = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await createBooking({
        type: 'tour',
        itemId: selectedItem || 'demo',
        startDate: new Date(formData.startDate || new Date()).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        guests: Number(formData.guests) || 1,
        notes: formData.notes,
      }) as any;
      setBookingCode(result.bookingCode || 'FLY-XXXX-XXXX');
      setBookingSuccess(true);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const item = (selectedItem as any) || {};
  const displayName = item?.title || item?.name || 'Your Booking';

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center pt-20">
        <div className="max-w-md w-full px-4">
          <div className="glass text-center p-12 rounded-2xl border-white/10">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-white/60 mb-4">Your booking has been submitted successfully.</p>
            <p className="font-mono text-lg font-bold text-[#00eefc] mb-8">{bookingCode}</p>
            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button variant="ghost" size="lg" className="w-full">Back to Home</Button>
              </Link>
              <Button size="lg" className="flex-1 bg-white text-surface hover:bg-[#00eefc] font-bold" onClick={() => { setBookingSuccess(false); reset(); }}>
                New Booking
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 mb-12">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  currentStep >= step.number ? 'bg-[#00eefc] text-surface' : 'bg-white/10 text-white/40'
                }`}>
                  {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <span className={`text-sm font-medium ${currentStep >= step.number ? 'text-white' : 'text-white/40'}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 ${currentStep > step.number ? 'bg-[#00eefc]' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass p-8 rounded-2xl border-white/10">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-white">Booking Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName || ''}
                  onChange={(e) => updateForm('firstName', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.lastName || ''}
                  onChange={(e) => updateForm('lastName', e.target.value)}
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
              <Input
                label="Phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => updateForm('phone', e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => updateForm('startDate', e.target.value)}
                  className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => updateForm('endDate', e.target.value)}
                  className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                />
              </div>
              <Input
                label="Number of Guests"
                type="number"
                value={formData.guests || ''}
                onChange={(e) => updateForm('guests', e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                min={1}
              />
              <Input
                label="Special Requests"
                value={formData.notes || ''}
                onChange={(e) => updateForm('notes', e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Any special requirements?"
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-white">Review Your Booking</h2>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-white/10 text-white/60">
                  <span>Service</span>
                  <span className="font-medium text-white">{displayName}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10 text-white/60">
                  <span>Guest Name</span>
                  <span className="font-medium text-white">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10 text-white/60">
                  <span>Email</span>
                  <span className="font-medium text-white">{formData.email}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10 text-white/60">
                  <span>Phone</span>
                  <span className="font-medium text-white">{formData.phone || '—'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10 text-white/60">
                  <span>Dates</span>
                  <span className="font-medium text-white">
                    {formData.startDate || '—'} {formData.endDate ? ` — ${formData.endDate}` : ''}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10 text-white/60">
                  <span>Guests</span>
                  <span className="font-medium text-white">{formData.guests || 1}</span>
                </div>
                {formData.notes && (
                  <div className="flex justify-between py-3 border-b border-white/10 text-white/60">
                    <span>Notes</span>
                    <span className="font-medium text-white">{formData.notes}</span>
                  </div>
                )}
                <div className="flex justify-between py-3">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-lg font-bold text-[#00eefc]">{formatCurrency(totalAmount || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-white">Confirm & Pay</h2>
              <p className="text-white/60">Review your details and submit your booking.</p>
              <div className="glass-deep p-6 rounded-xl">
                <div className="flex justify-between text-sm text-white/50 mb-2">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-white/50 mb-2">
                  <span>Processing Fee</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span className="text-[#00eefc]">{formatCurrency(totalAmount || 0)}</span>
                </div>
              </div>
              <p className="text-xs text-white/40 text-center">
                By submitting, you agree to our Terms of Service. Payment will be processed separately after confirmation.
              </p>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => currentStep === 1 ? window.history.back() : setStep(currentStep - 1)}
              className="text-white/60 hover:text-white"
            >
              {currentStep === 1 ? 'Back' : 'Previous'}
            </Button>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={reset}
                className="text-white/40 hover:text-white"
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
                  `Confirm Booking`
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
