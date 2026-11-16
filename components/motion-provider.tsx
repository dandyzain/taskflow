'use client';

import { LazyMotion, MotionConfig, domMax } from 'motion/react';

/**
 * Global motion setup.
 * - LazyMotion + `m.*` components keep the motion bundle small.
 * - reducedMotion="user" honours the OS "reduce motion" setting everywhere:
 *   transform/layout animations are skipped, opacity fades remain.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
