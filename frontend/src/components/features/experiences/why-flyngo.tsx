import {
  Plane,
  Hotel,
  FileCheck,
  Sparkles,
  Headphones,
  BadgeCheck,
  Clock,
} from 'lucide-react';
import { HeroIntro } from './hero-intro';

const PILLARS = [
  {
    icon: Plane,
    title: 'Flights',
    description: 'Best-fare airfares across 400+ carriers, including private and chartered jets.',
    tone: 'text-accent',
    ring: 'var(--color-accent)',
  },
  {
    icon: Hotel,
    title: 'Hotels & Tours',
    description: 'Hand-picked stays and curated locals-led experiences worldwide.',
    tone: 'text-tertiary',
    ring: 'var(--color-tertiary)',
  },
  {
    icon: FileCheck,
    title: 'Visas',
    description: 'Hassle-free documentation with express turnaround and 98% approval rate.',
    tone: 'text-emerald-500 dark:text-emerald-300',
    ring: '#10b981',
  },
  {
    icon: Sparkles,
    title: 'Hajj & Umrah',
    description: 'Licensed pilgrimage logistics with stays steps from the Haram.',
    tone: 'text-tertiary',
    ring: 'var(--color-tertiary)',
  },
];

function PillarRow({
  icon: Icon,
  title,
  description,
  tone,
  ring,
}: (typeof PILLARS)[number]) {
  return (
    <div className="group flex items-start gap-4">
      <div
        className="relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
        style={{
          border: '1px solid var(--color-outline-variant)',
          backgroundColor: 'color-mix(in oklab, var(--color-on-background) 4%, transparent)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Icon className={`w-5 h-5 ${tone}`} />
        <span
          className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
          style={{ backgroundColor: ring }}
        />
      </div>
      <div>
        <div className="font-display text-sm font-bold text-on-surface tracking-tight">
          {title}
        </div>
        <p className="text-[13px] text-muted leading-relaxed mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export function WhyFlynGo() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-32">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16">
        <HeroIntro surface="page" />

        <aside className="hidden lg:block">
          <div className="relative overflow-hidden rounded-3xl border border-hairline surface-card card-elevated card-glow card-premium-border p-8 sm:p-10 h-full">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-60 pointer-events-none" style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--color-accent) 14%, transparent), transparent 70%)' }} />
            </div>

            <div className="relative">
              <div className="flex items-center gap-2.5 mb-6">
                <span
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))',
                    color: 'var(--color-on-primary)',
                    boxShadow: '0 8px 20px -6px var(--accent-glow-strong)',
                  }}
                >
                  <BadgeCheck className="w-5 h-5" />
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">
                  Why FlynGo
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-on-surface leading-[1.1] tracking-[-0.02em] mb-3">
                One concierge.{' '}
                <span className="gradient-text-warm">Every leg of the journey.</span>
              </h3>

              <p className="text-on-surface-variant leading-relaxed mb-7">
                From the first search to the return flight, a single dedicated team handles
                every detail for you — visas, hotels, tours, and Hajj & Umrah logistics —
                so you simply travel.
              </p>

              <div className="space-y-5">
                {PILLARS.map((p) => (
                  <PillarRow key={p.title} {...p} />
                ))}
              </div>

              <div
                className="mt-8 pt-6 flex items-start gap-3 rounded-2xl p-4 border"
                style={{
                  borderColor: 'color-mix(in oklab, var(--color-accent) 25%, transparent)',
                  background: 'linear-gradient(135deg, color-mix(in oklab, var(--color-accent) 7%, transparent), transparent)',
                }}
              >
                <Headphones className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                    24/7 Human Support
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold"
                      style={{
                        color: 'color-mix(in oklab, #10b981 80%, var(--color-on-surface) 20%)',
                        backgroundColor: 'color-mix(in oklab, #10b981 12%, transparent)',
                      }}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      Always on
                    </span>
                  </div>
                  <p className="text-[13px] text-muted leading-relaxed mt-1">
                    Real humans in your timezone, on the ground and in the air — ready the
                    moment you need them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default WhyFlynGo;