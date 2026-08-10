'use client';

import { useTheme } from '@/components/theme-provider';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle({ className }: { className?: string } = {}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // SSR hydration guard: avoid mismatched theme markup between server and client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={className ?? 'p-2 rounded-full transition-colors'}
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={className ?? 'p-2 rounded-full transition-all hover:scale-110'}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      // Outside the public header the caller supplies its own colour via
      // className; the header-scoped token only applies to the default.
      style={className ? undefined : { color: 'var(--color-header-text)' }}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
