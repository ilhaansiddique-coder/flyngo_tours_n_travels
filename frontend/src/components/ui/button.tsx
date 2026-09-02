import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  as?: 'button' | 'a';
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, as: Component = 'button', style, ...props }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary/50',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        // text-on-primary rather than text-white: this label sits on the brand
        // gradient, and on-primary is the token that means "readable on that".
        'text-on-primary shadow-lg hover:opacity-95': variant === 'primary',
        'bg-primary text-on-primary shadow-lg shadow-primary/20 hover:opacity-90': variant === 'gradient',
        'bg-surface-container/60 backdrop-blur-md text-on-surface border border-outline-variant hover:bg-surface-container-high hover:border-outline': variant === 'secondary',
        'border border-outline-variant bg-transparent text-on-surface hover:border-primary hover:text-primary': variant === 'outline',
        'text-on-surface-variant hover:text-primary hover:bg-surface-container/50': variant === 'ghost',
        'bg-error text-on-error hover:opacity-90': variant === 'danger',
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-5 py-2.5 text-sm': size === 'md',
        'px-8 py-4 text-base': size === 'lg',
      },
      className,
    );

    const variantStyle: React.CSSProperties | undefined =
      variant === 'primary'
        ? {
            background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
            boxShadow: '0 12px 28px -8px var(--accent-glow-strong)',
            ...style,
          }
        : style;

    if (Component === 'a') {
      const NextLink = require('next/link').default;
      return (
        <NextLink href={(props as any).href || '#'} className={baseStyles} style={variantStyle} {...(props as any)}>
          {loading && <Spinner className="mr-2" />}
          {children}
        </NextLink>
      );
    }

    return (
      <button ref={ref} className={baseStyles} style={variantStyle} disabled={disabled || loading} {...props}>
        {loading && <Spinner className="mr-2" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('animate-spin h-4 w-4', className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export { Button };
