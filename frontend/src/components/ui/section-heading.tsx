import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
  action?: { label: string; href: string };
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 mb-14',
        align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <span className="inline-flex items-center gap-2 mb-4">
            <span className="h-px w-6 bg-primary" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-primary">
              {eyebrow}
            </span>
          </span>
        )}
        <h2 className="font-display text-4xl sm:text-5xl lg:text-[56px] leading-[1.05] font-bold text-on-surface tracking-[-0.02em]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
        >
          {action.label}
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      )}
    </div>
  );
}
