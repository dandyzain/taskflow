import { cn } from '@/lib/utils';
import type { LabelItem } from '@/types/kanban';

interface LabelBadgeProps {
  label: LabelItem;
  size?: 'sm' | 'md';
  onClick?: () => void;
  className?: string;
}

/**
 * Label chip. The text colour is the label colour mixed toward the current
 * foreground, so light colours (yellow, lime) stay readable in both themes.
 */
export function LabelBadge({ label, size = 'sm', onClick, className }: LabelBadgeProps) {
  const Comp = onClick ? 'button' : 'span';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-md border font-medium leading-none select-none',
        'bg-[color-mix(in_oklab,var(--label)_12%,transparent)] border-[color-mix(in_oklab,var(--label)_28%,transparent)]',
        'text-[color-mix(in_oklab,var(--label)_62%,hsl(var(--foreground)))]',
        size === 'sm' && 'h-5 px-1.5 text-2xs',
        size === 'md' && 'h-6 px-2 text-xs',
        onClick && 'cursor-pointer transition-transform hover:scale-105 active:scale-95',
        className
      )}
      style={{ '--label': label.color } as React.CSSProperties}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-[var(--label)]" aria-hidden />
      <span className="truncate">{label.name}</span>
    </Comp>
  );
}
