'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';
import { Mail, Phone, Lock, LogIn, FileCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import logoImg from '@/images/flyngo_transparent.png';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(identifier, password);
  };

  return (
    <div className="relative min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(24,129,255,0.18), transparent 70%), radial-gradient(ellipse 50% 45% at 75% 70%, rgba(243,101,35,0.14), transparent 70%)',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Image src={logoImg} alt="Fly&Go" width={140} height={56} className="rounded-xl object-cover" />
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-[10px] tracking-widest uppercase font-bold text-[#00eefc] border border-[#00eefc]/30 bg-[#00eefc]/5">
            <FileCheck className="w-3 h-3" />
            Velocity Club
          </span>
          <h1 className="font-display text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-white/60">Sign in with your email or phone</p>
        </div>

        <div className="glass-deep p-8 rounded-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              {identifier.includes('@') ? (
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00eefc] z-10" />
              ) : (
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00eefc] z-10" />
              )}
              <Input
                type="text"
                inputMode="email"
                placeholder="Email or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="pl-10"
                required
                autoComplete="username"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00eefc] z-10" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                <input type="checkbox" className="rounded border-white/20 bg-white/5 text-[#00eefc] focus:ring-[#00eefc]" />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="text-[#00eefc] hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-[#020617] text-white/50">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-white/80 hover:bg-white/10 hover:border-white/30 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-white/80 hover:bg-white/10 hover:border-white/30 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Facebook
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-white/60">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-[#00eefc] font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
