import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  as?: 'button' | 'a';
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, as: Component = 'button', ...props }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm hover:shadow-md': variant === 'primary',
        'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100': variant === 'secondary',
        'border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400': variant === 'outline',
        'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white': variant === 'ghost',
        'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-5 py-2.5 text-sm': size === 'md',
        'px-8 py-4 text-base': size === 'lg',
      },
      className,
    );

    if (Component === 'a') {
      const NextLink = require('next/link').default;
      return (
        <NextLink href={(props as any).href || '#'} className={baseStyles} {...(props as any)}>
          {loading && <Spinner className="mr-2" />}
          {children}
        </NextLink>
      );
    }

    return (
      <button ref={ref} className={baseStyles} disabled={disabled || loading} {...props}>
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
