/**
 * Captures the `?ref=` query parameter from any landing URL, validates it
 * against the server, and stores it in a cookie so the value survives page
 * navigation and is sent with the eventual `/auth/register` call.
 */
export const REFERRAL_COOKIE = 'flyngo_ref_code';
export const REFERRAL_COOKIE_DAYS = 30;

/**
 * Per-channel share message templates. The same shape lives on the server in
 * `backend/src/modules/referral/referral.service.ts` (`ShareMessageTemplates`).
 * The server's `mergeShareTemplates()` is the source of truth — it falls back
 * to these defaults if the column is null.
 */
export const DEFAULT_SHARE_TEMPLATES: Record<string, string> = {
  whatsapp:
    'Join me on {brand} and get {refereeReward} on your first booking! Use my code: {referralCode} {shareLink}',
  facebook: 'I just joined {brand} — they offer {refereeReward} off your first booking. Use my code {referralCode}',
  twitter: 'Save {refereeReward} on your first {brand} booking with my code {referralCode}',
  telegram: 'Try {brand} — {refereeReward} off with code {referralCode}',
  email_subject: 'Travel with me on {brand}',
  email_body:
    'Use my code {referralCode} and get {refereeReward} on your first booking: {shareLink}',
  signup_banner: 'You were invited with code {referralCode} — you will get a welcome discount.',
};

export type ShareChannel =
  | 'whatsapp'
  | 'facebook'
  | 'twitter'
  | 'telegram'
  | 'email_subject'
  | 'email_body'
  | 'signup_banner';
export type ShareTemplates = Record<ShareChannel, string>;

export interface ShareTemplateContext {
  brand: string;
  refereeReward: string;
  referrerReward?: string;
  referralCode: string;
  shareLink: string;
  refereeName?: string;
}

/**
 * Substitute `{placeholder}` tokens in a template. Unknown placeholders are
 * dropped silently so an out-of-date template never throws.
 */
export function resolveShareTemplate(
  template: string | undefined,
  ctx: ShareTemplateContext,
): string {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    if (key === 'refereeName' && !ctx.refereeName) return '';
    const value = (ctx as unknown as Record<string, string | undefined>)[key];
    return value ?? '';
  });
}

/**
 * Merge server-stored templates over the defaults so any channel that wasn't
 * explicitly customised still gets a sensible fallback.
 */
export function mergeShareTemplates(stored: unknown): ShareTemplates {
  const out: Record<string, string> = { ...DEFAULT_SHARE_TEMPLATES };
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return out as ShareTemplates;
  }
  const obj = stored as Record<string, unknown>;
  for (const key of Object.keys(out)) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim().length > 0) {
      out[key] = v;
    }
  }
  return out as ShareTemplates;
}

/** Map a channel name to the share URL builder used for that channel. */
export function buildShareUrl(
  channel: ShareChannel,
  resolvedText: string,
  shareLink: string,
): string {
  const text = encodeURIComponent(resolvedText);
  const url = encodeURIComponent(shareLink);
  switch (channel) {
    case 'whatsapp':
      // `wa.me/?text=...` opens the WhatsApp "share to a contact" picker.
      // We append the link with a leading space so WhatsApp auto-detects it.
      return `https://wa.me/?text=${encodeURIComponent(resolvedText + (shareLink ? ' ' + shareLink : ''))}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    case 'telegram':
      return `https://t.me/share/url?url=${url}&text=${text}`;
    case 'email_subject':
    case 'email_body':
      return `mailto:?subject=${encodeURIComponent(resolvedText)}`;
    case 'signup_banner':
      // signup_banner is rendered in-page, not a share URL.
      return '';
    default:
      return '';
  }
}

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

export function setReferralCode(code: string): string | null {
  const normalized = code.trim().toUpperCase();
  if (normalized.length < 3 || normalized.length > 32) return null;
  setCookie(REFERRAL_COOKIE, normalized, REFERRAL_COOKIE_DAYS);
  return normalized;
}

export function clearStoredReferralCode() {
  setCookie(REFERRAL_COOKIE, '', -1);
}

export function buildReferralShareLink(baseUrl: string, code: string): string {
  // Point straight at the signup form so a referral link is a one-click
  // signup: the register page reads ?ref=, stores the cookie and pre-fills
  // the "You were invited with code …" banner.
  const trimmed = baseUrl.replace(/\/$/, '');
  return `${trimmed}/auth/register?ref=${encodeURIComponent(code.toUpperCase())}`;
}

export function formatRewardText(type: string, value: number, _currency: string): string {
  if (type === 'percentage') return `${value}% off`;
  return `৳${Number(value).toLocaleString()} off`;
}
