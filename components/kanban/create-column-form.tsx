"use client"

import * as React from "react"
import { Plus, X, Check } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BoardColumn } from "@/types/kanban"
import { createColumn } from "@/actions/column-actions"
import { useLanguage } from "@/lib/i18n/language-context"

interface CreateColumnFormProps {
  boardId: string
  workspaceId: string
  onColumnCreated: (column: BoardColumn) => void
}

export function CreateColumnForm({
  boardId,
  workspaceId,
  onColumnCreated,
}: CreateColumnFormProps) {
  const { t, lang } = useLanguage()
  const [isOpen, setIsOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const result = await createColumn({
        title: title.trim(),
        boardId,
        workspaceId,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      const newColumn: BoardColumn = {
        id: result.data.columnId,
        title: title.trim(),
        position: result.data.position,
        cards: [],
      }
      onColumnCreated(newColumn)
      setTitle("")
      setIsOpen(false)
    } catch {
      toast.error(lang === 'id' ? 'Gagal membuat kolom' : 'Failed to create column')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    } else if (e.key === "Escape") {
      setIsOpen(false)
      setTitle("")
    }
  }

  if (!isOpen) {
    return (
      <div className="w-[280px] sm:w-[300px] min-w-[280px] sm:min-w-[300px] h-fit snap-center sm:snap-align-none shrink-0">
        <Button
          variant="outline"
          className="w-full h-12 border-2 border-dashed border-border/80 hover:border-primary/50 bg-secondary/30 hover:bg-secondary/70 rounded-2xl justify-center text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-[0.98] font-semibold text-xs shadow-xs"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4 text-primary" />
          {t('kanban.addColumn')}
        </Button>
      </div>
    )
  }

  return (
    <div className="w-[280px] sm:w-[300px] min-w-[280px] sm:min-w-[300px] h-fit bg-card/90 backdrop-blur-md border border-primary/30 rounded-2xl p-3.5 shadow-pastel flex flex-col gap-2.5 animate-scale-in snap-center sm:snap-align-none shrink-0">
      <Input
        autoFocus
        placeholder={t('kanban.enterColumnTitle')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        className="h-9 text-xs rounded-xl border-border/80 focus-visible:ring-primary/40 bg-background/80"
      />
      <div className="flex items-center gap-1.5">
        <Button
          variant="default"
          size="sm"
          onClick={() => handleSubmit()}
          disabled={isSubmitting || !title.trim()}
          className="flex-1 h-8 text-xs font-semibold rounded-xl shadow-xs hover:shadow-pastel transition-all active:scale-95"
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          {t('kanban.addColumn')}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => {
            setIsOpen(false)
            setTitle("")
          }}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
