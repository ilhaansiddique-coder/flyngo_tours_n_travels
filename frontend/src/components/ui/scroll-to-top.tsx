'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      setVisible(window.scrollY > 320);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      title="Scroll to top"
      className={cn(
        'fixed bottom-[100px] right-6 z-40',
        'group flex items-center justify-center',
        'w-12 h-12 rounded-full',
        'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'shadow-[0_10px_30px_-8px_rgba(7,86,184,0.45)]',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none',
      )}
      style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-tertiary) 100%)',
        color: 'var(--color-on-primary, #ffffff)',
      }}
    >
      <span className="absolute inset-0 rounded-full pointer-events-none overflow-hidden">
        <span className="scroll-to-top-ring absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
      </span>
      <ArrowUp
        className={cn(
          'relative w-5 h-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'group-hover:-translate-y-0.5',
        )}
      />
      <span className="absolute -top-9 right-0 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-[0.18em] uppercase whitespace-nowrap opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none"
        style={{
          backgroundColor: 'var(--color-on-surface)',
          color: 'var(--color-surface)',
        }}
      >
        Top
      </span>
    </button>
  );
}