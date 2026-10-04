'use client';

import { useState } from 'react';
import { Check, Tag, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { toggleCardLabel, createLabel } from '@/actions/label-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { LabelItem } from '@/types/kanban';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b',
];

interface LabelPickerProps {
  cardId: string;
  boardId: string;
  workspaceId: string;
  selectedLabels: LabelItem[];
  availableLabels: LabelItem[];
  onLabelsChange: (labels: LabelItem[]) => void;
  onLabelCreated: (label: LabelItem) => void;
}

export function LabelPicker({
  cardId,
  boardId,
  workspaceId,
  selectedLabels,
  availableLabels,
  onLabelsChange,
  onLabelCreated,
}: LabelPickerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSelected = (labelId: string) =>
    selectedLabels.some(l => l.id === labelId);

  const handleToggle = async (label: LabelItem) => {
    const wasSelected = isSelected(label.id);
    const optimisticLabels = wasSelected
      ? selectedLabels.filter(l => l.id !== label.id)
      : [...selectedLabels, label];
    onLabelsChange(optimisticLabels);

    const result = await toggleCardLabel({
      cardId,
      labelId: label.id,
      boardId,
      workspaceId,
    });

    if (!result.success) {
      onLabelsChange(selectedLabels);
      toast.error(result.error);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);

    const result = await createLabel({
      name: newName.trim(),
      color: newColor,
      boardId,
      workspaceId,
    });

    if (result.success) {
      const newLabel: LabelItem = {
        id: result.data.labelId,
        name: newName.trim(),
        color: newColor,
      };
      onLabelCreated(newLabel);
      setNewName('');
      setIsCreating(false);
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-xl text-xs border-border/80 hover:bg-secondary transition-all active:scale-95 font-medium">
          <Tag className="h-3.5 w-3.5 text-primary" />
          Manage Labels
          {selectedLabels.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary">
              {selectedLabels.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 rounded-2xl border-border/80 shadow-pastel bg-card/95 backdrop-blur-md" align="start">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Available Labels</p>
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {availableLabels.map(label => (
            <button
              key={label.id}
              onClick={() => handleToggle(label)}
              className="flex items-center gap-2 w-full rounded-xl px-2.5 py-1.5 text-xs hover:bg-secondary transition-all text-left group"
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: label.color }}
              />
              <span className="flex-1 truncate font-medium text-foreground">{label.name}</span>
              {isSelected(label.id) && (
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
            </button>
          ))}
          {availableLabels.length === 0 && !isCreating && (
            <p className="text-xs text-muted-foreground py-2 text-center italic">
              No labels yet
            </p>
          )}
        </div>

        {isCreating ? (
          <div className="border-t border-border/50 mt-2.5 pt-2.5 space-y-2 animate-scale-in">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New label name..."
              className="h-8 text-xs rounded-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className={cn(
                    'h-5 w-5 rounded-full transition-transform hover:scale-110 shadow-xs',
                    newColor === color && 'ring-2 ring-offset-2 ring-primary scale-110'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-1.5 pt-1">
              <Button
                size="sm"
                className="h-7 text-xs flex-1 rounded-xl font-semibold shadow-xs"
                onClick={handleCreate}
                disabled={isSubmitting || !newName.trim()}
              >
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs rounded-xl"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 w-full rounded-xl px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-all mt-1.5 border-t border-border/50 pt-2 font-medium"
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            Create new label
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
