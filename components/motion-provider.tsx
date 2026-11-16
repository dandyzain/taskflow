'use client';

import { LazyMotion, MotionConfig } from 'motion/react';

const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

/**
 * Global motion setup.
 * - LazyMotion + `m.*` components keep the motion bundle small.
 * - reducedMotion="user" honours the OS "reduce motion" setting everywhere:
 *   transform/layout animations are skipped, opacity fades remain.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
