'use client';

import { cn } from '@/lib/utils';
import { getPriority } from '@/lib/design/tokens';
import { useLanguage } from '@/lib/i18n/language-context';

interface PriorityBadgeProps {
  priority: number;
  /** Hide the "none" level entirely (default true) */
  hideNone?: boolean;
  size?: 'sm' | 'md';
  /** Icon-only compact form (still announces the label to screen readers) */
  compact?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, hideNone = true, size = 'sm', compact, className }: PriorityBadgeProps) {
  const { t } = useLanguage();
  const meta = getPriority(priority);
  if (hideNone && meta.level === 0) return null;
  const Icon = meta.icon;
  const label = t(meta.labelKey);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium leading-none whitespace-nowrap',
        size === 'sm' ? 'h-6 px-1.5 text-xs' : 'h-7 px-2 text-sm',
        compact && 'px-1',
        meta.chip,
        className
      )}
      title={compact ? label : undefined}
    >
      <Icon className={size === 'sm' ? 'size-3.5' : 'size-4'} aria-hidden />
      {compact ? <span className="sr-only">{label}</span> : label}
    </span>
  );
}
