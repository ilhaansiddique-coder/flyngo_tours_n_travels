import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'cyan' | 'amber';
  className?: string;
}

const VARIANT_STYLES: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-primary/10 text-primary border-primary/30',
  cyan: 'bg-primary/10 text-primary border-primary/30',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30',
  danger: 'bg-error/10 text-error border-error/30',
  info: 'bg-brand-500/10 text-brand-600 dark:text-brand-300 border-brand-500/30',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
