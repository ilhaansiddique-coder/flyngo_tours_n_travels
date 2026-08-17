'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (error) {
      setMessage(`Sign in failed: ${error.replaceAll('_', ' ')}`);
      const t = setTimeout(() => router.replace('/auth/login'), 2000);
      return () => clearTimeout(t);
    }

    if (!accessToken || !refreshToken) {
      setMessage('Missing authentication tokens. Redirecting...');
      const t = setTimeout(() => router.replace('/auth/login'), 2000);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    (async () => {
      try {
        setTokens(accessToken, refreshToken);
        const profile = await api.get<{
          id: string;
          email: string | null;
          fullName: string;
          role: { code: string; permissions: Array<{ permission: { code: string } }> };
        }>('/users/me', { token: accessToken });
        if (cancelled) return;
        setUser({
          id: profile.id,
          email: profile.email ?? '',
          fullName: profile.fullName,
          role: profile.role.code,
          permissions: profile.role.permissions.map((p) => p.permission.code),
        });
        router.replace('/');
      } catch (err: any) {
        if (cancelled) return;
        setMessage(`Sign in failed: ${err?.message || 'unknown error'}`);
        const t = setTimeout(() => router.replace('/auth/login'), 2000);
        return () => clearTimeout(t);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, router, setTokens, setUser]);

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-accent" />
        <p className="text-on-surface-variant text-sm">{message}</p>
      </div>
    </div>
  );
}
