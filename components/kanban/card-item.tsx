"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Clock, Sparkles } from "lucide-react"

import type { CardItem } from "@/types/kanban"
import { cn } from "@/lib/utils"
import { CardDetailModal } from "@/components/kanban/card-detail-modal"
import { LabelBadge } from "@/components/kanban/label-badge"

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function isDueSoon(dateStr: string): boolean {
  const due = new Date(dateStr);
  const now = new Date();
  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 2;
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === now.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface CardItemProps {
  card: CardItem
  boardId: string
  workspaceId: string
  isDragOverlay?: boolean
  onCardUpdated?: (card: CardItem) => void
  onCardDeleted?: (cardId: string) => void
}

export function CardItemComponent({ card, boardId, workspaceId, isDragOverlay, onCardUpdated, onCardDeleted }: CardItemProps) {
  const [modalOpen, setModalOpen] = React.useState(false)
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: modalOpen,
    data: {
      type: 'Card' as const,
      card,
    },
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  let priorityBadge = null
  if (card.priority === 1) {
    priorityBadge = (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-pastel-sky text-pastel-sky-text border border-sky-300/30">
        🌱 Low
      </span>
    )
  } else if (card.priority === 2) {
    priorityBadge = (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-pastel-peach text-pastel-peach-text border border-amber-300/30">
        ⚡ Medium
      </span>
    )
  } else if (card.priority === 3) {
    priorityBadge = (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-pastel-rose text-pastel-rose-text border border-rose-300/30">
        🔥 High
      </span>
    )
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          "bg-card border border-border/80 rounded-2xl p-3.5 shadow-card relative flex flex-col gap-2.5 group cursor-pointer transition-all duration-200 ease-out",
          "hover:border-primary/40 hover:shadow-card-hover hover:-translate-y-0.5",
          isDragging && "opacity-40 ring-2 ring-primary/60 scale-[0.98]",
          isDragOverlay && "shadow-float rotate-[2deg] scale-[1.03] ring-2 ring-primary/40 cursor-grabbing bg-card/95 backdrop-blur-md"
        )}
        onClick={() => {
          if (!isDragging && !isDragOverlay) {
            setModalOpen(true)
          }
        }}
      >
        {/* Grip Handle */}
        <div
          className="absolute top-2.5 right-2.5 text-muted-foreground/60 hover:text-foreground hover-reveal transition-opacity p-1 rounded-md hover:bg-muted/60 cursor-grab active:cursor-grabbing touch-none"
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          title="Drag card"
        >
          <GripVertical size={14} />
        </div>

        {/* Labels row */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 pr-6">
            {card.labels.map(label => (
              <LabelBadge key={label.id} label={label} size="sm" />
            ))}
          </div>
        )}

        {/* Title */}
        <h4 className="font-semibold text-sm leading-snug tracking-tight text-foreground pr-5">
          {card.title}
        </h4>

        {/* Description preview */}
        {card.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {card.description}
          </p>
        )}

        {/* Card Metadata / Footer */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 mt-auto">
          <div className="flex items-center gap-1.5 flex-wrap">
            {priorityBadge}

            {card.dueDate && (
              <span className={cn(
                'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border',
                isOverdue(card.dueDate) ? 'bg-pastel-rose text-pastel-rose-text border-rose-300/40' :
                isDueSoon(card.dueDate) ? 'bg-pastel-peach text-pastel-peach-text border-amber-300/40' : 
                'bg-muted/70 text-muted-foreground border-border/40'
              )}>
                <Clock className="h-3 w-3" />
                <span>{formatDueDate(card.dueDate)}</span>
              </span>
            )}
          </div>

          {/* Assignees stack */}
          {card.assignees && card.assignees.length > 0 && (
            <div className="flex items-center -space-x-1.5 shrink-0">
              {card.assignees.slice(0, 3).map((assignee, idx) => {
                const colors = [
                  'bg-pastel-lavender text-pastel-lavender-text',
                  'bg-pastel-mint text-pastel-mint-text',
                  'bg-pastel-sky text-pastel-sky-text',
                ];
                const colorClass = colors[idx % colors.length];
                return (
                  <div
                    key={assignee.id}
                    className={cn(
                      "w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-card shadow-sm transition-transform hover:scale-110",
                      colorClass
                    )}
                    title={assignee.name}
                  >
                    {assignee.name.charAt(0).toUpperCase()}
                  </div>
                );
              })}
              {card.assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-[9px] font-bold flex items-center justify-center border-2 border-card shadow-sm">
                  +{card.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isDragOverlay && onCardUpdated && onCardDeleted && (
        <CardDetailModal
          card={card}
          boardId={boardId}
          workspaceId={workspaceId}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onCardUpdated={onCardUpdated}
          onCardDeleted={onCardDeleted}
        />
      )}
    </>
  )
}
