'use client';

import { BASE_PATH } from '@/lib/api';

const TOKEN_KEY = 'vbt_admin_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  const adminToken = window.localStorage.getItem(TOKEN_KEY);
  if (adminToken) return adminToken;
  try {
    const userRaw = window.localStorage.getItem('vbt_user');
    if (userRaw) {
      const u = JSON.parse(userRaw);
      if (u?.role === 'ADMIN') {
        return window.localStorage.getItem('vbt_user_token');
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function setAdminToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function adminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_PATH}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}