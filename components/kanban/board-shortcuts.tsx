'use client';

import * as React from 'react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface BoardShortcutsProps {
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  onClearFilters: () => void;
  onNewTask?: () => void;
}

/** Board-scoped shortcuts. Global ones (⌘K, ?, [) live in the workspace shell. */
export function BoardShortcuts({ searchInputRef, onClearFilters, onNewTask }: BoardShortcutsProps) {
  useKeyboardShortcuts([
    {
      key: '/',
      action: () => searchInputRef?.current?.focus(),
      description: 'Focus search',
    },
    {
      key: 'n',
      action: () => onNewTask?.(),
      description: 'New task',
      enabled: !!onNewTask,
    },
    {
      key: 'Escape',
      action: () => {
        // Leave Escape to open dialogs/menus
        if (document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"]')) return;
        onClearFilters();
        (document.activeElement as HTMLElement)?.blur();
      },
      description: 'Clear filters',
    },
  ]);

  return null;
}
