'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-border/80 shadow-pastel bg-card/95 backdrop-blur-xl sm:max-w-[440px]">
        <DialogTitle className="text-lg font-bold text-foreground">Keyboard Shortcuts</DialogTitle>
        <div className="flex flex-col space-y-4 pt-1">
          <div>
            <h3 className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Navigation</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between py-1 px-2 rounded-xl bg-secondary/40 text-xs">
                <span className="font-medium text-foreground">Focus search bar</span>
                <kbd className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-card px-2 py-0.5 text-xs font-mono font-semibold text-primary shadow-2xs">/</kbd>
              </div>
              <div className="flex items-center justify-between py-1 px-2 rounded-xl bg-secondary/40 text-xs">
                <span className="font-medium text-foreground">Close dialog / Reset filters</span>
                <kbd className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-card px-2 py-0.5 text-xs font-mono font-semibold text-primary shadow-2xs">Esc</kbd>
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Board Help</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between py-1 px-2 rounded-xl bg-secondary/40 text-xs">
                <span className="font-medium text-foreground">Show shortcuts modal</span>
                <kbd className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-card px-2 py-0.5 text-xs font-mono font-semibold text-primary shadow-2xs">?</kbd>
              </div>
            </div>
          </div>

          {/* Quick PDF download banner */}
          <div className="mt-2 pt-3 border-t border-border/50">
            <a
              href="/TaskFlow-User-Guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-all text-xs group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">PDF User Guide</div>
                  <div className="text-[10px] text-muted-foreground">Download complete documentation</div>
                </div>
              </div>
              <Download className="w-3.5 h-3.5 text-primary group-hover:translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
