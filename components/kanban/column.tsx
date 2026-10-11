'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardItemComponent } from '@/components/kanban/card-item';
import { CreateCardForm } from '@/components/kanban/create-card-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BoardColumn, CardItem } from '@/types/kanban';
import { cn } from '@/lib/utils';
import { GripVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateColumn, deleteColumn } from '@/actions/column-actions';
import { useLanguage } from '@/lib/i18n/language-context';

interface ColumnProps {
  column: BoardColumn;
  boardId: string;
  workspaceId: string;
  onCardCreated: (card: CardItem) => void;
  onCardUpdated: (card: CardItem) => void;
  onCardDeleted: (cardId: string) => void;
  onColumnUpdated: (columnId: string, title: string) => void;
  onColumnDeleted: (columnId: string) => void;
}

function getColumnIndicatorColor(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('backlog')) return 'bg-pastel-lavender ring-purple-400/30';
  if (lower.includes('to do') || lower.includes('todo')) return 'bg-pastel-sky ring-sky-400/30';
  if (lower.includes('progress') || lower.includes('in dev')) return 'bg-pastel-peach ring-amber-400/30';
  if (lower.includes('done') || lower.includes('complete')) return 'bg-pastel-mint ring-emerald-400/30';
  return 'bg-primary/50 ring-primary/20';
}

export function KanbanColumn({ 
  column, 
  boardId, 
  workspaceId, 
  onCardCreated, 
  onCardUpdated, 
  onCardDeleted,
  onColumnUpdated,
  onColumnDeleted
}: ColumnProps) {
  const { t, lang } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column' as const,
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleUpdate = async () => {
    if (editTitle.trim() === '' || editTitle === column.title) {
      setIsEditing(false);
      setEditTitle(column.title);
      return;
    }

    const result = await updateColumn({
      columnId: column.id,
      title: editTitle,
      boardId,
      workspaceId,
    });

    if (result.success) {
      onColumnUpdated(column.id, editTitle);
      toast.success(lang === 'id' ? 'Kolom berhasil diperbarui' : 'Column updated');
    } else {
      toast.error(result.error);
      setEditTitle(column.title);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm(t('kanban.deleteColumnConfirm'))) {
      return;
    }

    const result = await deleteColumn({
      columnId: column.id,
      boardId,
      workspaceId,
    });

    if (result.success) {
      onColumnDeleted(column.id);
      toast.success(lang === 'id' ? 'Kolom berhasil dihapus' : 'Column deleted');
    } else {
      toast.error(result.error);
    }
  };

  const indicatorDot = getColumnIndicatorColor(column.title);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-[280px] sm:w-[300px] min-w-[280px] sm:min-w-[300px] flex flex-col bg-secondary/50 dark:bg-card/40 backdrop-blur-md rounded-2xl border border-border/70 shadow-xs transition-all duration-200 snap-center sm:snap-align-none shrink-0",
        isDragging && "opacity-40 ring-2 ring-primary/40 scale-[0.98]"
      )}
    >
      {/* Column Header */}
      <div className="px-3.5 py-3 flex items-center justify-between group">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground transition-colors p-1 sm:p-0.5 rounded touch-none"
            title={lang === 'id' ? 'Geser kolom' : 'Drag column'}
          >
            <GripVertical size={15} />
          </div>

          {/* Status Indicator Dot */}
          <span className={cn("w-2.5 h-2.5 rounded-full ring-2 shrink-0 transition-transform group-hover:scale-110", indicatorDot)} />

          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleUpdate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdate();
                if (e.key === 'Escape') {
                  setEditTitle(column.title);
                  setIsEditing(false);
                }
              }}
              autoFocus
              className="h-7 px-2 text-sm font-semibold rounded-lg bg-card"
            />
          ) : (
            <h3 
              className="font-semibold text-sm truncate cursor-pointer text-foreground select-none"
              onDoubleClick={() => setIsEditing(true)}
              title={lang === 'id' ? 'Klik dua kali untuk mengedit nama kolom' : 'Double click to edit title'}
            >
              {column.title}
            </h3>
          )}
        </div>
        
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Card Count Pill */}
          <span className="text-[11px] font-semibold text-muted-foreground bg-card/80 px-2 py-0.5 rounded-full border border-border/50 shadow-xs">
            {column.cards.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground/60 hover-reveal hover:text-destructive hover:bg-destructive/10 rounded-lg"
            onClick={handleDelete}
            title={t('kanban.deleteColumn')}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
      
      {/* Cards Scroll Area */}
      <ScrollArea className="flex-1 max-h-[calc(100dvh-260px)] sm:max-h-[calc(100vh-230px)]">
        <div className="px-2.5 pb-2.5 space-y-2.5">
          <SortableContext
            items={column.cards.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.cards.map((card) => (
              <CardItemComponent 
                key={card.id} 
                card={card} 
                boardId={boardId}
                workspaceId={workspaceId}
                onCardUpdated={onCardUpdated}
                onCardDeleted={onCardDeleted}
              />
            ))}
          </SortableContext>
        </div>
      </ScrollArea>
      
      {/* Add Card Form Footer */}
      <div className="px-2.5 pb-2.5 pt-1">
        <CreateCardForm
          columnId={column.id}
          boardId={boardId}
          workspaceId={workspaceId}
          onCardCreated={onCardCreated}
        />
      </div>
    </div>
  );
}
