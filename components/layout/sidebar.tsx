'use client';

import Link from 'next/link';
import { useRouter, useParams, usePathname } from 'next/navigation';
import * as m from 'motion/react-m';
import { toast } from 'sonner';
import {
  BarChart3,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react';
import { deleteBoard } from '@/actions/board-actions';
import { LogoMark } from '@/components/brand/logo';
import { AccountMenu } from '@/components/layout/account-menu';
import type { ShellBoard, ShellUser } from '@/components/layout/workspace-context';
import { useConfirm } from '@/components/patterns/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Kbd } from '@/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { avatarTone } from '@/lib/design/tokens';
import { useLanguage } from '@/lib/i18n/language-context';
import { layoutSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type SidebarState = 'auto' | 'expanded' | 'collapsed';

interface SidebarProps {
  workspaceId: string;
  workspaceName: string;
  boards: ShellBoard[];
  currentUser?: ShellUser | null;
  /** 'auto' = rail on tablet, full on desktop (pure CSS, no hydration flash) */
  state?: SidebarState;
  /** Whether the rail is currently showing (drives tooltips) */
  isRail?: boolean;
  onToggle?: () => void;
  onOpenPalette: () => void;
  onCreateBoard: () => void;
  onOpenShortcuts: () => void;
  /** Provided when rendered inside the mobile drawer */
  onClose?: () => void;
  className?: string;
}

/*
 * Labels hide whenever the sidebar is a rail. `state` lives on the root as
 * data-state so these variants work without JS-driven layout.
 */
const LABEL =
  'truncate group-data-[state=collapsed]/sb:hidden group-data-[state=auto]/sb:max-xl:hidden';
const RAIL_ONLY =
  'hidden group-data-[state=collapsed]/sb:flex group-data-[state=auto]/sb:max-xl:flex';
const FULL_ONLY =
  'group-data-[state=collapsed]/sb:hidden group-data-[state=auto]/sb:max-xl:hidden';

function NavTooltip({ label, enabled, children }: { label: string; enabled: boolean; children: React.ReactNode }) {
  if (!enabled) return <>{children}</>;
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function ActivePill() {
  return (
    <m.span
      layoutId="sidebar-active"
      transition={layoutSpring}
      aria-hidden
      className="absolute inset-0 rounded-lg bg-card shadow-e1 ring-1 ring-border"
    />
  );
}

export function Sidebar({
  workspaceId,
  workspaceName,
  boards,
  currentUser,
  state = 'auto',
  isRail = false,
  onToggle,
  onOpenPalette,
  onCreateBoard,
  onOpenShortcuts,
  onClose,
  className,
}: SidebarProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const confirm = useConfirm();
  const { t } = useLanguage();
  const activeBoardId = params?.boardId as string | undefined;
  const reportsActive = !!pathname?.includes('/reports');

  const handleDeleteBoard = async (board: ShellBoard) => {
    const ok = await confirm({
      title: t('ui.deleteBoardTitle', { name: board.title }),
      description: t('ui.deleteBoardDesc'),
      confirmLabel: t('ui.deleteBoard'),
      destructive: true,
    });
    if (!ok) return;

    const isCurrentBoard = activeBoardId === board.id;
    const remainingBoards = boards.filter((b) => b.id !== board.id);
    const result = await deleteBoard({ boardId: board.id, workspaceId });
    if (result.success) {
      toast.success(t('nav.boardDeleted'));
      if (isCurrentBoard) {
        router.replace(
          remainingBoards.length > 0
            ? `/workspace/${workspaceId}/board/${remainingBoards[0].id}`
            : `/workspace/${workspaceId}`
        );
      }
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const itemClass = (active: boolean) =>
    cn(
      'relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium outline-none transition-colors',
      'focus-visible:ring-2 focus-visible:ring-ring',
      'group-data-[state=collapsed]/sb:justify-center group-data-[state=collapsed]/sb:px-0 group-data-[state=auto]/sb:max-xl:justify-center group-data-[state=auto]/sb:max-xl:px-0',
      active ? 'text-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    );

  return (
    <TooltipProvider>
      <div
        data-state={state}
        className={cn(
          'group/sb flex h-full flex-col border-r bg-card/60 backdrop-blur-xl transition-[width] duration-base ease-out-expo',
          'w-[264px] data-[state=collapsed]:w-[72px] data-[state=auto]:max-xl:w-[72px]',
          className
        )}
      >
        {/* Brand / workspace */}
        <div className="flex h-14 shrink-0 items-center gap-2 px-3 pt-[env(safe-area-inset-top)] group-data-[state=collapsed]/sb:justify-center group-data-[state=auto]/sb:max-xl:justify-center">
          <Link
            href={`/workspace/${workspaceId}`}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring group-data-[state=collapsed]/sb:flex-none group-data-[state=auto]/sb:max-xl:flex-none"
            aria-label={workspaceName}
          >
            <LogoMark className="size-8" title="" />
            <span className={cn('min-w-0', LABEL)}>
              <span className="block truncate text-sm font-semibold leading-tight text-foreground">{workspaceName}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                {t('nav.activeWorkspace')}
              </span>
            </span>
          </Link>
          {onClose ? (
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label={t('ui.closeMenu')}>
              <X className="size-4" />
            </Button>
          ) : (
            onToggle && (
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn('text-muted-foreground', FULL_ONLY)}
                onClick={onToggle}
                aria-label={t('ui.collapseSidebar')}
                title={`${t('ui.collapseSidebar')} ( [ )`}
              >
                <PanelLeftClose className="size-4" />
              </Button>
            )
          )}
        </div>

        {/* Search / command palette */}
        <div className="px-3 pb-2">
          <NavTooltip label={`${t('ui.search')} (⌘K)`} enabled={isRail}>
            <button
              type="button"
              onClick={onOpenPalette}
              className={cn(
                'flex h-9 w-full items-center gap-2.5 rounded-lg border bg-card px-2.5 text-sm text-muted-foreground shadow-2xs outline-none transition-colors hover:border-border-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
                'group-data-[state=collapsed]/sb:justify-center group-data-[state=collapsed]/sb:px-0 group-data-[state=auto]/sb:max-xl:justify-center group-data-[state=auto]/sb:max-xl:px-0'
              )}
              aria-label={t('ui.search')}
            >
              <Search className="size-4 shrink-0" aria-hidden />
              <span className={cn('flex-1 text-left', LABEL)}>{t('ui.searchShort')}</span>
              <span className={cn('flex gap-0.5', FULL_ONLY)}>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </span>
            </button>
          </NavTooltip>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-3 pb-3" aria-label={t('ui.navigation')}>
          <div className="space-y-0.5">
            <NavTooltip label={t('nav.dashboardReports')} enabled={isRail}>
              <Link
                href={`/workspace/${workspaceId}/reports`}
                onClick={() => onClose?.()}
                className={itemClass(reportsActive)}
                aria-current={reportsActive ? 'page' : undefined}
              >
                {reportsActive && <ActivePill />}
                <BarChart3 className={cn('relative size-4 shrink-0', reportsActive && 'text-primary')} aria-hidden />
                <span className={cn('relative', LABEL)}>{t('nav.dashboardReports')}</span>
              </Link>
            </NavTooltip>
          </div>

          <div className="space-y-0.5">
            <div className="flex h-7 items-center justify-between px-2.5 group-data-[state=collapsed]/sb:justify-center group-data-[state=collapsed]/sb:px-0 group-data-[state=auto]/sb:max-xl:justify-center group-data-[state=auto]/sb:max-xl:px-0">
              <span className={cn('text-xs font-medium text-muted-foreground', LABEL)}>{t('nav.boards')}</span>
              <span className={cn('h-px w-6 bg-border', RAIL_ONLY)} aria-hidden />
              <Button
                variant="ghost"
                size="icon"
                className={cn('size-6 rounded-md text-muted-foreground hover:text-foreground tap-target', FULL_ONLY)}
                onClick={onCreateBoard}
                aria-label={t('nav.createNewBoard')}
                title={t('nav.createNewBoard')}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            {boards.map((board) => {
              const isActive = activeBoardId === board.id;
              return (
                <div key={board.id} className="group/item relative">
                  <NavTooltip label={board.title} enabled={isRail}>
                    <Link
                      href={`/workspace/${workspaceId}/board/${board.id}`}
                      onClick={() => onClose?.()}
                      className={cn(itemClass(isActive), 'pr-9 group-data-[state=collapsed]/sb:pr-0 group-data-[state=auto]/sb:max-xl:pr-0')}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {isActive && <ActivePill />}
                      <span
                        aria-hidden
                        className={cn(
                          'relative flex size-5 shrink-0 items-center justify-center rounded-md text-2xs font-semibold',
                          avatarTone(board.id)
                        )}
                      >
                        {board.title.charAt(0).toUpperCase()}
                      </span>
                      <span className={cn('relative', LABEL)}>{board.title}</span>
                    </Link>
                  </NavTooltip>
                  <div className={cn('absolute right-1 top-1/2 -translate-y-1/2', FULL_ONLY)}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-md text-muted-foreground hover-reveal group-hover/item:opacity-100 hover:text-foreground"
                          aria-label={`${t('ui.moreActions')}: ${board.title}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" side="right">
                        <DropdownMenuItem asChild>
                          <Link href={`/workspace/${workspaceId}/board/${board.id}`} onClick={() => onClose?.()}>
                            <ExternalLink /> {t('common.openBoard')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem destructive onSelect={() => handleDeleteBoard(board)}>
                          <Trash2 /> {t('ui.deleteBoard')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}

            {/* New board button visible in rail mode */}
            <NavTooltip label={t('nav.createNewBoard')} enabled={isRail}>
              <button
                type="button"
                onClick={onCreateBoard}
                className={cn(itemClass(false), 'w-full border border-dashed border-border-strong/70 hover:border-primary/50')}
                aria-label={t('nav.createNewBoard')}
              >
                <Plus className="size-4 shrink-0" aria-hidden />
                <span className={LABEL}>{t('ui.newBoard')}</span>
              </button>
            </NavTooltip>
          </div>
        </nav>

        {/* Footer */}
        <div className="shrink-0 space-y-1 border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {onToggle && !onClose && (
            <NavTooltip label={t('ui.expandSidebar')} enabled={isRail}>
              <button
                type="button"
                onClick={onToggle}
                className={cn(itemClass(false), 'w-full', RAIL_ONLY)}
                aria-label={t('ui.expandSidebar')}
              >
                <PanelLeftOpen className="size-4" aria-hidden />
              </button>
            </NavTooltip>
          )}
          <div className={FULL_ONLY}>
            <AccountMenu user={currentUser ?? null} onOpenShortcuts={onOpenShortcuts} />
          </div>
          <div className={cn('justify-center', RAIL_ONLY)}>
            <AccountMenu user={currentUser ?? null} compact onOpenShortcuts={onOpenShortcuts} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

