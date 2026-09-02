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
        'relative overflow-hidden rounded-3xl border border-outline-variant/50 bg-surface-container backdrop-blur-xl text-on-surface',
        'shadow-[0_2px_8px_rgba(12,22,40,0.06),0_8px_24px_-4px_rgba(12,22,40,0.08)]',
        hover && 'transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(12,22,40,0.08),0_16px_40px_-6px_rgba(12,22,40,0.12)]',
        premium && 'card-premium-border',
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
