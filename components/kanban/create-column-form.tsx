"use client"

import * as React from "react"
import { Check, Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BoardColumn } from "@/types/kanban"
import { createColumn } from "@/actions/column-actions"
import { useLanguage } from "@/lib/i18n/language-context"

interface CreateColumnFormProps {
  boardId: string
  workspaceId: string
  onColumnCreated: (column: BoardColumn) => void
}

export function CreateColumnForm({ boardId, workspaceId, onColumnCreated }: CreateColumnFormProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const close = () => {
    setIsOpen(false)
    setTitle("")
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const result = await createColumn({ title: title.trim(), boardId, workspaceId })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      onColumnCreated({
        id: result.data.columnId,
        title: title.trim(),
        position: result.data.position,
        cards: [],
      })
      close()
    } catch {
      toast.error(t("ui.createColumnFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const shell = "w-[85vw] max-w-[320px] shrink-0 snap-center sm:w-[296px] sm:snap-align-none"

  if (!isOpen) {
    return (
      <div className={shell}>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-strong/70 text-sm font-medium text-muted-foreground outline-none transition-colors hover:border-primary/50 hover:bg-card/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="size-4" aria-hidden />
          {t("kanban.addColumn")}
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${shell} animate-scale-in space-y-2 rounded-2xl border bg-card p-3 shadow-e2`}
    >
      <Input
        autoFocus
        placeholder={t("kanban.enterColumnTitle")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && close()}
        disabled={isSubmitting}
        aria-label={t("kanban.enterColumnTitle")}
      />
      <div className="flex items-center gap-1.5">
        <Button type="submit" size="sm" disabled={isSubmitting || !title.trim()} className="flex-1">
          {isSubmitting ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Check className="size-3.5" aria-hidden />}
          {t("kanban.addColumn")}
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" onClick={close} disabled={isSubmitting} aria-label={t("common.cancel")}>
          <X className="size-4" />
        </Button>
      </div>
    </form>
  )
}
