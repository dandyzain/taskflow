'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { LayoutDashboard, Plus, Trash2, LogOut, User as UserIcon, Sparkles, BarChart3, X } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useLanguage } from '@/lib/i18n/language-context';
import { LogoMark } from '@/components/brand/logo';
import { CreateBoardDialog } from '@/components/layout/create-board-dialog';
import { deleteBoard } from '@/actions/board-actions';
import { logoutUser } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  workspaceId: string;
  workspaceName: string;
  boards: Array<{ id: string; title: string; description: string | null }>;
  currentBoardId?: string;
  currentUser?: { id: string; name: string; email: string; avatarUrl?: string | null } | null;
  className?: string;
  /** Provided when rendered inside the mobile drawer; shows a close button. */
  onClose?: () => void;
}

export function Sidebar({ workspaceId, workspaceName, boards, currentBoardId, currentUser, className, onClose }: SidebarProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const activeBoardId = (params?.boardId as string) || currentBoardId;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { t } = useLanguage();

  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('Delete this board and all its data?')) return;

    const isCurrentBoard = activeBoardId === boardId;
    const remainingBoards = boards.filter((b) => b.id !== boardId);

    const result = await deleteBoard({ boardId, workspaceId });
    if (result.success) {
      toast.success('Board deleted successfully');
      if (isCurrentBoard) {
        if (remainingBoards.length > 0) {
          router.replace(`/workspace/${workspaceId}/board/${remainingBoards[0].id}`);
        } else {
          router.replace(`/workspace/${workspaceId}`);
        }
      }
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await logoutUser();
      if (res.success) {
        toast.success('Logged out successfully');
        router.push('/login');
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className={cn("h-full w-[272px] border-r border-border/70 bg-card/70 backdrop-blur-md flex flex-col justify-between shadow-xs", className)}>
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Workspace Brand Header */}
        <div className="p-4 pt-[max(1rem,env(safe-area-inset-top))] border-b border-border/50 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <LogoMark className="w-9 h-9 shrink-0 drop-shadow-[0_4px_10px_rgba(139,104,246,0.30)]" />
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm truncate leading-tight text-foreground" title={workspaceName}>
                {workspaceName}
              </h2>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium mt-0.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-pastel-mint shrink-0" />
                {t('nav.activeWorkspace')}
              </span>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 shrink-0"
              onClick={onClose}
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Main Navigation (Dashboard & Reports) */}
        <div className="p-3 pb-1 border-b border-border/40">
          <Link
            href={`/workspace/${workspaceId}/reports`}
            onClick={() => onClose?.()}
            className={cn(
              'flex items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200',
              pathname?.includes('/reports')
                ? 'bg-primary/12 text-primary font-semibold shadow-xs border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <BarChart3 className={cn('h-3.5 w-3.5 shrink-0', pathname?.includes('/reports') ? 'text-primary' : 'text-muted-foreground')} />
            <span>{t('nav.dashboardReports')}</span>
          </Link>
        </div>

        {/* Boards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider flex items-center justify-between">
            <span>{t('nav.boards')}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all active:scale-95"
              onClick={() => setCreateDialogOpen(true)}
              title={t('nav.createNewBoard')}
            >
              <Plus className="h-3.5 w-3.5 text-primary" />
            </Button>
          </div>

          <div className="space-y-1">
            {boards.map((board) => {
              const isActive = activeBoardId === board.id;
              return (
                <div key={board.id} className="group flex items-center">
                  <Link
                    href={`/workspace/${workspaceId}/board/${board.id}`}
                    onClick={() => onClose?.()}
                    className={cn(
                      'flex-1 flex items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/12 text-primary font-semibold shadow-xs border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    )}
                  >
                    <LayoutDashboard className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="truncate">{board.title}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover-reveal text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 ml-1"
                    onClick={() => handleDeleteBoard(board.id)}
                    title="Delete board"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User profile & preferences footer */}
      <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-border/50 bg-secondary/30 backdrop-blur-sm space-y-2.5">
        {/* Quick Settings: Language, Theme & Logout */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl gap-1.5 font-medium transition-all active:scale-95"
            onClick={handleLogout}
            title={t('nav.logout')}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="text-[11px] font-semibold">{t('nav.logout')}</span>
          </Button>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card/70 border border-border/40 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-pastel-lavender text-pastel-lavender-text flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ring-2 ring-primary/20">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold truncate text-foreground leading-tight">
              {currentUser?.name || t('nav.guestUser')}
            </div>
            <div className="text-[10px] text-muted-foreground truncate mt-0.5">
              {currentUser?.email || t('nav.notLoggedIn')}
            </div>
          </div>
        </div>
      </div>

      <CreateBoardDialog
        workspaceId={workspaceId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
