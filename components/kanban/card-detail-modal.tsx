'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Trash2, Calendar, Flag, CalendarDays, Tag, Users, Check, Circle, ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { updateCard, deleteCard } from '@/actions/card-crud-actions';
import { fetchBoardLabels } from '@/actions/fetch-labels-action';
import type { CardItem, LabelItem, AssigneeItem } from '@/types/kanban';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LabelBadge } from '@/components/kanban/label-badge';
import { LabelPicker } from '@/components/kanban/label-picker';
import { AssigneePicker } from './assignee-picker';

interface CardDetailModalProps {
  card: CardItem;
  boardId: string;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCardUpdated: (card: CardItem) => void;
  onCardDeleted: (cardId: string) => void;
}

export function CardDetailModal({
  card,
  boardId,
  workspaceId,
  open,
  onOpenChange,
  onCardUpdated,
  onCardDeleted,
}: CardDetailModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState<number>(card.priority);
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [labels, setLabels] = useState<LabelItem[]>(card.labels || []);
  const [assignees, setAssignees] = useState<AssigneeItem[]>(card.assignees || []);
  const [availableLabels, setAvailableLabels] = useState<LabelItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || '');
    setPriority(card.priority);
    setDueDate(card.dueDate || '');
    setLabels(card.labels || []);
    setAssignees(card.assignees || []);
  }, [card]);

  useEffect(() => {
    if (open) {
      fetchBoardLabels(boardId).then(setAvailableLabels);
    }
  }, [open, boardId]);

  const handleBlurTitle = async () => {
    if (title.trim() === '' || title === card.title) {
      setTitle(card.title);
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateCard({
        cardId: card.id,
        columnId: card.columnId,
        title: title.trim(),
        boardId,
        workspaceId,
      });

      if (result.success) {
        onCardUpdated({ ...card, title: title.trim(), description, priority, dueDate, labels, assignees });
      } else {
        toast.error(result.error);
        setTitle(card.title);
      }
    } catch {
      toast.error('Failed to update title');
      setTitle(card.title);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlurDescription = async () => {
    const trimmed = description.trim();
    if (trimmed === (card.description || '')) return;

    setIsSaving(true);
    try {
      const result = await updateCard({
        cardId: card.id,
        columnId: card.columnId,
        description: trimmed === '' ? null : trimmed,
        boardId,
        workspaceId,
      });

      if (result.success) {
        onCardUpdated({ ...card, title, description: trimmed, priority, dueDate, labels, assignees });
      } else {
        toast.error(result.error);
        setDescription(card.description || '');
      }
    } catch {
      toast.error('Failed to update description');
      setDescription(card.description || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePriorityChange = async (value: string) => {
    const newPriority = parseInt(value, 10);
    setPriority(newPriority);

    setIsSaving(true);
    try {
      const result = await updateCard({
        cardId: card.id,
        columnId: card.columnId,
        priority: newPriority,
        boardId,
        workspaceId,
      });

      if (result.success) {
        onCardUpdated({ ...card, priority: newPriority, title, description, dueDate, labels, assignees });
      } else {
        toast.error(result.error);
        setPriority(card.priority);
      }
    } catch {
      toast.error('Failed to update priority');
      setPriority(card.priority);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDueDateChange = async (value: string) => {
    const newDueDate = value ? new Date(value).toISOString() : null;
    setDueDate(newDueDate || '');

    setIsSaving(true);
    try {
      const result = await updateCard({
        cardId: card.id,
        columnId: card.columnId,
        dueDate: newDueDate,
        boardId,
        workspaceId,
      });

      if (result.success) {
        onCardUpdated({ ...card, dueDate: newDueDate, title, description, priority, labels, assignees });
      } else {
        toast.error(result.error);
        setDueDate(card.dueDate || '');
      }
    } catch {
      toast.error('Failed to update due date');
      setDueDate(card.dueDate || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearDueDate = async () => {
    await handleDueDateChange('');
  };

  const handleLabelsChange = (newLabels: LabelItem[]) => {
    setLabels(newLabels);
    onCardUpdated({ ...card, labels: newLabels, title, description, priority, dueDate, assignees });
  };

  const handleLabelCreated = (newLabel: LabelItem) => {
    setAvailableLabels(prev => [...prev, newLabel]);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    setIsDeleting(true);
    try {
      const result = await deleteCard({
        cardId: card.id,
        columnId: card.columnId,
        boardId,
        workspaceId,
      });

      if (result.success) {
        onCardDeleted(card.id);
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to delete card');
      }
    } catch {
      toast.error('An error occurred while deleting the card');
    } finally {
      setIsDeleting(false);
    }
  };

  const dueDateInput = dueDate ? new Date(dueDate).toISOString().split('T')[0] : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-[540px] rounded-3xl border border-border/80 shadow-pastel bg-card/95 backdrop-blur-xl p-4 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Card Details</DialogTitle>
          <div className="pr-6 pt-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => {
                const len = e.currentTarget.value.length;
                e.currentTarget.setSelectionRange?.(len, len);
              }}
              onBlur={handleBlurTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              className="text-base sm:text-lg font-bold border-none px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-foreground placeholder:text-muted-foreground/60"
              placeholder="Card Title"
            />
          </div>
        </DialogHeader>

        <div className="grid gap-4 sm:gap-5 py-2 sm:py-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Created {new Date(card.createdAt).toLocaleDateString()}</span>
            </div>
            {isSaving && <span className="text-primary text-[11px] font-semibold animate-pulse">Saving changes...</span>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleBlurDescription}
              placeholder="Add more details or notes about this task..."
              className="min-h-[85px] sm:min-h-[100px] resize-none rounded-xl text-xs border-border/80 focus-visible:ring-primary/40 leading-relaxed bg-background/50"
            />
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-1.5 text-xs font-semibold">
              <Tag className="w-3.5 h-3.5 text-primary" /> Labels
            </Label>
            <div className="flex flex-wrap gap-1.5 mb-1 min-h-[24px] items-center">
              {labels.map(l => (
                <LabelBadge key={l.id} label={l} size="sm" />
              ))}
              {labels.length === 0 && (
                <span className="text-xs text-muted-foreground/70 italic">No labels selected</span>
              )}
            </div>
            <LabelPicker
              cardId={card.id}
              boardId={boardId}
              workspaceId={workspaceId}
              selectedLabels={labels}
              availableLabels={availableLabels}
              onLabelsChange={handleLabelsChange}
              onLabelCreated={handleLabelCreated}
            />
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-1.5 text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-primary" /> Assigned Members
            </Label>
            <div className="flex flex-wrap gap-1.5 mb-1 min-h-[24px] items-center">
              {assignees.map(a => (
                <div key={a.id} className="flex items-center gap-1.5 bg-pastel-lavender/40 text-pastel-lavender-text border border-purple-200/50 rounded-full px-2.5 py-0.5 shadow-xs">
                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium">{a.name}</span>
                </div>
              ))}
              {assignees.length === 0 && (
                <span className="text-xs text-muted-foreground/70 italic">No members assigned</span>
              )}
            </div>
            <AssigneePicker
              cardId={card.id}
              boardId={boardId}
              workspaceId={workspaceId}
              selectedAssignees={assignees}
              onAssigneesChange={(newAssignees) => {
                setAssignees(newAssignees);
                onCardUpdated({ ...card, assignees: newAssignees, labels, dueDate: dueDate || null });
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
            <div className="grid gap-1.5">
              <Label htmlFor="dueDate" className="flex items-center gap-1.5 text-xs font-semibold">
                <CalendarDays className="w-3.5 h-3.5 text-primary" /> Due Date
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDateInput}
                  onChange={(e) => handleDueDateChange(e.target.value)}
                  className="h-9 text-xs rounded-xl border-border/80 bg-background/50 focus-visible:ring-primary/40 flex-1"
                />
                {dueDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearDueDate}
                    className="h-9 px-2 text-xs text-muted-foreground hover:text-destructive rounded-xl shrink-0"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="priority" className="flex items-center gap-1.5 text-xs font-semibold">
                <Flag className="w-3.5 h-3.5 text-primary" /> Priority
              </Label>
              <Select value={priority.toString()} onValueChange={handlePriorityChange}>
                <SelectTrigger id="priority" className="h-9 text-xs rounded-xl border-border/80 bg-background/50 focus:ring-primary/40">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/80 shadow-pastel">
                  <SelectItem value="0" className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <Circle className="h-2.5 w-2.5 text-muted-foreground/60 shrink-0" />
                      <span>None</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="1" className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <ArrowDown className="h-3 w-3 text-sky-500 shrink-0" />
                      <span>Low Priority</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="2" className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <ArrowRight className="h-3 w-3 text-amber-500 shrink-0" />
                      <span>Medium Priority</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="3" className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <ArrowUp className="h-3 w-3 text-rose-500 shrink-0" />
                      <span>High Priority</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between gap-2 pt-3 border-t border-border/50">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-xl h-9 text-xs font-semibold hover:shadow-xs active:scale-95 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Card
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary" size="sm" className="rounded-xl h-9 text-xs font-semibold active:scale-95 transition-all">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
