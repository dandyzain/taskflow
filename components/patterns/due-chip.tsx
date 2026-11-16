'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DUE_ICON, DUE_STYLE, getDueState } from '@/lib/design/tokens';
import { useLanguage } from '@/lib/i18n/language-context';

/** "Today", "Tomorrow", "in 3d", "2d overdue" or a short date. */
export function formatRelativeDue(dateStr: string, lang: 'en' | 'id', now = new Date()): string {
  const due = new Date(dateStr);
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(due) - startOf(now)) / 86_400_000);
  const id = lang === 'id';
  if (days === 0) return id ? 'Hari ini' : 'Today';
  if (days === 1) return id ? 'Besok' : 'Tomorrow';
  if (days === -1) return id ? 'Kemarin' : 'Yesterday';
  if (days < 0 && days >= -14) return id ? `Telat ${-days} hr` : `${-days}d overdue`;
  if (days > 1 && days <= 6) return id ? `${days} hari lagi` : `in ${days}d`;
  return due.toLocaleDateString(id ? 'id-ID' : 'en-US', {
    month: 'short',
    day: 'numeric',
    ...(due.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}

interface DueChipProps {
  date: string;
  className?: string;
}

export function DueChip({ date, className }: DueChipProps) {
  const { lang } = useLanguage();
  const state = getDueState(date);
  const Icon = DUE_ICON[state] ?? Clock;
  const full = new Date(date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-md border px-1.5 text-xs font-medium tabular-nums whitespace-nowrap',
        DUE_STYLE[state],
        className
      )}
      title={full}
    >
      <Icon className="size-3.5" aria-hidden />
      <time dateTime={date}>{formatRelativeDue(date, lang)}</time>
    </span>
  );
}
