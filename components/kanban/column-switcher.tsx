'use client';

import * as m from 'motion/react-m';
import type { BoardColumn } from '@/types/kanban';
import { getStatus } from '@/lib/design/tokens';
import { useLanguage } from '@/lib/i18n/language-context';
import { layoutSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface ColumnSwitcherProps {
  columns: BoardColumn[];
  activeId: string | null;
  onJump: (columnId: string) => void;
}

/** Phone-only segmented control that tracks / jumps between snap-scrolled columns. */
export function ColumnSwitcher({ columns, activeId, onJump }: ColumnSwitcherProps) {
  const { t } = useLanguage();
  return (
    <nav aria-label={t('ui.columnJump')} className="-mx-3 mb-3 shrink-0 md:hidden" data-print-hide>
      <div className="edge-fade-x flex gap-1.5 overflow-x-auto px-3 pb-0.5 scrollbar-none">
        {columns.map((col) => {
          const active = col.id === activeId;
          const status = getStatus(col.title);
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => onJump(col.id)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'relative flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {active && (
                <m.span
                  layoutId="column-switcher-pill"
                  transition={layoutSpring}
                  className="absolute inset-0 rounded-full bg-card shadow-e1 ring-1 ring-border"
                  aria-hidden
                />
              )}
              <span className={cn('relative size-2 rounded-full', status.dot)} aria-hidden />
              <span className="relative">{col.title}</span>
              <span className="relative text-xs tabular-nums text-muted-foreground">{col.cards.length}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
