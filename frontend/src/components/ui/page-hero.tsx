import { cn } from '@/lib/utils';

interface PageHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
  variant?: 'default' | 'emerald' | 'amber' | 'blue';
  children?: React.ReactNode;
}

const VARIANT_WASH: Record<NonNullable<PageHeroProps['variant']>, string> = {
  default: 'color-mix(in oklab, var(--color-primary) 18%, transparent), color-mix(in oklab, var(--color-tertiary) 12%, transparent)',
  emerald: 'color-mix(in oklab, #10b981 16%, transparent), color-mix(in oklab, #f59e0b 14%, transparent)',
  amber:   'color-mix(in oklab, var(--color-tertiary) 18%, transparent), color-mix(in oklab, var(--color-primary) 12%, transparent)',
  blue:    'color-mix(in oklab, var(--color-primary) 20%, transparent), color-mix(in oklab, #5fa9ff 14%, transparent)',
};

export function PageHero({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  variant = 'default',
  children,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden surface-page pt-32 pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 72% 38%, ${VARIANT_WASH[variant].split(',')[0]}, transparent 70%), radial-gradient(ellipse 40% 35% at 18% 65%, ${VARIANT_WASH[variant].split(',')[1]}, transparent 70%)`,
          }}
        />
      </div>

      <div
        className={cn(
          'relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16',
          align === 'center' ? 'text-center' : 'text-left',
        )}
      >
        {eyebrow && (
          <span
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full text-[10px] tracking-widest uppercase font-bold text-primary border border-primary/30 bg-primary/5',
              align === 'center' ? 'mx-auto' : '',
            )}
          >
            {eyebrow}
          </span>
        )}

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-[-0.02em] text-on-surface max-w-3xl">
          {title}
        </h1>

        {subtitle && (
          <p
            className={cn(
              'mt-5 text-lg text-on-surface-variant max-w-2xl leading-relaxed',
              align === 'center' ? 'mx-auto' : '',
            )}
          >
            {subtitle}
          </p>
        )}

        {children && <div className={cn('mt-8', align === 'center' ? 'flex justify-center' : '')}>{children}</div>}
      </div>
    </section>
  );
}
