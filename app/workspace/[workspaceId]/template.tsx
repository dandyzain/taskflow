'use client';

import * as m from 'motion/react-m';
import { EASE_OUT } from '@/lib/motion';

/**
 * Re-mounts on every navigation inside the workspace, giving board ↔ board
 * and board ↔ reports a short cross-fade while the shell stays put.
 */
// The first render is server-painted content: never hide it behind an entrance
// animation (it would delay LCP). Only client-side navigations animate.
let hasNavigated = false;

export default function WorkspaceTemplate({ children }: { children: React.ReactNode }) {
  // Server renders always skip the animation; on the client the flag flips
  // after the first (hydrating) render so later navigations animate.
  const isClient = typeof window !== 'undefined';
  const animate = isClient && hasNavigated;
  if (isClient) hasNavigated = true;
  return (
    <m.div
      initial={animate ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE_OUT }}
      className="flex h-full min-h-0 w-full flex-col"
    >
      {children}
    </m.div>
  );
}
