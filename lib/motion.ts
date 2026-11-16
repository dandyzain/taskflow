/**
 * Motion presets — keep durations/easings consistent across the app.
 * Mirrors the CSS tokens in app/globals.css.
 */
import type { Transition, Variants } from 'motion/react';

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  instant: 0.1,
  quick: 0.16,
  base: 0.24,
  slow: 0.4,
} as const;

export const spring: Transition = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 };
export const softSpring: Transition = { type: 'spring', stiffness: 260, damping: 28 };
export const layoutSpring: Transition = { type: 'spring', stiffness: 500, damping: 40, mass: 0.6 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.base, ease: EASE_OUT } },
};

/** Parent variant that staggers children (capped so long lists don't drag). */
export function stagger(step = 0.04, delay = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: step, delayChildren: delay } },
  };
}

export const listItem: Variants = {
  initial: { opacity: 0, y: 6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: DURATION.base, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: DURATION.quick } },
};
