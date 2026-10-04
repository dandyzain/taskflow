'use client';

import * as React from 'react';
import { useState } from 'react';
import { Keyboard } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface BoardShortcutsProps {
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  onClearFilters: () => void;
}

export function BoardShortcuts({ searchInputRef, onClearFilters }: BoardShortcutsProps) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useKeyboardShortcuts([
    {
      key: '/',
      action: () => searchInputRef?.current?.focus(),
      description: 'Focus search',
    },
    {
      key: 'Escape',
      action: () => {
        onClearFilters();
        (document.activeElement as HTMLElement)?.blur();
      },
      description: 'Clear filters / Close',
    },
    {
      key: '?',
      shiftKey: true,
      action: () => setShortcutsOpen(prev => !prev),
      description: 'Keyboard shortcuts',
    },
  ]);

  return (
    <>
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <div className="fixed bottom-4 right-4 z-40">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="h-9 w-9 rounded-full shadow-pastel bg-card/85 backdrop-blur-md border border-border/80 hover:bg-secondary hover:scale-110 active:scale-95 transition-all text-primary shadow-xs"
                onClick={() => setShortcutsOpen(true)}
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Keyboard shortcuts (?)
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}
