'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, Users, Map, Headphones } from 'lucide-react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: typeof Globe;
  tone: 'accent' | 'tertiary';
}

const STATS: StatItem[] = [
  { value: 500, suffix: '+', label: 'Destinations', icon: Globe, tone: 'accent' },
  { value: 50, suffix: 'K+', label: 'Happy Travelers', icon: Users, tone: 'tertiary' },
  { value: 1000, suffix: '+', label: 'Tour Packages', icon: Map, tone: 'accent' },
  { value: 24, suffix: '/7', label: 'Concierge', icon: Headphones, tone: 'tertiary' },
];

const TONE_STYLES = {
  accent: {
    text: 'text-accent',
    wash: 'var(--color-accent)',
  },
  tertiary: {
    text: 'text-tertiary',
    wash: 'var(--color-tertiary)',
  },
} as const;

function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(Math.floor(eased * target));
              if (t < 1) requestAnimationFrame(tick);
              else setValue(target);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { value, ref };
}

function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const { value, ref } = useCountUp(stat.value);
  const Icon = stat.icon;
  const tone = TONE_STYLES[stat.tone];

  return (
    <div
      ref={ref}
      className="group relative flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border border-hairline surface-card card-glow transition-all duration-500 hover:-translate-y-0.5"
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(180deg, color-mix(in oklab, ${tone.wash} 18%, transparent), transparent)` }}
      />
      <div
        className="relative w-12 h-12 rounded-2xl border border-soft bg-on-surface-soft backdrop-blur-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
      >
        <Icon className={`w-5 h-5 ${tone.text}`} />
      </div>
      <div
        className={`relative font-display text-5xl sm:text-6xl font-bold tracking-[-0.03em] leading-none mb-3 ${tone.text}`}
      >
        {value}
        <span className="text-muted">{stat.suffix}</span>
      </div>
      <div className="relative text-[10px] sm:text-xs tracking-[0.18em] uppercase font-bold text-muted">
        {stat.label}
      </div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="relative my-24 sm:my-32">
      <div className="px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-hairline card-elevated card-glow p-8 sm:p-12" style={{ background: 'linear-gradient(180deg, var(--color-surface-container-low) 0%, var(--color-background) 100%)' }}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-grid opacity-50" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 50% 80% at 20% 50%, var(--accent-glow), transparent 70%), radial-gradient(ellipse 50% 80% at 80% 50%, color-mix(in oklab, var(--color-tertiary) 6%, transparent), transparent 70%)',
              }}
            />
          </div>

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {STATS.map((s, i) => (
              <StatCard key={i} stat={s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
