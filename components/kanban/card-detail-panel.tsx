'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { toast } from 'sonner';
import { CalendarDays, Check, CircleDashed, Flag, Loader2, Tag, Trash2, Users, X } from 'lucide-react';
import { updateCard } from '@/actions/card-crud-actions';
import { fetchBoardLabels } from '@/actions/fetch-labels-action';
import type { AssigneeItem, CardItem, LabelItem } from '@/types/kanban';
import { AssigneePicker } from '@/components/kanban/assignee-picker';
import { LabelBadge } from '@/components/kanban/label-badge';
import { LabelPicker } from '@/components/kanban/label-picker';
import { DueChip } from '@/components/patterns/due-chip';
import { PriorityBadge } from '@/components/patterns/priority-badge';
import { UserAvatar } from '@/components/patterns/user-avatar';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { getStatus, PRIORITY_ORDER } from '@/lib/design/tokens';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

interface CardDetailPanelProps {
  card: CardItem | null;
  columnTitle: string;
  boardId: string;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCardUpdated: (card: CardItem) => void;
  /** The board owns deletion so it can offer "Undo" */
  onRequestDelete: (card: CardItem) => void;
}

type SaveState = 'idle' | 'saving' | 'saved';

function Property({ icon: Icon, label, children }: { icon: typeof Flag; label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-start gap-3 py-2 max-[380px]:grid-cols-1 max-[380px]:gap-1.5">
      <span className="flex h-8 items-center gap-2 text-sm text-muted-foreground max-[380px]:h-auto">
        <Icon className="size-4 shrink-0" aria-hidden />
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function CardDetailBody({
  card,
  columnTitle,
  boardId,
  workspaceId,
  open,
  onClose,
  onCardUpdated,
  onRequestDelete,
}: Omit<CardDetailPanelProps, 'onOpenChange' | 'card'> & { card: CardItem; onClose: () => void }) {
  const { t, lang } = useLanguage();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState<number>(card.priority);
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [labels, setLabels] = useState<LabelItem[]>(card.labels || []);
  const [assignees, setAssignees] = useState<AssigneeItem[]>(card.assignees || []);
  const [availableLabels, setAvailableLabels] = useState<LabelItem[]>([]);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const savedTimer = useRef<number | undefined>(undefined);
  const status = getStatus(columnTitle);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || '');
    setPriority(card.priority);
    setDueDate(card.dueDate || '');
    setLabels(card.labels || []);
    setAssignees(card.assignees || []);
  }, [card]);

  useEffect(() => {
    if (open) fetchBoardLabels(boardId).then(setAvailableLabels);
  }, [open, boardId]);

  useEffect(() => () => window.clearTimeout(savedTimer.current), []);

  /** Runs an update through the existing server action with save-state feedback. */
  const persist = async (
    patch: { title?: string; description?: string | null; priority?: number; dueDate?: string | null },
    next: Partial<CardItem>,
    rollback: () => void
  ) => {
    setSaveState('saving');
    try {
      const result = await updateCard({ cardId: card.id, columnId: card.columnId, boardId, workspaceId, ...patch });
      if (result.success) {
        onCardUpdated({ ...card, title, description, priority, dueDate: dueDate || null, labels, assignees, ...next });
        setSaveState('saved');
        window.clearTimeout(savedTimer.current);
        savedTimer.current = window.setTimeout(() => setSaveState('idle'), 1600);
      } else {
        toast.error(result.error);
        rollback();
        setSaveState('idle');
      }
    } catch {
      toast.error(t('ui.updateFailed'));
      rollback();
      setSaveState('idle');
    }
  };

  const handleBlurTitle = () => {
    const trimmed = title.trim();
    if (trimmed === '' || trimmed === card.title) {
      setTitle(card.title);
      return;
    }
    persist({ title: trimmed }, { title: trimmed }, () => setTitle(card.title));
  };

  const handleBlurDescription = () => {
    const trimmed = description.trim();
    if (trimmed === (card.description || '')) return;
    persist(
      { description: trimmed === '' ? null : trimmed },
      { description: trimmed },
      () => setDescription(card.description || '')
    );
  };

  const handlePriorityChange = (value: string) => {
    const newPriority = parseInt(value, 10);
    setPriority(newPriority);
    persist({ priority: newPriority }, { priority: newPriority }, () => setPriority(card.priority));
  };

  const handleDueDateChange = (value: string) => {
    const newDueDate = value ? new Date(value).toISOString() : null;
    setDueDate(newDueDate || '');
    persist({ dueDate: newDueDate }, { dueDate: newDueDate }, () => setDueDate(card.dueDate || ''));
  };

  const handleLabelsChange = (newLabels: LabelItem[]) => {
    setLabels(newLabels);
    onCardUpdated({ ...card, labels: newLabels, title, description, priority, dueDate: dueDate || null, assignees });
  };

  const dueDateInput = dueDate ? new Date(dueDate).toISOString().split('T')[0] : '';

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b px-4 py-3 sm:px-5">
        <span
          className={cn(
            'inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium',
            status.soft,
            status.text
          )}
        >
          <span className={cn('size-2 rounded-full', status.dot)} aria-hidden />
          {columnTitle}
        </span>
        <AnimatePresence mode="wait">
          {saveState !== 'idle' && (
            <m.span
              key={saveState}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-xs text-muted-foreground"
              aria-live="polite"
            >
              {saveState === 'saving' ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Check className="size-3.5 text-success" aria-hidden />
              )}
              {saveState === 'saving' ? t('ui.saving') : t('ui.saved')}
            </m.span>
          )}
        </AnimatePresence>
        <Button variant="ghost" size="icon-sm" className="ml-auto" onClick={onClose} aria-label={t('common.close')}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-5">
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlurTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          rows={1}
          aria-label={t('common.title')}
          placeholder={t('common.title')}
          className="w-full resize-none rounded-lg bg-transparent px-1 py-1 text-xl font-semibold leading-snug tracking-tight outline-none [field-sizing:content] hover:bg-secondary/60 focus:bg-secondary/60"
        />
        <p className="mt-1 px-1 text-xs text-muted-foreground">
          {t('ui.createdOn', {
            date: new Date(card.createdAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
          })}
        </p>

        <div className="mt-4 divide-y border-y">
          <Property icon={Flag} label={t('common.priority')}>
            <Select value={priority.toString()} onValueChange={handlePriorityChange}>
              <SelectTrigger className="h-8 w-auto min-w-[9rem] border-transparent bg-transparent px-1.5 shadow-none hover:bg-secondary" aria-label={t('common.priority')}>
                <SelectValue placeholder={t('ui.selectPriority')} />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_ORDER.map((level) => (
                  <SelectItem key={level} value={String(level)}>
                    <PriorityBadge priority={level} hideNone={false} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Property>

          <Property icon={CalendarDays} label={t('common.dueDate')}>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                value={dueDateInput}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="h-8 w-auto"
                aria-label={t('common.dueDate')}
              />
              {dueDate && <DueChip date={dueDate} />}
              {dueDate && (
                <Button variant="ghost" size="sm" onClick={() => handleDueDateChange('')} className="text-muted-foreground">
                  {t('ui.clear')}
                </Button>
              )}
            </div>
          </Property>

          <Property icon={Users} label={t('common.assignees')}>
            <div className="flex flex-wrap items-center gap-1.5">
              {assignees.map((a) => (
                <span key={a.id} className="inline-flex h-8 items-center gap-1.5 rounded-full border bg-card pl-1 pr-2.5 text-sm">
                  <UserAvatar user={a} size="sm" />
                  {a.name}
                </span>
              ))}
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
          </Property>

          <Property icon={Tag} label={t('common.labels')}>
            <div className="flex flex-wrap items-center gap-1.5">
              {labels.map((l) => (
                <LabelBadge key={l.id} label={l} size="md" />
              ))}
              <LabelPicker
                cardId={card.id}
                boardId={boardId}
                workspaceId={workspaceId}
                selectedLabels={labels}
                availableLabels={availableLabels}
                onLabelsChange={handleLabelsChange}
                onLabelCreated={(l) => setAvailableLabels((prev) => [...prev, l])}
              />
            </div>
          </Property>

          <Property icon={CircleDashed} label={t('ui.status')}>
            <span className="flex h-8 items-center text-sm">{columnTitle}</span>
          </Property>
        </div>

        <div className="mt-5 space-y-2">
          <label htmlFor={`desc-${card.id}`} className="text-sm font-medium">
            {t('common.description')}
          </label>
          <textarea
            id={`desc-${card.id}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleBlurDescription}
            placeholder={t('cardModal.editDescPrompt')}
            className="min-h-[140px] w-full resize-y rounded-xl border bg-card px-3.5 py-3 text-sm leading-relaxed outline-none transition-[border-color,box-shadow] duration-quick placeholder:text-muted-foreground/80 hover:border-border-strong focus:border-primary/60 focus:ring-4 focus:ring-primary/15"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
        <Button variant="ghost" size="sm" className="text-danger hover:bg-danger-soft hover:text-danger" onClick={() => onRequestDelete(card)}>
          <Trash2 className="size-4" aria-hidden />
          {t('common.delete')}
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>
          {t('common.close')}
        </Button>
      </div>
    </div>
  );
}

export function CardDetailPanel(props: CardDetailPanelProps) {
  const { card, open, onOpenChange } = props;
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { t } = useLanguage();
  // Keep the last card rendered while the panel animates closed
  const lastCard = useRef<CardItem | null>(card);
  if (card) lastCard.current = card;
  const shown = card ?? lastCard.current;
  if (!shown) return null;

  const body = <CardDetailBody {...props} card={shown} onClose={() => onOpenChange(false)} />;

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          hideClose
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="w-[520px] max-w-[92vw] p-0 sm:max-w-[520px]"
        >
          <SheetTitle className="sr-only">{t('cardModal.taskDetails')}</SheetTitle>
          <SheetDescription className="sr-only">{shown.title}</SheetDescription>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent className="h-[92dvh]">
        <DrawerTitle className="sr-only">{t('cardModal.taskDetails')}</DrawerTitle>
        <DrawerDescription className="sr-only">{shown.title}</DrawerDescription>
        {body}
      </DrawerContent>
    </Drawer>
  );
}
