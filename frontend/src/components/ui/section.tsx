import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SectionProps {
  className?: string;
  children: React.ReactNode;
  id?: string;
  background?: 'white' | 'gray' | 'brand';
}

export function Section({ className, children, id, background = 'white' }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-20 lg:py-28',
        {
          'bg-white dark:bg-gray-950': background === 'white',
          'bg-gray-50 dark:bg-gray-900/50': background === 'gray',
          'bg-brand-600 dark:bg-brand-900': background === 'brand',
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

export function SectionHeader({ title, subtitle, center = true }: { title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={cn('mb-16', center && 'text-center')}>
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
