'use client';

import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';

interface ApiTestimonial {
  id: string;
  customerName: string;
  customerTitle?: string | null;
  customerImage?: string | null;
  content: string;
  rating: number;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function Testimonials() {
  const { getTestimonials } = useApi();
  const [testimonials, setTestimonials] = useState<ApiTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchTestimonials = async () => {
      try {
        const data: any = await getTestimonials();
        const items = data.data ?? data ?? [];
        if (!cancelled) setTestimonials(Array.isArray(items) ? items : []);
      } catch {
        if (!cancelled) setTestimonials([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTestimonials();
    return () => {
      cancelled = true;
    };
  }, [getTestimonials]);

  if (!loading && testimonials.length === 0) return null;

  const prev =
    testimonials.length > 0 ? () => setActive((a) => (a - 1 + testimonials.length) % testimonials.length) : undefined;
  const next =
    testimonials.length > 0 ? () => setActive((a) => (a + 1) % testimonials.length) : undefined;

  return (
    <section className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-32">
      <SectionHeading
        eyebrow="Member stories"
        title={
          <>
            Travellers who choose <span className="gradient-text-warm">velocity.</span>
          </>
        }
        subtitle="Here's what travellers say after returning home."
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

          {loading ? (
            <div className="relative space-y-4 animate-pulse">
              <div className="h-6 w-full rounded bg-on-surface-soft" />
              <div className="h-6 w-5/6 rounded bg-on-surface-soft" />
              <div className="h-6 w-2/3 rounded bg-on-surface-soft" />
              <div className="h-12 w-48 rounded bg-on-surface-soft mt-8" />
            </div>
          ) : (
            <div className="relative">
              {testimonials.map((t, i) => (
                <div
                  key={t.id}
                  className={`transition-all duration-500 ${i === active ? 'opacity-100 translate-x-0' : 'opacity-0 absolute inset-0 -translate-x-4 pointer-events-none'
                    }`}
                >
                  <blockquote className="font-display text-2xl sm:text-3xl lg:text-4xl text-on-bg leading-[1.25] tracking-[-0.01em] mb-8 max-w-3xl">
                    &ldquo;{t.content}&rdquo;
                  </blockquote>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-hairline">
                    <div className="flex items-center gap-4">
                      {t.customerImage ? (
                        <img
                          src={t.customerImage}
                          alt={t.customerName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                          style={{
                            background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                            color: 'var(--color-on-primary)',
                          }}
                        >
                          {initials(t.customerName)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-on-bg">{t.customerName}</div>
                        {t.customerTitle && <div className="text-xs text-muted">{t.customerTitle}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: Math.max(1, Math.min(5, t.rating || 5)) }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && testimonials.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
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
                onClick={prev}
                disabled={!prev}
                className="w-10 h-10 rounded-full border border-hairline-strong flex items-center justify-center text-muted hover:text-on-bg hover:border-accent-soft transition-all disabled:opacity-40"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                disabled={!next}
                className="w-10 h-10 rounded-full border border-hairline-strong flex items-center justify-center text-muted hover:text-on-bg hover:border-accent-soft transition-all disabled:opacity-40"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
