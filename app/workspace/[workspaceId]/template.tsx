'use client';

import { m } from 'motion/react';
import { EASE_OUT } from '@/lib/motion';

/**
 * Re-mounts on every navigation inside the workspace, giving board ↔ board
 * and board ↔ reports a short cross-fade while the shell stays put.
 */
export default function WorkspaceTemplate({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE_OUT }}
      className="flex h-full min-h-0 w-full flex-col"
    >
      {children}
    </m.div>
  );
}
