import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ className, children, hover = true, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container/60 backdrop-blur-md text-on-surface card-elevated',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl dark:hover:shadow-primary/10',
        {
          'p-0': padding === 'none',
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
        },
        className,
      )}
    >
      {children}
    </div>
  );
}
