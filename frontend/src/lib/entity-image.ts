// Central image resolver for every entity surface (list card, detail hero,
// admin thumbnail). The whole point is CONSISTENCY: the same entity must show
// the same picture everywhere. An admin-uploaded `coverImageUrl`/`imageUrl`
// always wins; when none exists we fall back to a DETERMINISTIC photo keyed on
// a STABLE field so list + detail + admin all resolve to the identical image.
//
// The fallback keys below intentionally mirror the exact query + extra keywords
// each list card already used (tour-card, hotel-card, visa/hajj/umrah pages),
// so switching a surface to these helpers never changes a currently-correct
// card — it only makes the OTHER surfaces match it.

import { serviceImage } from './service-image';
import { countryImage } from './country-image';

function normalizeUploadUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/api/v1/uploads/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
    if (apiBase) return `${apiBase}${trimmed}`;
  }
  return trimmed;
}

/** Tour — mirrors tour-card: serviceImage(destination?.name || title, 'landmark,travel'). */
export function tourImage(t: any, w?: number, h?: number): string {
  const direct = normalizeUploadUrl(t?.coverImageUrl || t?.imageUrl || t?.images?.[0]?.url);
  return direct || serviceImage(t?.destination?.name || t?.title || t?.slug, 'landmark,travel', w, h);
}

/** Hotel — mirrors hotel-card: serviceImage(destination?.name || name, 'hotel,resort'). */
export function hotelImage(h_: any, w?: number, h?: number): string {
  const direct = normalizeUploadUrl(h_?.coverImageUrl || h_?.imageUrl || h_?.images?.[0]?.url);
  return direct || serviceImage(h_?.destination?.name || h_?.name || h_?.slug, 'hotel,resort', w, h);
}

/** Visa — mirrors visa page: countryImage(destination?.name || country?.name). */
export function visaImage(v: any, w?: number, h?: number): string {
  const direct = normalizeUploadUrl(v?.imageUrl || v?.coverImageUrl);
  return direct || countryImage(v?.destination?.name || v?.country?.name || v?.name || v?.title, w, h);
}

/** Hajj package — mirrors hajj page: serviceImage(title, 'makkah,kaaba,hajj'). */
export function hajjImage(p: any, w?: number, h?: number): string {
  const direct = normalizeUploadUrl(p?.coverImageUrl || p?.imageUrl);
  return direct || serviceImage(p?.title || p?.slug, 'makkah,kaaba,hajj', w, h);
}

/** Umrah package — mirrors umrah page: serviceImage(title, 'madinah,mosque,umrah'). */
export function umrahImage(p: any, w?: number, h?: number): string {
  const direct = normalizeUploadUrl(p?.coverImageUrl || p?.imageUrl);
  return direct || serviceImage(p?.title || p?.slug, 'madinah,mosque,umrah', w, h);
}

/** Transport — keyed on vehicleType/title so list, detail and admin all match. */
export function transportImage(t: any, w?: number, h?: number): string {
  const direct = normalizeUploadUrl(t?.coverImageUrl || t?.imageUrl);
  return direct || serviceImage(t?.vehicleType || t?.title || t?.name, 'car,transport,travel', w, h);
}

/** Flight — keyed on airline so admin thumbnails always show relevant imagery. */
export function flightImage(f: any, w?: number, h?: number): string {
  const direct = normalizeUploadUrl(f?.coverImageUrl || f?.imageUrl);
  return direct || serviceImage(f?.airline || f?.title, 'airplane,aviation,sky', w, h);
}

/** Destination — mirrors destinations-showcase: countryImage(name). */
export function destinationImage(d: any, w?: number, h?: number): string {
  const direct = normalizeUploadUrl(d?.coverImageUrl || d?.imageUrl);
  return direct || countryImage(d?.name || d?.slug, w, h);
}
