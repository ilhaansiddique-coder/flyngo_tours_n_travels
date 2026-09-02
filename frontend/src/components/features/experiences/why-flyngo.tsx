import { HeroIntro } from './hero-intro';

export function WhyFlynGo() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-24">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16">
        <HeroIntro surface="page" />
        <aside className="hidden lg:block">
          <div className="rounded-3xl border border-hairline surface-card p-8 card-elevated card-glow card-premium-border">
            <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-4">
              Why FlynGo
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-on-surface leading-[1.1] tracking-[-0.02em] mb-3">
              One concierge. Every leg of the journey.
            </h3>
            <p className="text-on-surface-variant leading-relaxed">
              From the first search to the return flight, our team handles visas, hotels, tours,
              and Hajj & Umrah logistics — backed by 24/7 human support.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default WhyFlynGo;
