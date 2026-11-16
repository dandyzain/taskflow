'use client'

import { useState, useEffect } from 'react'
import { Users, Check } from 'lucide-react'
import { toast } from 'sonner'

import type { AssigneeItem } from '@/types/kanban'
import { fetchWorkspaceMembers, toggleCardAssignee } from '@/actions/assignee-actions'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { UserAvatar } from '@/components/patterns/user-avatar'
import { useLanguage } from '@/lib/i18n/language-context'

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
  const { t } = useLanguage()
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
        .catch(() => toast.error(t('ui.fetchMembersFailed')))
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
      toast.error(t('ui.assigneeUpdateFailed'))
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Users className="size-3.5 text-muted-foreground" aria-hidden />
          {t('ui.assignMembers')}
          {selectedAssignees.length > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-2xs font-semibold tabular-nums text-accent-foreground">
              {selectedAssignees.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2" align="start">
        <p className="px-2 pb-1.5 pt-1 text-xs font-medium text-muted-foreground">{t('ui.workspaceMembers')}</p>
        <div className="flex max-h-[240px] flex-col gap-0.5 overflow-y-auto" role="listbox" aria-multiselectable="true">
          {isLoading ? (
            <div className="p-3 text-center text-sm text-muted-foreground">{t('ui.loadingMembers')}</div>
          ) : members.length === 0 ? (
            <div className="p-3 text-center text-sm text-muted-foreground">{t('ui.noMembers')}</div>
          ) : (
            members.map((member) => {
              const isAssigned = selectedAssignees.some((a) => a.id === member.id)
              return (
                <button
                  key={member.id}
                  type="button"
                  role="option"
                  aria-selected={isAssigned}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                  onClick={() => handleToggle(member)}
                >
                  <UserAvatar user={member} size="sm" />
                  <span className="flex-1 truncate">{member.name}</span>
                  {isAssigned && <Check className="size-4 shrink-0 text-primary" aria-hidden />}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
