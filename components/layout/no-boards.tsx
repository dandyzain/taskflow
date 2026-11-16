'use client';

import { LayoutGrid, Plus } from 'lucide-react';
import { EmptyState } from '@/components/patterns/empty-state';
import { useWorkspace } from '@/components/layout/workspace-context';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/language-context';

export function NoBoards() {
  const { t } = useLanguage();
  const ws = useWorkspace();
  return (
    <div className="flex h-full items-center justify-center p-6">
      <EmptyState
        size="lg"
        icon={LayoutGrid}
        title={t('ui.noBoardsTitle')}
        description={t('ui.noBoardsDesc')}
        action={
          <Button variant="brand" size="lg" onClick={() => ws?.openCreateBoard()}>
            <Plus className="size-4" aria-hidden />
            {t('ui.createBoard')}
          </Button>
        }
      />
    </div>
  );
}
