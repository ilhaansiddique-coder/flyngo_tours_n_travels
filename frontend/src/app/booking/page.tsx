'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { useState } from 'react';
import { Check, CreditCard, User, MapPin, Calendar } from 'lucide-react';

const steps = [
  { number: 1, label: 'Details' },
  { number: 2, label: 'Review' },
  { number: 3, label: 'Payment' },
];

export default function BookingPage() {
  const { currentStep, setStep, reset } = useBookingStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= step.number ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <span className={`text-sm font-medium ${currentStep >= step.number ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 ${currentStep > step.number ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Booking Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="First Name" required />
                <Input label="Last Name" required />
              </div>
              <Input label="Email" type="email" required />
              <Input label="Phone" type="tel" required />
              <Input label="Special Requests" placeholder="Any special requirements?" />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Review Your Booking</h2>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Tour Package</span>
                  <span className="font-medium">Bali Paradise Explorer</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">7 Days / 6 Nights</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Guests</span>
                  <span className="font-medium">2 Adults</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Dates</span>
                  <span className="font-medium">Aug 1 — Aug 7, 2026</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-brand-600 dark:text-brand-400">{formatCurrency(2598)}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">Payment</h2>
              <p className="text-gray-500">Choose your preferred payment method</p>
              <div className="space-y-3">
                {['Credit/Debit Card', 'PayPal', 'bKash', 'Nagad'].map((method) => (
                  <label key={method} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-500 cursor-pointer transition-colors">
                    <input type="radio" name="payment" className="text-brand-600 focus:ring-brand-500" />
                    <span className="font-medium">{method}</span>
                  </label>
                ))}
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Subtotal</span>
                  <span>{formatCurrency(2598)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Discount</span>
                  <span className="text-green-600">-{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span className="text-brand-600 dark:text-brand-400">{formatCurrency(2598)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              onClick={() => currentStep === 1 ? window.history.back() : setStep(currentStep - 1)}
            >
              {currentStep === 1 ? 'Back' : 'Previous'}
            </Button>
            <Button
              size="lg"
              onClick={() => {
                if (currentStep < 3) setStep(currentStep + 1);
                else alert('Payment processing — demo mode');
              }}
            >
              {currentStep === 3 ? 'Pay ' + formatCurrency(2598) : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
