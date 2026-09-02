/**
 * Reduce a phone number to its comparable core — digits only, last 10 (a
 * Bangladeshi mobile subscriber number, `1XXXXXXXXX`). Matching is therefore
 * tolerant of how the number was typed: `+880 1919187587`, `01919187587`,
 * `+8801919187587` and `1919187587` all reduce to `1919187587`.
 *
 * This is deliberately the SAME rule login already used, rather than full
 * E.164. Provisioning an account under one key while login looks a user up by
 * another would create accounts nobody can sign into — the two must agree, and
 * the login behaviour is the one customers already rely on.
 *
 * Returns null when there aren't enough digits to be a phone number.
 */
export function phoneKey(raw?: string | null): string | null {
  const digits = String(raw ?? '').replace(/\D/g, '');
  return digits.length >= 9 ? digits.slice(-10) : null;
}
