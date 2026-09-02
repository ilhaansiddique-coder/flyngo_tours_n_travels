'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import Link from 'next/link';
import { useState } from 'react';
import { Lock, User, FileCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getOAuthUrl, FACEBOOK_LOGIN_ENABLED } from '@/lib/oauth';
import Image from 'next/image';
import logoImg from '@/images/flyngo_transparent.png';
import {
  DEFAULT_COUNTRY_CODE,
  findDialByCode,
} from '@/lib/country-dial-codes';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<string>(DEFAULT_COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dial = findDialByCode(phoneCountry)?.dial ?? '';
    const combined = phoneNumber.trim() ? `${dial} ${phoneNumber.trim()}` : '';
    await register(name, '', combined, password);
  };

  const startOAuth = (provider: 'google' | 'facebook') => {
    window.location.href = getOAuthUrl(provider);
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 45% at 70% 30%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 70%), radial-gradient(ellipse 50% 45% at 25% 70%, color-mix(in oklab, var(--color-tertiary) 14%, transparent), transparent 70%)',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Image src={logoImg} alt="FlynGo" width={140} height={50} className="rounded-xl object-cover" style={{ width: '140px', height: 'auto' }} />
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-[10px] tracking-widest uppercase font-bold text-accent border border-accent/30 bg-accent/5">
            <FileCheck className="w-3 h-3" />
            Join the Club
          </span>
          <h1 className="font-display text-3xl font-bold text-on-surface">Create Your Account</h1>
          <p className="mt-2 text-on-surface-variant">Start exploring the world with FlynGo</p>
        </div>

        <div className="glass-deep p-8 rounded-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent z-10" />
              <Input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <PhoneInput
              label="Phone"
              countryCode={phoneCountry}
              number={phoneNumber}
              onCountryCodeChange={setPhoneCountry}
              onNumberChange={setPhoneNumber}
              required
              placeholder="e.g. 1712345678"
            />
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent z-10" />
              <Input
                type="password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-on-surface-variant">
              {/* `accent-*` sets the native accent-color; text/bg utilities are
                  inert on an unstyled checkbox without @tailwindcss/forms. */}
              <input type="checkbox" className="rounded accent-accent focus:ring-accent" required />
              I agree to the{' '}
              <Link href="/terms" className="text-accent hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
            </label>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Flex rules instead of a full-width line masked by an opaque label:
              the label sits on the translucent glass panel, so no solid colour
              could hide the line in both themes. */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-outline-variant" />
            <span className="text-sm text-on-surface-variant">Or sign up with</span>
            <div className="flex-1 border-t border-outline-variant" />
          </div>

          <div className={`grid gap-3 ${FACEBOOK_LOGIN_ENABLED ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <button
              type="button"
              onClick={() => startOAuth('google')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container/60 text-sm font-medium text-on-surface hover:bg-surface-container-high hover:border-outline transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Google
            </button>
            {FACEBOOK_LOGIN_ENABLED && (
            <button
              type="button"
              onClick={() => startOAuth('facebook')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container/60 text-sm font-medium text-on-surface hover:bg-surface-container-high hover:border-outline transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Facebook
            </button>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-accent font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
