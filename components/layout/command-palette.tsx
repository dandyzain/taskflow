'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  BarChart3,
  CircleDot,
  Keyboard,
  Languages,
  LayoutGrid,
  LogOut,
  Monitor,
  Moon,
  Plus,
  SquarePen,
  Sun,
} from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { useLogout } from '@/components/layout/account-menu';
import type { BoardBridge, ShellBoard } from '@/components/layout/workspace-context';
import { PriorityBadge } from '@/components/patterns/priority-badge';
import { avatarTone, getStatus } from '@/lib/design/tokens';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  boards: ShellBoard[];
  bridge: BoardBridge | null;
  onCreateBoard: () => void;
  onOpenShortcuts: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  workspaceId,
  boards,
  bridge,
  onCreateBoard,
  onOpenShortcuts,
}: CommandPaletteProps) {
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();
  const { setTheme } = useTheme();
  const logout = useLogout();

  /** Close first so focus returns cleanly, then act on the next frame. */
  const run = (fn: () => void) => {
    onOpenChange(false);
    requestAnimationFrame(fn);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-[12dvh] translate-y-0 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%] max-w-xl overflow-hidden p-0 gap-0 [&>button:last-child]:hidden"
      >
        <DialogTitle className="sr-only">{t('ui.search')}</DialogTitle>
        <DialogDescription className="sr-only">{t('ui.commandPlaceholder')}</DialogDescription>
        <Command loop>
          <CommandInput placeholder={t('ui.commandPlaceholder')} autoFocus />
          <CommandList>
            <CommandEmpty>{t('ui.commandEmpty')}</CommandEmpty>

            {bridge && bridge.cards.length > 0 && (
              <CommandGroup heading={t('ui.tasks')}>
                {bridge.cards.map((card) => {
                  const status = getStatus(card.columnTitle);
                  return (
                    <CommandItem
                      key={card.id}
                      value={`task ${card.title} ${card.columnTitle} ${card.id}`}
                      onSelect={() => run(() => bridge.openCard(card.id))}
                    >
                      <span className={cn('size-2 shrink-0 rounded-full', status.dot)} aria-hidden />
                      <span className="flex-1 truncate">{card.title}</span>
                      <PriorityBadge priority={card.priority} compact />
                      <span className="hidden text-xs text-muted-foreground xs:inline">{card.columnTitle}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            <CommandGroup heading={t('ui.navigation')}>
              {boards.map((board) => (
                <CommandItem
                  key={board.id}
                  value={`board ${board.title} ${board.id}`}
                  onSelect={() => run(() => router.push(`/workspace/${workspaceId}/board/${board.id}`))}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-md text-2xs font-semibold',
                      avatarTone(board.id)
                    )}
                  >
                    {board.title.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 truncate">{board.title}</span>
                  <LayoutGrid className="text-muted-foreground" aria-hidden />
                </CommandItem>
              ))}
              <CommandItem
                value="reports dashboard analytics laporan"
                onSelect={() => run(() => router.push(`/workspace/${workspaceId}/reports`))}
              >
                <BarChart3 />
                {t('ui.goToReports')}
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />
            <CommandGroup heading={t('ui.actions')}>
              {bridge && (
                <CommandItem value="new task create card tugas baru" onSelect={() => run(bridge.newTask)}>
                  <SquarePen />
                  {t('ui.newTask')}
                  <Kbd className="ml-auto">N</Kbd>
                </CommandItem>
              )}
              <CommandItem value="new board create board baru" onSelect={() => run(onCreateBoard)}>
                <Plus />
                {t('ui.newBoard')}
              </CommandItem>
              <CommandItem value="keyboard shortcuts help pintasan" onSelect={() => run(onOpenShortcuts)}>
                <Keyboard />
                {t('ui.keyboardShortcuts')}
                <Kbd className="ml-auto">?</Kbd>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />
            <CommandGroup heading={t('ui.preferences')}>
              <CommandItem value="theme light terang" onSelect={() => run(() => setTheme('light'))}>
                <Sun />
                {t('ui.lightMode')}
              </CommandItem>
              <CommandItem value="theme dark gelap" onSelect={() => run(() => setTheme('dark'))}>
                <Moon />
                {t('ui.darkMode')}
              </CommandItem>
              <CommandItem value="theme system sistem" onSelect={() => run(() => setTheme('system'))}>
                <Monitor />
                {t('ui.systemTheme')}
              </CommandItem>
              <CommandItem
                value="language bahasa english indonesia"
                onSelect={() => run(() => setLang(lang === 'en' ? 'id' : 'en'))}
              >
                <Languages />
                {t('ui.switchLanguage')}
              </CommandItem>
              <CommandItem value="logout sign out keluar" onSelect={() => run(logout)}>
                <LogOut />
                {t('nav.logout')}
              </CommandItem>
            </CommandGroup>
          </CommandList>
          <div className="hidden items-center gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground sm:flex">
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd>
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <CircleDot className="size-3" aria-hidden /> TaskFlow
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
