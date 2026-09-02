'use client';

import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  // Returned instead of a session when the account still holds a staff-issued
  // temporary password. changePasswordToken is scoped to /auth/change-password
  // and is rejected by every other guarded endpoint.
  mustChangePassword?: boolean;
  changePasswordToken?: string;
}

/**
 * Where to send someone after they authenticate.
 *
 * `?callbackUrl=` was being written by the booking page, the API 401 handler
 * and the admin guard — and read by nobody, so every redirected user landed on
 * the homepage having lost whatever they were doing. Only same-origin relative
 * paths are honoured, so this can't be used as an open redirect.
 */
function redirectTarget(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('callbackUrl');
  if (!raw) return null;
  const decoded = decodeURIComponent(raw);
  return decoded.startsWith('/') && !decoded.startsWith('//') ? decoded : null;
}

interface PrismaUser {
  id: string;
  email: string | null;
  fullName: string;
  phone?: string | null;
  role: { name: string; code: string; permissions: Array<{ permission: { name: string; code: string } }> };
}

export function useAuth() {
  const { accessToken, refreshToken, user, setTokens, setUser, logout: storeLogout, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProfile = async (token: string) => {
    const raw = await api.get<PrismaUser>('/users/me', { token });
    return {
      id: raw.id,
      email: raw.email ?? '',
      fullName: raw.fullName,
      phone: raw.phone ?? undefined,
      role: raw.role.code,
      permissions: raw.role.permissions.map((p) => p.permission.code),
    };
  };

  const login = async (identifier: string, password: string) => {
    // Identifier can be either an email or a phone number — the backend
    // resolves to a single user via an OR lookup.
    setLoading(true);
    setError(null);
    try {
      const trimmed = identifier.trim();
      const isEmail = trimmed.includes('@');
      const body = isEmail
        ? { email: trimmed, phone: '', password }
        : { email: '', phone: trimmed, password };
      const tokens = await api.post<TokenResponse>('/auth/login', body);

      // First sign-in with a staff-issued temporary password: no session is
      // returned, only a token scoped to the change-password endpoint. Send
      // them to the forced change rather than a dead end.
      if (tokens.mustChangePassword && tokens.changePasswordToken) {
        const params = new URLSearchParams({ token: tokens.changePasswordToken });
        const cb = redirectTarget();
        if (cb) params.set('callbackUrl', cb);
        router.push(`/auth/set-password?${params.toString()}`);
        return;
      }

      setTokens(tokens.accessToken, tokens.refreshToken);
      const profile = await fetchProfile(tokens.accessToken);
      setUser(profile);
      router.push(redirectTarget() ?? '/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, phone: string, password: string, referralCode?: string, address?: string) => {
    setLoading(true);
    setError(null);
    try {
      const body = {
        fullName,
        email: email.trim() || undefined,
        phone: phone.trim(),
        password,
        referralCode: referralCode || undefined,
        address: address?.trim() || undefined,
      };
      const tokens = await api.post<TokenResponse>('/auth/register', body);
      setTokens(tokens.accessToken, tokens.refreshToken);
      const profile = await fetchProfile(tokens.accessToken);
      setUser(profile);
      router.push(redirectTarget() ?? '/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
    router.push('/');
  };

  return {
    user,
    isAuthenticated: isAuthenticated(),
    loading,
    error,
    login,
    register,
    logout,
  };
}
