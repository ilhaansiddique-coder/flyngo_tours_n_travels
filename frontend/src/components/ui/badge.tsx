import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300': variant === 'default',
          'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300': variant === 'success',
          'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300': variant === 'warning',
          'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300': variant === 'danger',
          'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300': variant === 'info',
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
