'use client'

import * as React from "react"
import { useState, useEffect, useId } from "react"
import { m } from "motion/react"
import { Activity as ActivityIcon, Pencil } from "lucide-react"
import { toast } from "sonner"
import { updateBoard } from "@/actions/board-actions"
import { fetchActivities } from "@/actions/activity-actions"
import type { ActivityItem } from "@/lib/queries/activity-queries"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ActivityFeed } from "./activity-feed"
import { useLanguage } from "@/lib/i18n/language-context"
import { EASE_OUT } from "@/lib/motion"

interface BoardHeaderProps {
  title: string
  description: string | null
  boardId: string
  workspaceId: string
  doneCount: number
  totalCount: number
}

/** Gradient completion ring that animates as tasks move to "Done". */
function ProgressRing({ value, label }: { value: number; label: string }) {
  const gid = useId().replace(/:/g, "")
  const r = 16
  const c = 2 * Math.PI * r
  return (
    <div className="flex items-center gap-2.5" role="img" aria-label={label}>
      <span className="relative">
      <svg viewBox="0 0 40 40" className="size-10 -rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--brand-from))" />
            <stop offset="100%" stopColor="hsl(var(--brand-to))" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4" className="stroke-border" />
        <m.circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          stroke={`url(#${gid})`}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xs font-semibold tabular-nums sm:hidden" aria-hidden>
        {value}
      </span>
      </span>
      <div className="hidden leading-tight sm:block">
        <div className="text-sm font-semibold tabular-nums">{value}%</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

export function BoardHeader({
  title: initialTitle,
  description: initialDescription,
  boardId,
  workspaceId,
  doneCount,
  totalCount,
}: BoardHeaderProps) {
  const { t } = useLanguage()
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription || "")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(initialTitle)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editDescription, setEditDescription] = useState(initialDescription || "")
  const [isSaving, setIsSaving] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [activitiesLoaded, setActivitiesLoaded] = useState(false)

  useEffect(() => {
    if (activityOpen && !activitiesLoaded) {
      fetchActivities(workspaceId).then((data) => {
        setActivities(data)
        setActivitiesLoaded(true)
      })
    }
  }, [activityOpen, activitiesLoaded, workspaceId])

  const handleTitleSave = async () => {
    if (editTitle.trim() === "" || editTitle === title) {
      setIsEditingTitle(false)
      setEditTitle(title)
      return
    }
    setIsSaving(true)
    const result = await updateBoard({ boardId, workspaceId, title: editTitle })
    setIsSaving(false)
    if (result.success) {
      setTitle(editTitle)
      toast.success(t("kanban.boardTitleUpdated"))
    } else {
      setEditTitle(title)
      toast.error(result.error)
    }
    setIsEditingTitle(false)
  }

  const handleDescriptionSave = async () => {
    if (editDescription === description) {
      setIsEditingDescription(false)
      return
    }
    setIsSaving(true)
    const result = await updateBoard({
      boardId,
      workspaceId,
      description: editDescription.trim() === "" ? null : editDescription,
    })
    setIsSaving(false)
    if (result.success) {
      setDescription(editDescription)
      toast.success(t("kanban.boardDescUpdated"))
    } else {
      setEditDescription(description)
      toast.error(result.error)
    }
    setIsEditingDescription(false)
  }

  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div className="mb-3 flex shrink-0 items-start justify-between gap-3 sm:mb-5">
      <div className="flex min-w-0 max-w-2xl flex-col gap-1">
        {isEditingTitle ? (
          <input
            autoFocus
            className="w-full rounded-lg bg-secondary/60 px-1.5 py-0.5 text-2xl font-semibold tracking-tight text-foreground outline-none ring-2 ring-primary/30 sm:text-[1.75rem]"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSave()
              else if (e.key === "Escape") {
                setIsEditingTitle(false)
                setEditTitle(title)
              }
            }}
            disabled={isSaving}
            aria-label={t("ui.rename")}
          />
        ) : (
          <h1 className="min-w-0">
            <button
              type="button"
              className="group -mx-1.5 flex max-w-full items-center gap-2 rounded-lg px-1.5 py-0.5 text-left text-xl font-semibold tracking-tight text-foreground outline-none transition-colors hover:bg-secondary/70 sm:text-2xl focus-visible:ring-2 focus-visible:ring-ring sm:text-[1.75rem]"
              onClick={() => setIsEditingTitle(true)}
              title={t("ui.renameBoardHint")}
            >
              <span className="truncate">{title}</span>
              <Pencil className="hover-reveal size-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          </h1>
        )}

        {isEditingDescription ? (
          <Textarea
            autoFocus
            className="mt-1 min-h-[72px] resize-none text-sm"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onBlur={handleDescriptionSave}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsEditingDescription(false)
                setEditDescription(description)
              }
            }}
            disabled={isSaving}
          />
        ) : (
          <button
            type="button"
            className="group -mx-1.5 flex items-start rounded-md px-1.5 py-0.5 text-left text-sm text-muted-foreground outline-none transition-colors hover:bg-secondary/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setIsEditingDescription(true)}
          >
            <span className={description ? "line-clamp-1 sm:line-clamp-2" : "italic opacity-80"}>
              {description || t("ui.addBoardDescription")}
            </span>
            <Pencil className="hover-reveal ml-1.5 mt-0.5 size-3 shrink-0" aria-hidden />
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <ProgressRing value={pct} label={t("ui.completion", { done: doneCount, total: totalCount })} />
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 px-0 sm:w-auto sm:px-3"
          onClick={() => setActivityOpen(true)}
          aria-label={t("kanban.activityFeed")}
          data-print-hide
        >
          <ActivityIcon className="size-4 text-primary" aria-hidden />
          <span className="hidden sm:inline">{t("kanban.activityFeed")}</span>
        </Button>
      </div>

      <ActivityFeed activities={activities} loading={activityOpen && !activitiesLoaded} open={activityOpen} onOpenChange={setActivityOpen} />
    </div>
  )
}
