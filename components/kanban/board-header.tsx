'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { Activity as ActivityIcon, Pencil, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { updateBoard } from "@/actions/board-actions"
import { fetchActivities } from "@/actions/activity-actions"
import type { ActivityItem } from "@/lib/queries/activity-queries"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ActivityFeed } from "./activity-feed"

interface BoardHeaderProps {
  title: string
  description: string | null
  boardId: string
  workspaceId: string
}

export function BoardHeader({ title: initialTitle, description: initialDescription, boardId, workspaceId }: BoardHeaderProps) {
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
      fetchActivities(workspaceId).then(data => {
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
      toast.success("Board title updated")
    } else {
      setEditTitle(title)
      toast.error(result.error)
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleSave()
    } else if (e.key === "Escape") {
      setIsEditingTitle(false)
      setEditTitle(title)
    }
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
      description: editDescription.trim() === "" ? null : editDescription 
    })
    setIsSaving(false)

    if (result.success) {
      setDescription(editDescription)
      toast.success("Board description updated")
    } else {
      setEditDescription(description)
      toast.error(result.error)
    }
    setIsEditingDescription(false)
  }

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setIsEditingDescription(false)
      setEditDescription(description)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-5 pb-3 border-b border-border/50 shrink-0">
      <div className="flex flex-col gap-1 w-full max-w-2xl min-w-0">
        {isEditingTitle ? (
          <input
            autoFocus
            className="h-auto text-xl sm:text-2xl font-bold border-none bg-transparent outline-none focus:ring-0 p-0 text-foreground w-full"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            disabled={isSaving}
          />
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 
              className="text-xl sm:text-2xl font-bold tracking-tight cursor-pointer hover:opacity-85 transition-all flex items-center gap-2 group text-foreground truncate"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename board"
            >
              <span className="truncate">{title}</span>
              <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/60 hover-reveal shrink-0" />
            </h1>
          </div>
        )}

        {isEditingDescription ? (
          <Textarea
            autoFocus
            className="min-h-[70px] resize-none mt-1 rounded-xl text-xs"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onBlur={handleDescriptionSave}
            onKeyDown={handleDescriptionKeyDown}
            disabled={isSaving}
          />
        ) : (
          <div 
            className="cursor-pointer group flex items-start mt-0.5"
            onClick={() => setIsEditingDescription(true)}
          >
            {description ? (
              <p className="text-muted-foreground text-xs leading-relaxed hover:opacity-85 transition-opacity line-clamp-2 sm:line-clamp-none">
                {description}
              </p>
            ) : (
              <p className="text-muted-foreground/60 text-xs italic group-hover:text-muted-foreground transition-colors">
                Add a description for this board...
              </p>
            )}
            <Pencil className="h-3 w-3 ml-1.5 hover-reveal text-muted-foreground shrink-0 mt-0.5" />
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="gap-2 shrink-0 rounded-xl bg-card/80 hover:bg-accent border-border/70 shadow-xs hover:shadow-sm transition-all duration-200 active:scale-95 text-xs font-medium self-end sm:self-auto h-8 sm:h-9"
        onClick={() => setActivityOpen(true)}
      >
        <ActivityIcon className="h-3.5 w-3.5 text-primary" />
        <span>Activity Feed</span>
      </Button>

      <ActivityFeed 
        activities={activities} 
        open={activityOpen} 
        onOpenChange={setActivityOpen} 
      />
    </div>
  )
}
