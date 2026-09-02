import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  premium?: boolean;
}

export function Card({ className, children, hover = true, padding = 'md', premium = false }: CardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-outline-variant/70 bg-surface-container/70 backdrop-blur-xl text-on-surface card-elevated card-glow',
        hover && 'transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/30',
        premium && 'card-premium-border card-top-accent',
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
