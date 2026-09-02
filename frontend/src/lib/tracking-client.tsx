'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { api } from '@/lib/api';

// ============================================================================
// UTM persistence (cookie + session storage)
// ============================================================================

const UTM_KEY = 'flyngo_utm';
const SESSION_ID_KEY = 'flyngo_sid';
const CONSENT_KEY = 'flyngo_cookie_consent';
const CONSENT_EVENT = 'flyngo:consent';

export interface UtmBag {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  landingPath?: string;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
function setCookie(name: string, value: string, days: number) {
  const exp = new Date(Date.now() + days * 86_400_000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; SameSite=Lax`;
}

export function captureUtmFromUrl(): UtmBag {
  if (typeof window === 'undefined') return {};
  const url = new URL(window.location.href);
  const get = (k: string) => url.searchParams.get(k)?.slice(0, 200);
  const bag: UtmBag = {
    utmSource: get('utm_source') ?? undefined,
    utmMedium: get('utm_medium') ?? undefined,
    utmCampaign: get('utm_campaign') ?? undefined,
    utmContent: get('utm_content') ?? undefined,
    utmTerm: get('utm_term') ?? undefined,
    gclid: get('gclid') ?? undefined,
    fbclid: get('fbclid') ?? undefined,
    msclkid: get('msclkid') ?? undefined,
    landingPath: window.location.pathname,
  };
  // Only overwrite cookie if at least one UTM param was present (so first-touch sticks)
  if (bag.utmSource || bag.utmMedium || bag.utmCampaign || bag.gclid || bag.fbclid) {
    setCookie(UTM_KEY, JSON.stringify(bag), 30);
  }
  return bag;
}

export function getStoredUtm(): UtmBag {
  const raw = getCookie(UTM_KEY);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'srv';
  let sid = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sid) {
    sid = 's_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_ID_KEY, sid);
  }
  return sid;
}

// ============================================================================
// Tracking pixel loader — fetches tenant settings and injects Meta / GA4 / GTM
// ============================================================================

interface PublicTrackingSettings {
  metaPixelId?: string | null;
  ga4MeasurementId?: string | null;
  gtmContainerId?: string | null;
  googleAdsConversionId?: string | null;
  googleAdsConversionLabel?: string | null;
  tiktokPixelId?: string | null;
  snapchatPixelId?: string | null;
  xPixelId?: string | null;
  requireMarketingConsent?: boolean;
  metaLduEnabled?: boolean;
}

/** Marketing consent chosen by the visitor — 'all' gates the pixels on. */
export function getConsent(): 'all' | 'essential' | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'all' || v === 'essential' ? v : null;
  } catch {
    return null;
  }
}

/** Meta fingerprint cookies (_fbp / _fbc) — used for dedup + advanced matching. */
function getMetaFingerprint(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {};
  const fbp = getCookie('_fbp');
  const fbc = getCookie('_fbc');
  const out: { fbp?: string; fbc?: string } = {};
  if (fbp) out.fbp = fbp;
  if (fbc) out.fbc = fbc;
  return out;
}

function makeEventId(eventName: string): string {
  return `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

let cachedSettings: PublicTrackingSettings | null = null;

export async function loadTrackingSettings(): Promise<PublicTrackingSettings> {
  if (cachedSettings) return cachedSettings;
  try {
    const res = (await api.get('/tracking/settings/public')) as PublicTrackingSettings;
    cachedSettings = res ?? {};
    return cachedSettings!;
  } catch {
    cachedSettings = {};
    return {};
  }
}

declare global {
  interface Window {
    fbq?: any;
    gtag?: any;
    dataLayer?: any[];
    ttq?: any;
    snaptr?: any;
  }
}

export function TrackingScripts() {
  const [settings, setSettings] = useState<PublicTrackingSettings | null>(null);
  const [consent, setConsent] = useState<'all' | 'essential' | null>(null);
  const pathname = usePathname();
  const firstPath = useRef(true);

  useEffect(() => {
    captureUtmFromUrl();
    loadTrackingSettings().then(setSettings);
  }, []);

  // Consent is reactive so the admin "require consent" switch takes effect
  // without a redeploy: pixels load only once the visitor accepts all.
  useEffect(() => {
    const readConsent = () => setConsent(getConsent());
    readConsent();
    if (typeof window !== 'undefined') {
      window.addEventListener(CONSENT_EVENT, readConsent);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(CONSENT_EVENT, readConsent);
      }
    };
  }, []);

  // SPA PageView: the pixel's own 'PageView' fires once on mount; every
  // subsequent route change needs an explicit call (no full page reload).
  useEffect(() => {
    if (!settings?.metaPixelId) return;
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    if (settings.requireMarketingConsent && consent !== 'all') return;
    try {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView', {}, { eventID: makeEventId('page_view') });
      }
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: pathname,
          send_to: 'ga4',
        });
      }
    } catch {}
  }, [pathname, settings, consent]);

  if (!settings) return null;

  const consentOk = !settings.requireMarketingConsent || consent === 'all';

  return (
    <>
      {settings.metaPixelId && consentOk && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            window.fbq('init', '${settings.metaPixelId}');
            window.fbq('track', 'PageView');`}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${settings.metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {settings.ga4MeasurementId && consentOk && (
        <>
          <Script id="ga4-loader" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.ga4MeasurementId}', { send_page_view: true });`}
          </Script>
          <Script
            id="ga4"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga4MeasurementId}`}
          />
        </>
      )}

      {settings.gtmContainerId && consentOk && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${settings.gtmContainerId}');`}
        </Script>
      )}

      {settings.tiktokPixelId && consentOk && (
        <Script id="tiktok" strategy="afterInteractive">
          {`!function (w, d, t) { w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq._i={},ttq._i[t]=[],ttq.track=function(e,n){ttq._i[t].push([e,n])},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i[t]=[],ttq._o=ttq._o||{},ttq._o[e]=n;var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${settings.tiktokPixelId}');ttq.page();}(window, document, 'ttq');`}
        </Script>
      )}
    </>
  );
}

