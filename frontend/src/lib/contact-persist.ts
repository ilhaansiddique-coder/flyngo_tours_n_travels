import { COUNTRY_DIALS, DEFAULT_COUNTRY_CODE } from '@/lib/country-dial-codes';

const STORAGE_KEY = 'flyngo-contact';

export interface SavedContact {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export function loadContact(): SavedContact {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveContact(data: SavedContact) {
  if (typeof window === 'undefined') return;
  const existing = loadContact();
  const merged = { ...existing };
  if (data.firstName) merged.firstName = data.firstName;
  if (data.lastName) merged.lastName = data.lastName;
  if (data.phone) merged.phone = data.phone;
  if (data.email) merged.email = data.email;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function splitStoredPhone(phone?: string): { code: string; number: string } {
  if (!phone) return { code: DEFAULT_COUNTRY_CODE, number: '' };
  const matched = COUNTRY_DIALS.find((c) => phone.startsWith(c.dial + ' ') || phone.startsWith(c.dial));
  if (matched) {
    const rest = phone.startsWith(matched.dial + ' ')
      ? phone.slice(matched.dial.length + 1)
      : phone.slice(matched.dial.length);
    return { code: matched.code, number: rest.trim() };
  }
  return { code: DEFAULT_COUNTRY_CODE, number: phone };
}
