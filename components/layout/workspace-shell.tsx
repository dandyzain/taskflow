'use client';

import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Menu, Search } from 'lucide-react';
import { Sidebar, type SidebarState } from '@/components/layout/sidebar';
import { CommandPalette } from '@/components/layout/command-palette';
import { MobileTabBar } from '@/components/layout/mobile-tab-bar';
import { AccountDrawer } from '@/components/layout/account-drawer';
import { CreateBoardDialog } from '@/components/layout/create-board-dialog';
import {
  WorkspaceProvider,
  type BoardBridge,
  type ShellBoard,
  type ShellUser,
} from '@/components/layout/workspace-context';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LogoMark } from '@/components/brand/logo';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useLanguage } from '@/lib/i18n/language-context';

interface WorkspaceShellProps {
  workspaceId: string;
  workspaceName: string;
  boards: ShellBoard[];
  currentUser?: ShellUser | null;
  children: React.ReactNode;
}

const SIDEBAR_KEY = 'taskflow_sidebar';

function isTypingTarget(el: EventTarget | null) {
  const node = el as HTMLElement | null;
  return !!node && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' || node.isContentEditable);
}

export function WorkspaceShell({ workspaceId, workspaceName, boards, currentUser, children }: WorkspaceShellProps) {
  const { t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [bridge, setBridge] = useState<BoardBridge | null>(null);
  const [sidebarState, setSidebarState] = useState<SidebarState>('auto');
  const isXl = useMediaQuery('(min-width: 1280px)');

  // Restore the user's explicit sidebar preference (if any)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_KEY);
      if (saved === 'expanded' || saved === 'collapsed') setSidebarState(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const isRail = sidebarState === 'collapsed' || (sidebarState === 'auto' && !isXl);

  const toggleSidebar = useCallback(() => {
    setSidebarState(() => {
      const next: SidebarState = isRail ? 'expanded' : 'collapsed';
      try {
        localStorage.setItem(SIDEBAR_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [isRail]);

  // Global shortcuts: ⌘K palette, [ sidebar, ? help
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      if (e.key === '[') {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleSidebar]);

  const ctx = useMemo(
    () => ({
      workspaceId,
      workspaceName,
      boards,
      currentUser: currentUser ?? null,
      openPalette: () => setPaletteOpen(true),
      openCreateBoard: () => setCreateBoardOpen(true),
      openShortcuts: () => setShortcutsOpen(true),
      bridge,
      setBridge,
    }),
    [workspaceId, workspaceName, boards, currentUser, bridge]
  );

  const sharedSidebarProps = {
    workspaceId,
    workspaceName,
    boards,
    currentUser,
    onOpenPalette: () => setPaletteOpen(true),
    onCreateBoard: () => setCreateBoardOpen(true),
    onOpenShortcuts: () => setShortcutsOpen(true),
  };

  return (
    <WorkspaceProvider value={ctx}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow-e2"
      >
        {t('ui.skipToContent')}
      </a>
      <div className="app-canvas flex h-[100dvh] w-full flex-col overflow-hidden md:flex-row">
        {/* Mobile top bar */}
        <header
          data-mobile-header
          className="glass-panel z-30 flex shrink-0 items-center gap-2 border-b px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden"
        >
          <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(true)} aria-label={t('ui.openMenu')}>
            <Menu className="size-5" />
          </Button>
          <Link href={`/workspace/${workspaceId}`} className="flex min-w-0 flex-1 items-center gap-2">
            <LogoMark className="size-7" title="" />
            <span className="truncate text-sm font-semibold">{workspaceName}</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} aria-label={t('ui.search')}>
            <Search className="size-5" />
          </Button>
        </header>

        {/* Desktop / tablet sidebar */}
        <aside className="hidden h-full shrink-0 md:flex">
          <Sidebar {...sharedSidebarProps} state={sidebarState} isRail={isRail} onToggle={toggleSidebar} />
        </aside>

        {/* Mobile navigation drawer */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="left" hideClose className="w-[296px] max-w-[86vw] border-r-0 p-0">
            <SheetTitle className="sr-only">{t('ui.navigation')}</SheetTitle>
            <SheetDescription className="sr-only">{workspaceName}</SheetDescription>
            <Sidebar
              {...sharedSidebarProps}
              state="expanded"
              className="w-full border-r-0 bg-card"
              onClose={() => setDrawerOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <main
          id="main-content"
          tabIndex={-1}
          data-print-expand
          className="flex h-full min-w-0 flex-1 flex-col overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] outline-none md:pb-0"
        >
          {children}
        </main>

        <MobileTabBar
          workspaceId={workspaceId}
          onBoards={() => setDrawerOpen(true)}
          onSearch={() => setPaletteOpen(true)}
          onCreate={() => (bridge ? bridge.newTask() : setCreateBoardOpen(true))}
          onAccount={() => setAccountOpen(true)}
        />
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        workspaceId={workspaceId}
        boards={boards}
        bridge={bridge}
        onCreateBoard={() => setCreateBoardOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />
      <CreateBoardDialog workspaceId={workspaceId} open={createBoardOpen} onOpenChange={setCreateBoardOpen} />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <AccountDrawer
        open={accountOpen}
        onOpenChange={setAccountOpen}
        user={currentUser ?? null}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />
    </WorkspaceProvider>
  );
}
