'use client';

import * as React from 'react';
import { Download, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { useLanguage } from '@/lib/i18n/language-context';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Row({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-foreground">{label}</span>
      <span className="flex shrink-0 items-center gap-1">
        {keys.map((k) => (
          <Kbd key={k} className="h-6 min-w-6 text-xs">
            {k}
          </Kbd>
        ))}
      </span>
    </div>
  );
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{t('shortcuts.title')}</DialogTitle>
          <DialogDescription>{t('shortcuts.description')}</DialogDescription>
        </DialogHeader>

        <section>
          <h3 className="text-xs font-medium text-muted-foreground">{t('shortcuts.global')}</h3>
          <div className="divide-y">
            <Row label={t('ui.openPalette')} keys={['⌘', 'K']} />
            <Row label={t('ui.toggleSidebar')} keys={['[']} />
            <Row label={t('shortcuts.openShortcuts')} keys={['?']} />
            <Row label={t('shortcuts.closeModal')} keys={['Esc']} />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-medium text-muted-foreground">{t('shortcuts.boardNavigation')}</h3>
          <div className="divide-y">
            <Row label={t('shortcuts.focusSearch')} keys={['/']} />
            <Row label={t('shortcuts.newTask')} keys={['N']} />
            <Row label={t('ui.dragHint').split('.')[0]} keys={['Space']} />
          </div>
        </section>

        <a
          href="/TaskFlow-User-Guide.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-xl border bg-secondary/50 p-3 text-sm transition-colors hover:bg-accent"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <FileText className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{t('ui.userGuide')}</span>
            <span className="block text-xs text-muted-foreground">{t('ui.userGuideSub')}</span>
          </span>
          <Download className="size-4 text-muted-foreground transition-transform group-hover:translate-y-0.5" aria-hidden />
        </a>
      </DialogContent>
    </Dialog>
  );
}
