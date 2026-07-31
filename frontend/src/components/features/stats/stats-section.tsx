'use client';

import { useState, useEffect, useRef } from 'react';
import { Section, Container } from '@/components/ui/section';
import { Globe, Users, Luggage, Award, Headphones, CreditCard } from 'lucide-react';

const metrics = [
  { icon: Globe, value: 500, suffix: '+', label: 'Destinations Worldwide', gradient: 'from-sky-500 to-blue-600' },
  { icon: Users, value: 50, suffix: 'K+', label: 'Happy Travelers', gradient: 'from-violet-500 to-purple-600' },
  { icon: Luggage, value: 1200, suffix: '+', label: 'Tour Packages', gradient: 'from-amber-500 to-orange-600' },
  { icon: Award, value: 98, suffix: '%', label: 'Satisfaction Rate', gradient: 'from-emerald-500 to-teal-600' },
  { icon: Headphones, value: 24, suffix: '/7', label: 'Dedicated Support', gradient: 'from-rose-500 to-pink-600' },
  { icon: CreditCard, value: 100, suffix: '%', label: 'Secure Payments', gradient: 'from-indigo-500 to-blue-600' },
];

function AnimatedCounter({ target, suffix, duration = 2000 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return (
    <div ref={ref} className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
      {count}{suffix}
    </div>
  );
}

export function StatsSection() {
  return (
    <Section background="white">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center group">
              <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <AnimatedCounter target={metric.value} suffix={metric.suffix} />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">{metric.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
