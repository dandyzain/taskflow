'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createBoard } from '@/actions/board-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/lib/i18n/language-context';

interface CreateBoardDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBoardDialog({ workspaceId, open, onOpenChange }: CreateBoardDialogProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t('ui.titleRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBoard({ workspaceId, title, description });
      if (result.success) {
        toast.success(t('ui.boardCreated'));
        onOpenChange(false);
        setTitle('');
        setDescription('');
        router.push(`/workspace/${workspaceId}/board/${result.data.boardId}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error(t('ui.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{t('ui.createBoardTitle')}</DialogTitle>
          <DialogDescription>{t('ui.createBoardDesc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="board-title">{t('ui.boardTitleLabel')}</Label>
            <Input
              id="board-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('ui.boardTitlePlaceholder')}
              autoFocus
              maxLength={100}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="board-description">
              {t('ui.boardDescLabel')} <span className="font-normal text-muted-foreground">({t('ui.optional')})</span>
            </Label>
            <Textarea
              id="board-description"
              className="min-h-[88px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('ui.boardDescPlaceholder')}
            />
          </div>
          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {isSubmitting ? t('ui.creating') : t('ui.createBoard')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
