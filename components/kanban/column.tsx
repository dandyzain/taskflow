'use client';

import { memo, useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { m } from 'motion/react';
import { toast } from 'sonner';
import { ChevronsLeftRight, ChevronsRightLeft, GripVertical, Inbox, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { CardItemComponent } from '@/components/kanban/card-item';
import { CreateCardForm } from '@/components/kanban/create-card-form';
import { useConfirm } from '@/components/patterns/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AssigneeItem, BoardColumn, CardItem, LabelItem } from '@/types/kanban';
import { updateColumn, deleteColumn } from '@/actions/column-actions';
import { getStatus } from '@/lib/design/tokens';
import { useLanguage } from '@/lib/i18n/language-context';
import { EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface ColumnProps {
  column: BoardColumn;
  /** Unfiltered card count — the badge shows "filtered / total" when they differ */
  totalCount: number;
  boardId: string;
  workspaceId: string;
  index: number;
  collapsed: boolean;
  isDropTarget: boolean;
  composerOpen: boolean;
  availableLabels: LabelItem[];
  availableMembers: AssigneeItem[];
  onComposerOpenChange: (columnId: string, open: boolean) => void;
  onToggleCollapse: (columnId: string) => void;
  onOpenCard: (cardId: string) => void;
  onCardCreated: (card: CardItem) => void;
  onColumnUpdated: (columnId: string, title: string) => void;
  onColumnDeleted: (columnId: string) => void;
}

function KanbanColumnInner({
  column,
  totalCount,
  boardId,
  workspaceId,
  index,
  collapsed,
  isDropTarget,
  composerOpen,
  availableLabels,
  availableMembers,
  onComposerOpenChange,
  onToggleCollapse,
  onOpenCard,
  onCardCreated,
  onColumnUpdated,
  onColumnDeleted,
}: ColumnProps) {
  const { t } = useLanguage();
  const confirm = useConfirm();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const status = getStatus(column.title);

  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'Column' as const, column },
  });

  const style = { transition, transform: CSS.Translate.toString(transform) };

  const handleUpdate = async () => {
    setIsEditing(false);
    if (editTitle.trim() === '' || editTitle === column.title) {
      setEditTitle(column.title);
      return;
    }
    const result = await updateColumn({ columnId: column.id, title: editTitle, boardId, workspaceId });
    if (result.success) {
      onColumnUpdated(column.id, editTitle);
      toast.success(t('ui.columnUpdated'));
    } else {
      toast.error(result.error);
      setEditTitle(column.title);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: t('ui.deleteColumnTitle', { name: column.title }),
      description: t('ui.deleteColumnDesc', { count: totalCount }),
      destructive: true,
    });
    if (!ok) return;
    const result = await deleteColumn({ columnId: column.id, boardId, workspaceId });
    if (result.success) {
      onColumnDeleted(column.id);
      toast.success(t('ui.columnDeleted'));
    } else {
      toast.error(result.error);
    }
  };

  const count =
    column.cards.length === totalCount ? String(totalCount) : `${column.cards.length}/${totalCount}`;

  // ── Collapsed: slim vertical strip (still a drop target) ──
  if (collapsed) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        data-column-id={column.id}
        className={cn(
          'flex w-12 shrink-0 snap-center flex-col items-center gap-3 rounded-2xl border bg-surface-sunken/80 py-3 transition-[box-shadow,background-color] duration-quick',
          isDropTarget && 'bg-accent ring-2 ring-primary/40',
          isDragging && 'opacity-50'
        )}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onToggleCollapse(column.id)}
          aria-label={`${t('ui.expandColumn')}: ${column.title}`}
          title={t('ui.expandColumn')}
        >
          <ChevronsLeftRight className="size-4" />
        </Button>
        <span className={cn('size-2 rounded-full', status.dot)} aria-hidden />
        <span className="rounded-full bg-card px-1.5 text-2xs font-medium tabular-nums text-muted-foreground ring-1 ring-border">
          {count}
        </span>
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`${t('ui.dragColumn')}: ${column.title}`}
          className="flex-1 cursor-grab touch-none text-sm font-medium text-foreground [writing-mode:vertical-rl] active:cursor-grabbing"
        >
          {column.title}
        </button>
      </div>
    );
  }

  return (
    <m.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT, delay: Math.min(index, 6) * 0.04 }}
      className="flex max-h-full min-h-0 shrink-0 snap-center flex-col sm:snap-align-none"
      aria-label={column.title}
    >
      <div
        ref={setNodeRef}
        style={style}
        data-column-id={column.id}
        className={cn(
          'relative flex max-h-full min-h-0 w-[85vw] max-w-[320px] flex-col rounded-2xl border bg-surface-sunken/80 backdrop-blur-sm sm:w-[296px]',
          'transition-[box-shadow,background-color,border-color] duration-base ease-out-expo',
          isDropTarget && 'border-primary/40 bg-accent/70 shadow-glow',
          isDragging && 'opacity-50'
        )}
      >
        {/* Header */}
        <header className="group flex items-center gap-2 px-3 pb-2 pt-3">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`${t('ui.dragColumn')}: ${column.title}`}
            className="-ml-1 flex size-7 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground/70 outline-none transition-colors hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
          >
            <GripVertical className="size-4" aria-hidden />
          </button>
          <span className={cn('size-2.5 shrink-0 rounded-full ring-4 ring-card', status.dot)} aria-hidden />

          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleUpdate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') {
                  setEditTitle(column.title);
                  setIsEditing(false);
                }
              }}
              autoFocus
              className="h-7 flex-1 px-2 text-sm font-semibold"
              aria-label={t('ui.rename')}
            />
          ) : (
            <h3
              className="min-w-0 flex-1 cursor-text truncate text-sm font-semibold text-foreground"
              onDoubleClick={() => setIsEditing(true)}
            >
              {column.title}
            </h3>
          )}

          <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground ring-1 ring-border">
            {count}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover-reveal size-7 rounded-md text-muted-foreground hover:text-foreground tap-target"
                aria-label={`${t('ui.columnActions')}: ${column.title}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onComposerOpenChange(column.id, true)}>
                <Plus /> {t('kanban.addTask')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTimeout(() => setIsEditing(true), 0)}>
                <Pencil /> {t('ui.rename')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onToggleCollapse(column.id)}>
                <ChevronsRightLeft /> {t('ui.collapseColumn')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={handleDelete}>
                <Trash2 /> {t('kanban.deleteColumn')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Cards */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-1">
          <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex min-h-[3rem] flex-col gap-2 pb-1">
              {column.cards.map((card) => (
                <li key={card.id}>
                  <CardItemComponent card={card} onOpen={onOpenCard} />
                </li>
              ))}
            </ul>
          </SortableContext>

          {column.cards.length === 0 && !composerOpen && (
            <div
              className={cn(
                'mb-1 flex flex-col items-center gap-1 rounded-xl border border-dashed px-3 py-5 text-center transition-colors',
                isDropTarget ? 'border-primary/50 text-primary' : 'border-border-strong/70 text-muted-foreground'
              )}
            >
              <Inbox className="size-5 opacity-70" aria-hidden />
              <p className="text-xs font-medium">{t('ui.emptyColumn')}</p>
              <p className="text-2xs opacity-80">{t('ui.emptyColumnHint')}</p>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="px-2 pb-2 pt-1">
          <CreateCardForm
            columnId={column.id}
            boardId={boardId}
            workspaceId={workspaceId}
            onCardCreated={onCardCreated}
            availableLabels={availableLabels}
            availableMembers={availableMembers}
            open={composerOpen}
            onOpenChange={(open) => onComposerOpenChange(column.id, open)}
          />
        </div>
      </div>
    </m.section>
  );
}

export const KanbanColumn = memo(KanbanColumnInner);
