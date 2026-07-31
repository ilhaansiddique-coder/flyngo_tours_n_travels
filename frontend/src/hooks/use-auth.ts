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
  email: string;
  fullName: string;
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
      email: raw.email,
      fullName: raw.fullName,
      role: raw.role.code,
      permissions: raw.role.permissions.map((p) => p.permission.code),
    };
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const tokens = await api.post<TokenResponse>('/auth/login', { email, password });
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

  const register = async (fullName: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const tokens = await api.post<TokenResponse>('/auth/register', { fullName, email, password });
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
