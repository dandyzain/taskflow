'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, LayoutDashboard, BarChart3, Plus } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { LogoMark } from '@/components/brand/logo';

interface WorkspaceShellProps {
  workspaceId: string;
  workspaceName: string;
  boards: Array<{ id: string; title: string; description: string | null }>;
  currentUser?: { id: string; name: string; email: string; avatarUrl?: string | null } | null;
  children: React.ReactNode;
}

export function WorkspaceShell({
  workspaceId,
  workspaceName,
  boards,
  currentUser,
  children,
}: WorkspaceShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full pastel-mesh-bg overflow-hidden">
      {/* Mobile Top Navigation Bar (visible below md breakpoint) */}
      <header className="md:hidden flex items-center justify-between px-3.5 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] bg-card/80 backdrop-blur-lg border-b border-border/70 z-30 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-foreground hover:bg-muted/70 shrink-0 active:scale-95"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </Button>

          <Link
            href={`/workspace/${workspaceId}`}
            className="flex items-center gap-2 min-w-0 group"
          >
            <LogoMark className="w-8 h-8 drop-shadow-[0_4px_10px_rgba(139,104,246,0.30)]" />
            <div className="min-w-0">
              <h1 className="font-bold text-xs truncate leading-tight text-foreground group-hover:text-primary transition-colors">
                {workspaceName}
              </h1>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-pastel-mint shrink-0" />
                TaskFlow
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/workspace/${workspaceId}/reports`}
            className="h-8 w-8 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/70 transition-colors"
            title="Reports & Analytics"
          >
            <BarChart3 className="h-4 w-4" />
          </Link>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Desktop Sidebar (visible on md and up) */}
      <aside className="hidden md:flex h-full shrink-0">
        <Sidebar
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          boards={boards}
          currentUser={currentUser}
        />
      </aside>

      {/* Mobile Drawer (Sheet sliding from the left) */}
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetContent
          side="left"
          hideClose
          className="p-0 w-[290px] max-w-[88vw] border-r border-border/80 bg-card/95 backdrop-blur-xl"
        >
          <Sidebar
            workspaceId={workspaceId}
            workspaceName={workspaceName}
            boards={boards}
            currentUser={currentUser}
            className="w-full border-r-0"
            onClose={() => setMobileDrawerOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden h-full flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
