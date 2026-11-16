'use client';

import { useRef } from 'react';
import { m, useInView } from 'motion/react';
import { EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Grow inline-width / inline-height bars once visible (charts) */
  animateBars?: boolean;
}

/**
 * Fades + lifts its content the first time it scrolls into view and flags
 * `data-inview` so CSS can draw chart bars in at the same moment.
 * Print and reduced-motion styles neutralise both effects.
 */
export function Reveal({ children, className, delay = 0, animateBars = true }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });

  return (
    <m.div
      ref={ref}
      data-reveal
      data-animate-bars={animateBars || undefined}
      data-inview={inView || undefined}
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.45, ease: EASE_OUT, delay }}
      className={cn('print-avoid-break', className)}
    >
      {children}
    </m.div>
  );
}
