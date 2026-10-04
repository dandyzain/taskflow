'use client'

import { useState, useEffect } from 'react'
import { Users, Check } from 'lucide-react'
import { toast } from 'sonner'

import type { AssigneeItem } from '@/types/kanban'
import { fetchWorkspaceMembers, toggleCardAssignee } from '@/actions/assignee-actions'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface AssigneePickerProps {
  cardId: string
  boardId: string
  workspaceId: string
  selectedAssignees: AssigneeItem[]
  onAssigneesChange: (assignees: AssigneeItem[]) => void
}

export function AssigneePicker({
  cardId,
  boardId,
  workspaceId,
  selectedAssignees,
  onAssigneesChange,
}: AssigneePickerProps) {
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<AssigneeItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && members.length === 0) {
      setIsLoading(true)
      fetchWorkspaceMembers(workspaceId)
        .then((data) => {
          setMembers(data as AssigneeItem[])
        })
        .catch(() => toast.error('Failed to fetch workspace members'))
        .finally(() => setIsLoading(false))
    }
  }, [open, workspaceId, members.length])

  const handleToggle = async (member: AssigneeItem) => {
    const isAssigned = selectedAssignees.some((a) => a.id === member.id)
    
    // Optimistic update
    const newAssignees = isAssigned
      ? selectedAssignees.filter((a) => a.id !== member.id)
      : [...selectedAssignees, member]
      
    onAssigneesChange(newAssignees)

    try {
      const result = await toggleCardAssignee({
        cardId,
        userId: member.id,
        boardId,
        workspaceId,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to update assignee')
      }
    } catch (error) {
      // Rollback
      onAssigneesChange(selectedAssignees)
      toast.error('Failed to update assignee')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-xl text-xs border-border/80 hover:bg-secondary transition-all active:scale-95 font-medium">
          <Users className="h-3.5 w-3.5 text-primary" />
          Assign Members
          {selectedAssignees.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary">
              {selectedAssignees.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[230px] p-2.5 rounded-2xl border-border/80 shadow-pastel bg-card/95 backdrop-blur-md" align="start">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Workspace Members</p>
        <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-xs text-center text-muted-foreground italic">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="p-3 text-xs text-center text-muted-foreground italic">No members found</div>
          ) : (
            members.map((member) => {
              const isAssigned = selectedAssignees.some((a) => a.id === member.id)
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-xs hover:bg-secondary cursor-pointer transition-all text-left"
                  onClick={() => handleToggle(member)}
                >
                  <div className="w-6 h-6 rounded-full bg-pastel-lavender text-pastel-lavender-text text-[10px] flex items-center justify-center font-bold shrink-0 shadow-xs">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 truncate font-medium text-foreground">{member.name}</span>
                  {isAssigned && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