// ============================================================================
// Event tracking helpers (browser side; server CAPI handles deduplication)
// ============================================================================

export async function trackEvent(
  eventName: string,
  payload: {
    value?: number;
    currency?: string;
    contentName?: string;
    contentIds?: string[];
    items?: any[];
    userId?: string;
    email?: string;
    phone?: string;
    fullName?: string;
  } = {},
) {
  const utm = getStoredUtm();
  const sid = getOrCreateSessionId();
  const fp = getMetaFingerprint();
  const consent = getConsent();
  // Shared id drives browser↔server dedup (CAPI matches on event_id)
  const eventId = makeEventId(eventName);
  // 1) Browser-side Meta Pixel (no-op if not loaded)
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      const ev = payload.value
        ? { value: payload.value, currency: payload.currency || 'USD', content_name: payload.contentName, content_ids: payload.contentIds, content_type: 'product' }
        : { content_name: payload.contentName, content_ids: payload.contentIds };
      window.fbq('track', eventName, ev, { eventID: eventId });
    }
  } catch {}
  // 2) GA4
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...payload,
        send_to: 'ga4',
      });
    }
  } catch {}
  // 3) Server-side ingest (Meta CAPI + GA4 MP)
  try {
    await api.post('/tracking/event', {
      eventName,
      eventId,
      sessionId: sid,
      userId: payload.userId,
      value: payload.value,
      currency: payload.currency,
      contentName: payload.contentName,
      contentIds: payload.contentIds,
      items: payload.items,
      email: payload.email,
      phone: payload.phone,
      fullName: payload.fullName,
      consent,
      ...fp,
      ...utm,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    });
  } catch {
    /* silent — never block the user */
  }
}

export async function submitLead(payload: {
  fullName: string;
  phone: string;
  email?: string;
  message?: string;
  formSlug?: string;
  packageSlug?: string;
  travelers?: number;
  departureCity?: string;
  budget?: string;
  source?: string;
}) {
  const utm = getStoredUtm();
  const sid = getOrCreateSessionId();
  try {
    await trackEvent('lead', {
      contentName: payload.formSlug || 'lead_form',
    });
  } catch {}
  return api.post('/tracking/lead', { ...payload, ...utm, sessionId: sid });
}
