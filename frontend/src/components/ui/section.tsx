import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SectionProps {
  className?: string;
  children: React.ReactNode;
  id?: string;
  background?: 'default' | 'subtle' | 'brand' | 'gradient';
}

export function Section({ className, children, id, background = 'default' }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-20 lg:py-28 relative',
        {
          'bg-transparent': background === 'default',
          'bg-surface-container/50 border-y border-outline-variant/40': background === 'subtle',
          'bg-gradient-to-r from-primary to-tertiary text-on-primary': background === 'brand',
          'bg-gradient-to-b from-background via-surface-container-low to-background': background === 'gradient',
        },
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Container({ className, children, size = 'default' }: { className?: string; children: React.ReactNode; size?: 'default' | 'narrow' | 'wide' }) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        {
          'max-w-7xl': size === 'default',
          'max-w-4xl': size === 'narrow',
          'max-w-screen-xl': size === 'wide',
        },
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ title, subtitle, center = true, eyebrow }: { title: string; subtitle?: string; center?: boolean; eyebrow?: string }) {
  return (
    <div className={cn('mb-16', center && 'text-center')}>
      {eyebrow && (
        <span className="inline-block text-[10px] tracking-[0.25em] uppercase font-bold text-primary mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-on-surface-variant max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
