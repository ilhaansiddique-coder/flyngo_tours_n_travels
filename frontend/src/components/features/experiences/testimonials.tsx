'use client';

import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { useState } from 'react';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  destination: string;
  rating: number;
  avatar: string;
  tripType: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote:
      'The Santorini trip was flawless from the private jet pickup in London to the cliffside butler service. FlynGo turned a holiday into a defining life memory.',
    author: 'Isabella M.',
    role: 'Velocity Club Member',
    destination: 'Santorini, Greece',
    rating: 5,
    avatar: 'IM',
    tripType: 'Honeymoon',
  },
  {
    id: '2',
    quote:
      'I needed a complex 4-country Asia itinerary for 12 executives on 3 weeks notice. The FlynGo concierge delivered every transfer, translator, and dinner reservation perfectly.',
    author: 'Daniel K.',
    role: 'Managing Director',
    destination: 'Tokyo → Bali → Singapore → Hanoi',
    rating: 5,
    avatar: 'DK',
    tripType: 'Corporate',
  },
  {
    id: '3',
    quote:
      'Hajj 2026 with my family of 8 was the smoothest pilgrimage we could have imagined. Five-star stay steps from the Haram, our guide Ibrahim felt like family by day three.',
    author: 'Amina R.',
    role: 'Returning traveller',
    destination: 'Makkah & Madinah',
    rating: 5,
    avatar: 'AR',
    tripType: 'Hajj',
  },
  {
    id: '4',
    quote:
      'I have used FlynGo for the last 9 trips and they consistently find flights and stays I cannot beat on any other platform — even with my own travel-agent friends.',
    author: 'Marcus T.',
    role: 'Founder & frequent flyer',
    destination: 'Worldwide',
    rating: 5,
    avatar: 'MT',
    tripType: 'Leisure',
  },
];

export function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-32">
      <SectionHeading
        eyebrow="Member stories"
        title={
          <>
            Travellers who choose <span className="gradient-text-warm">velocity.</span>
          </>
        }
        subtitle="A 4.9-star average across 12,400+ verified reviews. Here's what members say after returning home."
        align="center"
      />

      <div className="relative max-w-5xl mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl border border-hairline card-elevated p-8 sm:p-12"
          style={{
            background: 'linear-gradient(180deg, var(--color-surface-container) 0%, var(--color-background) 100%)',
            boxShadow: '0 24px 48px -16px color-mix(in oklab, var(--color-primary) 18%, transparent)',
          }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-grid opacity-40" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-glow), transparent 70%)',
              }}
            />
          </div>

          <Quote className="relative w-12 h-12 text-accent/40 mb-6" />

          <div className="relative">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.id}
                className={`transition-all duration-500 ${i === active ? 'opacity-100 translate-x-0' : 'opacity-0 absolute inset-0 -translate-x-4 pointer-events-none'
                  }`}
              >
                <blockquote className="font-display text-2xl sm:text-3xl lg:text-4xl text-on-bg leading-[1.25] tracking-[-0.01em] mb-8 max-w-3xl">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-hairline">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                        color: 'var(--color-on-primary)',
                      }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-on-bg">{t.author}</div>
                      <div className="text-xs text-muted">
                        {t.role} · {t.destination}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <span className="text-xs text-muted uppercase tracking-widest font-semibold">
                      {t.tripType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === active ? 'w-8 bg-accent' : 'w-1.5 bg-on-surface-firm hover:bg-on-surface-firm'
                  }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActive((a) => (a - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
              className="w-10 h-10 rounded-full border border-hairline-strong flex items-center justify-center text-muted hover:text-on-bg hover:border-accent-soft transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % TESTIMONIALS.length)}
              className="w-10 h-10 rounded-full border border-hairline-strong flex items-center justify-center text-muted hover:text-on-bg hover:border-accent-soft transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
