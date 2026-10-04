import { cn } from '@/lib/utils';
import type { LabelItem } from '@/types/kanban';

interface LabelBadgeProps {
  label: LabelItem;
  size?: 'sm' | 'md';
  onClick?: () => void;
  className?: string;
}

export function LabelBadge({ label, size = 'sm', onClick, className }: LabelBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 select-none border',
        size === 'sm' && 'px-2.5 py-0.5 text-[11px]',
        size === 'md' && 'px-3 py-1 text-xs',
        onClick && 'cursor-pointer hover:scale-105 active:scale-95',
        className
      )}
      style={{
        backgroundColor: `${label.color}15`,
        borderColor: `${label.color}35`,
        color: label.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: label.color }}
      />
      {label.name}
    </span>
  );
}
