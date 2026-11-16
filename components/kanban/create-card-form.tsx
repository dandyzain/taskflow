"use client"

import * as React from "react"
import { CornerDownLeft, Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { AssigneeItem, CardItem, LabelItem } from "@/types/kanban"
import { createCard } from "@/actions/card-crud-actions"
import { toggleCardAssignee } from "@/actions/assignee-actions"
import { toggleCardLabel } from "@/actions/label-actions"
import { useLanguage } from "@/lib/i18n/language-context"
import { parseQuickAdd } from "@/lib/quick-add"
import { PriorityBadge } from "@/components/patterns/priority-badge"
import { LabelBadge } from "@/components/kanban/label-badge"
import { UserAvatar } from "@/components/patterns/user-avatar"
import { cn } from "@/lib/utils"

interface CreateCardFormProps {
  columnId: string
  boardId: string
  workspaceId: string
  onCardCreated: (card: CardItem) => void
  availableLabels?: LabelItem[]
  availableMembers?: AssigneeItem[]
  /** Controlled open state (lets the board open it via the "N" shortcut) */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateCardForm({
  columnId,
  boardId,
  workspaceId,
  onCardCreated,
  availableLabels = [],
  availableMembers = [],
  open,
  onOpenChange,
}: CreateCardFormProps) {
  const { t } = useLanguage()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open ?? internalOpen
  const setIsOpen = (v: boolean) => {
    setInternalOpen(v)
    onOpenChange?.(v)
  }
  const [title, setTitle] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const parsed = React.useMemo(
    () => parseQuickAdd(title, availableMembers, availableLabels),
    [title, availableMembers, availableLabels]
  )
  const hasTokens = parsed.priority !== null || parsed.assignees.length > 0 || parsed.labels.length > 0

  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      inputRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [isOpen])

  const close = () => {
    setIsOpen(false)
    setTitle("")
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const { title: cleanTitle, priority, assignees, labels } = parsed
    if (!cleanTitle) return

    setIsSubmitting(true)
    try {
      const result = await createCard({
        title: cleanTitle,
        columnId,
        boardId,
        workspaceId,
        ...(priority !== null ? { priority } : {}),
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      const cardId = result.data.cardId

      // Apply parsed assignees / labels through the existing actions
      const appliedAssignees: AssigneeItem[] = []
      for (const a of assignees) {
        const r = await toggleCardAssignee({ cardId, userId: a.id, boardId, workspaceId })
        if (r.success) appliedAssignees.push(a)
      }
      const appliedLabels: LabelItem[] = []
      for (const l of labels) {
        const r = await toggleCardLabel({ cardId, labelId: l.id, boardId, workspaceId })
        if (r.success) appliedLabels.push(l)
      }

      onCardCreated({
        id: cardId,
        title: cleanTitle,
        description: null,
        position: result.data.position,
        priority: priority ?? 0,
        columnId,
        createdAt: new Date().toISOString(),
        dueDate: null,
        labels: appliedLabels,
        assignees: appliedAssignees,
      })
      setTitle("")
      // Keep the composer open for rapid entry
      inputRef.current?.focus()
    } catch {
      toast.error(t("ui.createCardFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="size-4" aria-hidden />
        {t("kanban.addTask")}
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-scale-in space-y-2 rounded-xl border border-primary/40 bg-card p-2 shadow-e2 ring-4 ring-primary/10"
    >
      <textarea
        ref={inputRef}
        rows={2}
        placeholder={t("kanban.enterTaskTitle")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
          } else if (e.key === "Escape") {
            close()
          }
        }}
        disabled={isSubmitting}
        aria-label={t("kanban.enterTaskTitle")}
        className="w-full resize-none bg-transparent px-1 text-sm leading-snug outline-none placeholder:text-muted-foreground"
      />

      {hasTokens ? (
        <div className="flex flex-wrap items-center gap-1 px-1" aria-live="polite">
          {parsed.priority !== null && <PriorityBadge priority={parsed.priority} hideNone={false} />}
          {parsed.labels.map((l) => (
            <LabelBadge key={l.id} label={l} />
          ))}
          {parsed.assignees.map((a) => (
            <span key={a.id} className="inline-flex h-6 items-center gap-1 rounded-md border bg-secondary px-1 pr-1.5 text-xs">
              <UserAvatar user={a} size="xs" />
              {a.name.split(" ")[0]}
            </span>
          ))}
        </div>
      ) : (
        <p className="px-1 text-2xs text-muted-foreground">{t("ui.quickAddHint")}</p>
      )}

      <div className="flex items-center gap-1.5">
        <Button type="submit" size="sm" disabled={isSubmitting || !parsed.title} className="flex-1">
          {isSubmitting ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <CornerDownLeft className="size-3.5" aria-hidden />
          )}
          {t("ui.addCard")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={close}
          disabled={isSubmitting}
          aria-label={t("common.cancel")}
          className={cn("text-muted-foreground")}
        >
          <X className="size-4" />
        </Button>
      </div>
    </form>
  )
}
