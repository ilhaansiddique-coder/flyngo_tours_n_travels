import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SectionHeader({
  title,
  subtitle,
  light = false,
  className,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto max-w-2xl text-center', className)}>
      <h2
        className={cn(
          'text-balance text-3xl font-semibold tracking-tight sm:text-4xl',
          light ? 'text-white' : 'text-[var(--color-ink)]',
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            'mx-auto mt-3 max-w-xl text-base leading-relaxed',
            light ? 'text-white/70' : 'text-[var(--color-ink-soft)]',
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  type = 'button',
  disabled,
  icon,
}: {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'gold' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  icon?: ReactNode;
}) {
  const base = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
    size === 'sm' && 'px-4 py-2 text-sm',
    size === 'md' && 'px-6 py-3 text-sm',
    size === 'lg' && 'px-7 py-3.5 text-base',
    variant === 'primary' &&
      'bg-[var(--color-primary)] text-white shadow-sm hover:bg-[var(--color-primary-dark)] hover:shadow-md',
    variant === 'outline' &&
      'border border-white/40 bg-transparent text-white hover:bg-white/10',
    variant === 'ghost' &&
      'bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]',
    variant === 'gold' &&
      'bg-[var(--color-gold-deep)] text-[#4a3008] hover:brightness-105',
    variant === 'white' &&
      'bg-white text-[var(--color-primary-darker)] shadow-sm hover:bg-[var(--color-primary-lighter)]',
    disabled && 'pointer-events-none opacity-60',
    className,
  );

  if (href) {
    const external = /^(https?:|mailto:|tel:)/.test(href);
    if (external) {
      return (
        <a href={href} className={base} target="_blank" rel="noreferrer">
          {icon}
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={base}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base}>
      {icon}
      {children}
    </button>
  );
}