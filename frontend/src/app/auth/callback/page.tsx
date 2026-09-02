'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldX, MailWarning, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

type ErrorCopy = {
  title: string;
  description: string;
  Icon: typeof AlertCircle;
};

const ERROR_COPY: Record<string, ErrorCopy> = {
  oauth_cancelled: {
    title: 'Sign-in cancelled',
    description:
      'You closed the authorization window before finishing. No worries — you can try again whenever you\u2019re ready.',
    Icon: ShieldX,
  },
  email_required: {
    title: 'Email permission needed',
    description:
      'We couldn\u2019t read your email address from your social account. Make sure it has a verified email, then try again.',
    Icon: MailWarning,
  },
};

const DEFAULT_ERROR: ErrorCopy = {
  title: 'Sign-in failed',
  description: 'Something went wrong while completing sign-in. Please try again in a moment.',
  Icon: AlertCircle,
};

function AuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const [message, setMessage] = useState('Completing sign in...');
  const [error, setError] = useState<ErrorCopy | null>(null);

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const errorReason = params.get('error');

    if (errorReason) {
      setError(ERROR_COPY[errorReason] ?? DEFAULT_ERROR);
      return;
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
        setError({
          ...DEFAULT_ERROR,
          description: err?.message
            ? `${DEFAULT_ERROR.description} (${err.message})`
            : DEFAULT_ERROR.description,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, router, setTokens, setUser]);

  if (error) {
    const { title, description, Icon } = error;
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-deep p-8 rounded-2xl text-center">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Icon className="h-7 w-7 text-accent" />
          </span>
          <h1 className="text-lg font-semibold text-on-surface">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{description}</p>
          <Button size="lg" className="mt-6 w-full" onClick={() => router.replace('/auth/login')}>
            Back to sign in
          </Button>
          <p className="mt-3 text-xs text-on-surface-variant">
            You can also close this page — nothing was shared with FlyNGo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-accent" />
        <p className="text-on-surface-variant text-sm">{message}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-accent" />
            <p className="text-on-surface-variant text-sm">Completing sign in...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
