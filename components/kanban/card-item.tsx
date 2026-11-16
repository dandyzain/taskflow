"use client"

import * as React from "react"
import { memo } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { AlignLeft } from "lucide-react"

import type { CardItem } from "@/types/kanban"
import { cn } from "@/lib/utils"
import { getPriority } from "@/lib/design/tokens"
import { LabelBadge } from "@/components/kanban/label-badge"
import { PriorityBadge } from "@/components/patterns/priority-badge"
import { DueChip } from "@/components/patterns/due-chip"
import { AvatarStack } from "@/components/patterns/user-avatar"

interface CardItemProps {
  card: CardItem
  isDragOverlay?: boolean
  onOpen?: (cardId: string) => void
}

/** Visual body of a task card — shared by the sortable card and the drag overlay. */
export function CardFace({ card, lifted }: { card: CardItem; lifted?: boolean }) {
  const priority = getPriority(card.priority)
  const hasMeta = card.priority > 0 || card.dueDate || card.assignees.length > 0

  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 overflow-hidden rounded-xl border bg-card p-3 text-left shadow-e1",
        "transition-[box-shadow,border-color,transform] duration-quick ease-out-expo",
        lifted && "shadow-e3 ring-1 ring-primary/30"
      )}
    >
      {/* Priority accent stripe */}
      {card.priority > 0 && (
        <span aria-hidden className={cn("absolute inset-y-2 left-0 w-[3px] rounded-r-full", priority.solid)} />
      )}

      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.labels.map((label) => (
            <LabelBadge key={label.id} label={label} size="sm" />
          ))}
        </div>
      )}

      <h3 className="text-sm font-medium leading-snug text-foreground [overflow-wrap:anywhere]">{card.title}</h3>

      {card.description && (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          <AlignLeft className="mr-1 inline size-3 -translate-y-px opacity-60" aria-hidden />
          {card.description}
        </p>
      )}

      {hasMeta && (
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <PriorityBadge priority={card.priority} />
            {card.dueDate && <DueChip date={card.dueDate} />}
          </div>
          <AvatarStack users={card.assignees} max={3} size="sm" className="shrink-0" />
        </div>
      )}
    </div>
  )
}

function CardItemComponentInner({ card, isDragOverlay, onOpen }: CardItemProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "Card" as const, card },
  })

  if (isDragOverlay) {
    return (
      <div className="cursor-grabbing rotate-[2deg] scale-[1.03]">
        <CardFace card={card} lifted />
      </div>
    )
  }

  const style: React.CSSProperties = {
    transition,
    transform: CSS.Translate.toString(transform),
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    listeners?.onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (e.key === "Enter" && !isDragging) {
      e.preventDefault()
      onOpen?.(card.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onKeyDown={onKeyDown}
      aria-roledescription="sortable task"
      data-card-id={card.id}
      className={cn(
        "group relative cursor-pointer rounded-xl outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "[&>div]:hover:-translate-y-px [&>div]:hover:border-border-strong [&>div]:hover:shadow-e2",
        isDragging &&
          "[&>*]:invisible rounded-xl border-2 border-dashed border-primary/40 bg-accent/60 [&>div]:hover:translate-y-0"
      )}
      onClick={() => {
        if (!isDragging) onOpen?.(card.id)
      }}
    >
      <CardFace card={card} />
    </div>
  )
}

export const CardItemComponent = memo(CardItemComponentInner)
