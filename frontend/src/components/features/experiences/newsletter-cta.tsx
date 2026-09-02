'use client';

import { Mail, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';

const PERKS = [
  'Members-only fare alerts',
  'Lounge & upgrade invitations',
  'First access to flash sales',
  'Concierge priority queue',
];

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-24">
      <div className="relative overflow-hidden rounded-3xl border border-hairline card-elevated">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 50% 60% at 15% 50%, color-mix(in oklab, var(--color-primary) 8%, transparent), transparent 70%), radial-gradient(ellipse 50% 60% at 85% 50%, color-mix(in oklab, var(--color-tertiary) 8%, transparent), transparent 70%)',
            }}
          />
          <div className="absolute inset-0 scrim-soft" />
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 sm:p-12 lg:p-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full text-[10px] tracking-[0.25em] uppercase font-bold text-accent border border-accent-soft bg-accent-soft">
              <Sparkles className="w-3 h-3" />
              The Velocity Elite
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-[-0.02em] text-on-bg mb-6">
              Join the club that travels <span className="gradient-text-warm">first.</span>
            </h2>

            <p className="text-base sm:text-lg text-muted leading-relaxed mb-8 max-w-md">
              Subscribe for first access to private routes, flash luxury stays, and members-only
              airport lounge updates. No spam — only signal.
            </p>

            <ul className="space-y-3 mb-8">
              {PERKS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-muted">
                  <span className="w-5 h-5 rounded-full bg-accent-soft border border-accent-soft flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-accent" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-xs text-muted">
              <div className="flex -space-x-2">
                {['IM', 'DK', 'AR', 'MT'].map((a, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                      color: 'var(--color-on-primary)',
                      borderColor: 'var(--color-background)',
                    }}
                  >
                    {a}
                  </div>
                ))}
              </div>
              <span>Joined this week by <span className="text-on-bg font-semibold">2,418 members</span></span>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubmitted(true);
              }}
              className="relative"
            >
              <div className="relative rounded-2xl border border-hairline-strong bg-on-surface-soft backdrop-blur-md p-2 shadow-2xl" style={{ boxShadow: '0 24px 48px -12px var(--accent-glow-strong)' }}>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1 flex items-center gap-3 px-4 py-3">
                    <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      disabled={submitted}
                      className="w-full bg-transparent border-none outline-none text-on-bg placeholder:text-muted text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitted}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white shadow-lg transition disabled:opacity-70"
                    style={{
                      background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
                      boxShadow: '0 12px 28px -8px var(--accent-glow-strong)',
                    }}
                  >
                    {submitted ? (
                      <>
                        <Check className="w-4 h-4" />
                        You&apos;re in
                      </>
                    ) : (
                      <>
                        Join Now
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              {submitted && (
                <p className="mt-3 text-xs text-accent text-center">
                  Welcome aboard. Check your inbox to confirm.
                </p>
              )}
              <p className="mt-4 text-xs text-muted text-center">
                By joining, you agree to our{' '}
                <a href="/privacy" className="underline hover:text-on-bg">Privacy Policy</a>.
                Unsubscribe any time.
              </p>
            </form>

            <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-hairline">
              <div>
                <div className="text-2xl font-bold text-on-bg">2,418</div>
                <div className="text-[10px] uppercase tracking-widest text-muted font-semibold mt-1">This week</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-on-bg">50K+</div>
                <div className="text-[10px] uppercase tracking-widest text-muted font-semibold mt-1">Total members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-on-bg">4.9★</div>
                <div className="text-[10px] uppercase tracking-widest text-muted font-semibold mt-1">Avg rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
