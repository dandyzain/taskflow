"use client"

import * as React from "react"
import { Plus, X, Check } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardItem } from "@/types/kanban"
import { createCard } from "@/actions/card-crud-actions"

interface CreateCardFormProps {
  columnId: string
  boardId: string
  workspaceId: string
  onCardCreated: (card: CardItem) => void
}

export function CreateCardForm({
  columnId,
  boardId,
  workspaceId,
  onCardCreated,
}: CreateCardFormProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const result = await createCard({
        title: title.trim(),
        columnId,
        boardId,
        workspaceId,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      const newCard: CardItem = {
        id: result.data.cardId,
        title: title.trim(),
        description: null,
        position: result.data.position,
        priority: 0,
        columnId,
        createdAt: new Date().toISOString(),
        dueDate: null,
        labels: [],
        assignees: [],
      }
      onCardCreated(newCard)
      setTitle("")
      setIsOpen(false)
    } catch (error) {
      toast.error("Failed to create card")
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
      <Button
        variant="ghost"
        className="w-full text-muted-foreground/80 hover:text-foreground justify-start rounded-xl h-9 hover:bg-card/70 transition-all duration-200 border border-transparent hover:border-border/60 text-xs font-medium hover:shadow-xs active:scale-[0.98]"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="mr-2 h-3.5 w-3.5 text-primary" />
        Add card
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-1.5 bg-card/80 backdrop-blur-sm rounded-xl border border-border shadow-xs animate-scale-in">
      <Input
        autoFocus
        placeholder="Enter task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        className="h-8 text-xs rounded-lg border-border/80 focus-visible:ring-primary/50"
      />
      <div className="flex items-center gap-1.5">
        <Button
          variant="default"
          size="sm"
          onClick={() => handleSubmit()}
          disabled={isSubmitting || !title.trim()}
          className="flex-1 h-7 text-xs rounded-lg shadow-xs hover:shadow-md transition-all active:scale-95"
        >
          <Check className="mr-1 h-3.5 w-3.5" />
          Add Card
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => {
            setIsOpen(false)
            setTitle("")
          }}
          disabled={isSubmitting}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
