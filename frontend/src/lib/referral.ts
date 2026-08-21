/**
 * Captures the `?ref=` query parameter from any landing URL, validates it
 * against the server, and stores it in a cookie so the value survives page
 * navigation and is sent with the eventual `/auth/register` call.
 */
export const REFERRAL_COOKIE = 'flyngo_ref_code';
export const REFERRAL_COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function captureReferralFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get('ref');
  if (fromQuery && fromQuery.length >= 3 && fromQuery.length <= 32) {
    const code = fromQuery.trim().toUpperCase();
    setCookie(REFERRAL_COOKIE, code, REFERRAL_COOKIE_DAYS);
    return code;
  }
  return getCookie(REFERRAL_COOKIE);
}

export function getStoredReferralCode(): string | null {
  return getCookie(REFERRAL_COOKIE);
}

export function clearStoredReferralCode() {
  setCookie(REFERRAL_COOKIE, '', -1);
}

export function buildReferralShareLink(baseUrl: string, code: string): string {
  const trimmed = baseUrl.replace(/\/$/, '');
  return `${trimmed}/?ref=${encodeURIComponent(code.toUpperCase())}`;
}

export function formatRewardText(type: string, value: number, currency: string): string {
  if (type === 'percentage') return `${value}% off`;
  return `${value} ${currency} off`;
}
