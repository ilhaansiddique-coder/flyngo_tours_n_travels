'use client';

import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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
      setTokens(tokens.accessToken, tokens.refreshToken);
      const profile = await fetchProfile(tokens.accessToken);
      setUser(profile);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, phone: string, password: string, referralCode?: string) => {
    setLoading(true);
    setError(null);
    try {
      const body = {
        fullName,
        email: email.trim() || undefined,
        phone: phone.trim(),
        password,
        referralCode: referralCode || undefined,
      };
      const tokens = await api.post<TokenResponse>('/auth/register', body);
      setTokens(tokens.accessToken, tokens.refreshToken);
      const profile = await fetchProfile(tokens.accessToken);
      setUser(profile);
      router.push('/');
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
