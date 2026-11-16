'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';
import { useMediaQuery } from '@/hooks/use-media-query';

/** Bottom-right on desktop; top-center on phones so toasts never cover the tab bar. */
export function AppToaster() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position={isDesktop ? 'bottom-right' : 'top-center'}
      theme={(resolvedTheme as 'light' | 'dark' | undefined) ?? 'system'}
      richColors
      closeButton
      toastOptions={{ classNames: { toast: 'rounded-xl font-sans shadow-e2' } }}
    />
  );
}
