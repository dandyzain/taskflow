'use client';

import { useState } from 'react';
import * as m from 'motion/react-m';
import { ChevronDown, Plus } from 'lucide-react';
import type { BoardColumn } from '@/types/kanban';
import { LabelBadge } from '@/components/kanban/label-badge';
import { DueChip } from '@/components/patterns/due-chip';
import { PriorityBadge } from '@/components/patterns/priority-badge';
import { AvatarStack } from '@/components/patterns/user-avatar';
import { getStatus } from '@/lib/design/tokens';
import { useLanguage } from '@/lib/i18n/language-context';
import { EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface BoardListViewProps {
  columns: BoardColumn[];
  totals: Record<string, number>;
  onOpenCard: (cardId: string) => void;
  onAddTask: (columnId: string) => void;
}

/** Compact, scannable list grouped by column — ideal on phones and for triage. */
export function BoardListView({ columns, totals, onOpenCard, onAddTask }: BoardListViewProps) {
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-6">
      {columns.map((col, ci) => {
        const status = getStatus(col.title);
        const isCollapsed = collapsed[col.id];
        return (
          <m.section
            key={col.id}
            initial={{ y: 8 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT, delay: Math.min(ci, 6) * 0.04 }}
            className="overflow-hidden rounded-2xl border bg-card shadow-e1"
          >
            <button
              type="button"
              onClick={() => setCollapsed((s) => ({ ...s, [col.id]: !s[col.id] }))}
              aria-expanded={!isCollapsed}
              className="flex w-full items-center gap-2.5 bg-surface-sunken/70 px-4 py-2.5 text-left outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <ChevronDown
                className={cn('size-4 text-muted-foreground transition-transform duration-quick', isCollapsed && '-rotate-90')}
                aria-hidden
              />
              <span className={cn('size-2.5 rounded-full', status.dot)} aria-hidden />
              <h2 className="flex-1 text-sm font-semibold">{col.title}</h2>
              <span className="rounded-full bg-card px-2 py-0.5 text-xs tabular-nums text-muted-foreground ring-1 ring-border">
                {col.cards.length === totals[col.id] ? col.cards.length : `${col.cards.length}/${totals[col.id]}`}
              </span>
            </button>

            {!isCollapsed && (
              <ul className="divide-y">
                {col.cards.map((card) => (
                  <li key={card.id}>
                    <button
                      type="button"
                      onClick={() => onOpenCard(card.id)}
                      className="grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 px-4 py-3 text-left outline-none transition-colors hover:bg-secondary/60 focus-visible:bg-secondary/60 md:grid-cols-[1fr_auto_auto_auto]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{card.title}</span>
                        {card.labels.length > 0 && (
                          <span className="mt-1 flex flex-wrap gap-1">
                            {card.labels.map((l) => (
                              <LabelBadge key={l.id} label={l} />
                            ))}
                          </span>
                        )}
                      </span>
                      <span className="hidden md:block">
                        <PriorityBadge priority={card.priority} />
                      </span>
                      <span className="hidden md:block">{card.dueDate && <DueChip date={card.dueDate} />}</span>
                      <span className="flex items-center justify-end gap-1.5">
                        <span className="md:hidden">
                          <PriorityBadge priority={card.priority} compact />
                        </span>
                        <AvatarStack users={card.assignees} size="sm" />
                      </span>
                      {card.dueDate && (
                        <span className="col-span-2 md:hidden">
                          <DueChip date={card.dueDate} />
                        </span>
                      )}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => onAddTask(col.id)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground outline-none hover:bg-secondary/60 hover:text-foreground focus-visible:bg-secondary/60"
                  >
                    <Plus className="size-4" aria-hidden />
                    {t('kanban.addTask')}
                  </button>
                </li>
              </ul>
            )}
          </m.section>
        );
      })}
    </div>
  );
}
