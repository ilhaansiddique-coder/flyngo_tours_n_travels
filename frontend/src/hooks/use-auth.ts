'use client';

import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useAuth() {
  const { accessToken, refreshToken, user, setTokens, setUser, logout, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', { email, password });
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
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
      const data = await api.post<{ accessToken: string; refreshToken: string; user: any }>('/auth/register', { fullName, email, password });
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    logout();
    router.push('/');
  };

  return {
    user,
    isAuthenticated: isAuthenticated(),
    loading,
    error,
    login,
    register,
    logout: signOut,
  };
}
