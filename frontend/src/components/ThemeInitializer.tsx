// 'use client' ensures this runs only on the client side.
'use client';

import { useEffect } from 'react';

/**
 * Initializes the theme (dark / light) based on localStorage or system preference.
 * This runs after React hydration, avoiding SSR/CSR mismatches.
 */
export default function ThemeInitializer() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      const isDark =
        stored === 'dark' ||
        (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const root = document.documentElement;
      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);
      // Explicitly set the color-scheme CSS property to keep the UI consistent.
      root.style.colorScheme = isDark ? 'dark' : 'light';
    } catch (e) {
      // Silently fail – this mirrors the original script's behavior.
    }
  }, []);

  // No UI rendered.
  return null;
}
