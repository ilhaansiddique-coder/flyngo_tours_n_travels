'use client';

import { useLocale } from '@/contexts/locale-context';
import { Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'bn', label: 'BN' },
];

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className="hidden sm:flex items-center rounded-full p-0.5 text-[11px] font-bold tracking-wider"
      style={{
        backgroundColor: 'var(--color-header-search-bg)',
        border: '1px solid var(--color-header-search-border)',
      }}
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLocale(opt.value)}
            aria-pressed={active}
            className={cn(
              'px-2.5 py-1 rounded-full transition-colors',
              active
                    ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
            style={active ? undefined : { color: 'var(--color-header-text-muted)' }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
