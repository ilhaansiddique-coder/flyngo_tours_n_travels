'use client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export function AuthBootstrap() {
  const queries = useQueryClient();
  useEffect(() => {
    document.cookie = 'flyngo-auth=; path=/; max-age=0';
    try { localStorage.removeItem('flyngo-auth'); sessionStorage.removeItem('flyngo-auth'); } catch { /* storage may be disabled */ }
    const unsubscribe = useAuthStore.subscribe((state, previous) => {
      if (state.user?.id !== previous.user?.id) queries.clear();
    });
    void api.initializeSession().catch(() => undefined);
    if (typeof BroadcastChannel === 'undefined') return unsubscribe;
    const channel = new BroadcastChannel('flyngo-session');
    channel.onmessage = (event) => {
      queries.clear();
      if (event.data === 'logout') useAuthStore.getState().clearSession();
      if (event.data === 'login') void api.initializeSession(true).catch(() => undefined);
    };
    return () => { channel.close(); unsubscribe(); };
  }, [queries]);
  return null;
}
