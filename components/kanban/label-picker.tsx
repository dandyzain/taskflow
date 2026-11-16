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
import { useLanguage } from '@/lib/i18n/language-context';

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
  const { t } = useLanguage();
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
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Tag className="size-3.5 text-muted-foreground" aria-hidden />
          {t('ui.manageLabels')}
          {selectedLabels.length > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-2xs font-semibold tabular-nums text-accent-foreground">
              {selectedLabels.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <p className="px-2 pb-1.5 pt-1 text-xs font-medium text-muted-foreground">{t('ui.availableLabels')}</p>
        <div className="max-h-[220px] space-y-0.5 overflow-y-auto" role="listbox" aria-multiselectable="true">
          {availableLabels.map(label => (
            <button
              key={label.id}
              type="button"
              role="option"
              aria-selected={isSelected(label.id)}
              onClick={() => handleToggle(label)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
            >
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: label.color }} aria-hidden />
              <span className="flex-1 truncate">{label.name}</span>
              {isSelected(label.id) && <Check className="size-4 shrink-0 text-primary" aria-hidden />}
            </button>
          ))}
          {availableLabels.length === 0 && !isCreating && (
            <p className="py-3 text-center text-sm text-muted-foreground">{t('ui.noLabelsYet')}</p>
          )}
        </div>

        {isCreating ? (
          <div className="mt-2 animate-scale-in space-y-2 border-t pt-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('ui.newLabelName')}
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5 px-0.5" role="radiogroup" aria-label="Color">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={newColor === color}
                  aria-label={color}
                  onClick={() => setNewColor(color)}
                  className={cn(
                    'size-6 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    newColor === color && 'scale-110 ring-2 ring-foreground/70 ring-offset-2 ring-offset-popover'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" className="flex-1" onClick={handleCreate} disabled={isSubmitting || !newName.trim()}>
                {t('ui.createLabel')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="mt-1 flex w-full items-center gap-2 rounded-lg border-t px-2 py-2 pt-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Plus className="size-4" aria-hidden />
            {t('ui.newLabel')}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
