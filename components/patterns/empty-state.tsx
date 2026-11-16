import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Friendly empty state: an icon floating over a soft aurora halo + dotted grid,
 * a short title, optional guidance and a call to action.
 */
export function EmptyState({ icon: Icon, title, description, action, className, size = 'md' }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center text-center',
        size === 'sm' && 'gap-2 py-6',
        size === 'md' && 'gap-3 py-12',
        size === 'lg' && 'gap-4 py-20',
        className
      )}
    >
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-10 rounded-full bg-dot-grid [mask-image:radial-gradient(closest-side,#000,transparent)]"
        />
        <div
          aria-hidden
          className="absolute -inset-4 rounded-full bg-gradient-brand opacity-20 blur-2xl"
        />
        <div
          className={cn(
            'relative flex items-center justify-center rounded-2xl border bg-card shadow-e2',
            size === 'sm' ? 'size-10' : 'size-14'
          )}
        >
          <Icon className={cn('text-primary', size === 'sm' ? 'size-5' : 'size-6')} aria-hidden />
        </div>
      </div>
      <div className="relative max-w-sm space-y-1">
        <h3 className={cn('font-semibold text-foreground', size === 'lg' ? 'text-lg' : 'text-[0.9375rem]')}>{title}</h3>
        {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
      </div>
      {action && <div className="relative mt-1">{action}</div>}
    </div>
  );
}
