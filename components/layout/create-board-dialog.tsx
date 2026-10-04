'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createBoard } from '@/actions/board-actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateBoardDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBoardDialog({ workspaceId, open, onOpenChange }: CreateBoardDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBoard({ workspaceId, title, description });
      
      if (result.success) {
        toast.success('Board created successfully');
        onOpenChange(false);
        setTitle('');
        setDescription('');
        router.push(`/workspace/${workspaceId}/board/${result.data.boardId}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl border border-border/80 shadow-pastel bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold text-foreground">Create New Board</DialogTitle>
          <DialogDescription className="text-xs">
            Add a new Kanban board to organize your tasks in this workspace
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Board Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint 24, Marketing Campaign..."
              autoFocus
              className="rounded-xl h-9 text-xs border-border/80 focus-visible:ring-primary/40 bg-background/60"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              className="min-h-[80px] rounded-xl text-xs border-border/80 focus-visible:ring-primary/40 leading-relaxed bg-background/60 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this board dedicated to?"
            />
          </div>
          <DialogFooter className="pt-2 border-t border-border/50 gap-1.5">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
              className="rounded-xl h-9 text-xs font-semibold active:scale-95 transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim()}
              className="rounded-xl h-9 text-xs font-semibold shadow-xs hover:shadow-pastel active:scale-95 transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Create Board'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
