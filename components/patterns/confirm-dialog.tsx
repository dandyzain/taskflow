'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

/**
 * App-wide, promise-based replacement for window.confirm():
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title, destructive: true }))) return;
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [state, setState] = React.useState<(ConfirmOptions & { open: boolean }) | null>(null);
  const resolver = React.useRef<((v: boolean) => void) | null>(null);

  const confirm = React.useCallback<ConfirmFn>((options) => {
    setState({ ...options, open: true });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setState((s) => (s ? { ...s, open: false } : s));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={!!state?.open} onOpenChange={(open) => !open && settle(false)}>
        <AlertDialogContent>
          <AlertDialogHeader className="flex-row items-start gap-3.5 space-y-0">
            {state?.destructive && (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
                <AlertTriangle className="size-5" aria-hidden />
              </span>
            )}
            <div className="space-y-1.5 pt-0.5">
              <AlertDialogTitle>{state?.title}</AlertDialogTitle>
              {state?.description && <AlertDialogDescription>{state.description}</AlertDialogDescription>}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => settle(false)}>
              {state?.cancelLabel ?? t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => settle(true)}
              className={cn(state?.destructive && buttonVariants({ variant: 'destructive' }))}
            >
              {state?.confirmLabel ?? (state?.destructive ? t('common.delete') : t('common.confirm'))}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) {
    // Fallback keeps components usable outside the provider (e.g. tests)
    return async (o) => (typeof window !== 'undefined' ? window.confirm(o.title) : false);
  }
  return ctx;
}
