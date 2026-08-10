'use client';

import { useEffect, useRef, useState } from 'react';

const SCROLL_DELTA = 6;
const TOP_THRESHOLD = 24;
const REVEAL_AT = 80;

type Direction = 'up' | 'down';

export function useScrollReveal() {
  const [visible, setVisible] = useState(true);
  const [compact, setCompact] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);
  const directionRef = useRef<Direction>('up');

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;

        // Compact mode kicks in past the hero / top of page.
        setCompact(y > REVEAL_AT);

        // Always show at the very top.
        if (y < TOP_THRESHOLD) {
          setVisible(true);
        } else if (delta > SCROLL_DELTA) {
          // Scrolling down → hide.
          directionRef.current = 'down';
          setVisible(false);
        } else if (delta < -SCROLL_DELTA) {
          // Scrolling up → reveal.
          directionRef.current = 'up';
          setVisible(true);
        }

        lastY.current = y;
        ticking.current = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { visible, compact, direction: directionRef.current };
}
