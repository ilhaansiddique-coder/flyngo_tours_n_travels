'use client';

import { Search, FileCheck, CreditCard, PlaneTakeoff, Sparkles, Check } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';

interface Step {
  number: string;
  icon: typeof Search;
  title: string;
  description: string;
  bullets: string[];
}

const STEPS: Step[] = [
  {
    number: '01',
    icon: Search,
    title: 'Discover',
    description: 'Search curated destinations or chat with our concierge to design something bespoke.',
    bullets: ['500+ destinations', 'AI trip planner', 'Local expert insights'],
  },
  {
    number: '02',
    icon: FileCheck,
    title: 'Personalise',
    description: 'Refine every detail — flights, stays, transfers, and experiences — in one dashboard.',
    bullets: ['Flexible dates', 'Room upgrades', 'Special requests'],
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Confirm',
    description: 'Secure payment with 256-bit encryption and instant booking confirmation.',
    bullets: ['No hidden fees', 'Free cancellation*', 'Best-price guarantee'],
  },
  {
    number: '04',
    icon: PlaneTakeoff,
    title: 'Travel',
    description: '24/7 in-destination support. We handle changes, upgrades, and surprises.',
    bullets: ['Real-time alerts', 'Concierge hotline', 'Lounge access'],
  },
];

export function HowItWorks() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-32">
      <SectionHeading
        eyebrow="How it works"
        title={
          <>
            From spark to <span className="gradient-text-warm">takeoff in four steps.</span>
          </>
        }
        subtitle="A frictionless booking experience designed around the way modern travellers plan."
        align="center"
      />

      <div className="relative max-w-5xl mx-auto">
        <div className="pointer-events-none absolute top-7 left-0 right-0 h-px hidden md:block" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-on-surface) 15%, transparent), transparent)' }} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="group relative">
                <div className="relative flex md:justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-accent-soft blur-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'color-mix(in oklab, var(--color-accent) 20%, transparent)' }} />
                    <div className="relative w-14 h-14 rounded-full border border-hairline-strong surface-card-low card-elevated flex items-center justify-center group-hover:border-accent-firm group-hover:bg-accent-soft transition-all duration-500">
                      <Icon className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                    </div>
                    <div
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border-2"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                        color: 'var(--color-on-primary)',
                        borderColor: 'var(--color-background)',
                      }}
                    >
                      {i + 1}
                    </div>
                  </div>
                </div>

                <div className="text-center px-2">
                  <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-accent mb-2">
                    Step {step.number}
                  </div>
                  <h3 className="font-display text-xl font-bold text-on-bg mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed mb-4">
                    {step.description}
                  </p>
                  <ul className="space-y-1.5 text-left inline-block">
                    {step.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-xs text-muted">
                        <Check className="w-3 h-3 text-accent flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 flex justify-center">
          <a
            href="/booking"
            className="group inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition"
            style={{
              background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
              boxShadow: '0 12px 28px -8px var(--accent-glow-strong)',
            }}
          >
            <Sparkles className="w-4 h-4" />
            Start planning your trip
          </a>
        </div>
      </div>
    </section>
  );
}
