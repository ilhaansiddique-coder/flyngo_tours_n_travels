'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureReferralFromUrl } from '@/lib/referral';

/**
 * Captures the `?ref=` query parameter on every route change and stores it
 * in a cookie so the value is available to the eventual `/auth/register`
 * call regardless of which page the visitor lands on first.
 *
 * Mount once in the root <Providers> tree. No UI.
 */
export function ReferralCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureReferralFromUrl();
  }, [pathname, searchParams]);

  return null;
}
