'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as m from 'motion/react-m';
import { BarChart3, LayoutGrid, Plus, Search, UserRound } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { layoutSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface MobileTabBarProps {
  workspaceId: string;
  onBoards: () => void;
  onSearch: () => void;
  onCreate: () => void;
  onAccount: () => void;
}

/** Thumb-reachable primary navigation for phones (hidden from md up). */
export function MobileTabBar({ workspaceId, onBoards, onSearch, onCreate, onAccount }: MobileTabBarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const onBoard = !!pathname?.includes('/board/');
  const onReports = !!pathname?.includes('/reports');

  const item =
    'relative flex flex-1 flex-col items-center justify-center gap-1 pt-2 pb-1.5 text-2xs font-medium outline-none transition-colors focus-visible:text-foreground';

  const Indicator = () => (
    <m.span
      layoutId="tabbar-indicator"
      transition={layoutSpring}
      aria-hidden
      className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
    />
  );

  return (
    <nav
      data-mobile-tabbar
      aria-label={t('ui.navigation')}
      className="glass-panel fixed inset-x-0 bottom-0 z-40 flex border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <button type="button" onClick={onBoards} className={cn(item, onBoard ? 'text-foreground' : 'text-muted-foreground')}>
        {onBoard && <Indicator />}
        <LayoutGrid className={cn('size-5', onBoard && 'text-primary')} aria-hidden />
        {t('ui.boards')}
      </button>
      <button type="button" onClick={onSearch} className={cn(item, 'text-muted-foreground')}>
        <Search className="size-5" aria-hidden />
        {t('ui.search')}
      </button>
      <div className="flex flex-1 items-start justify-center">
        <button
          type="button"
          onClick={onCreate}
          aria-label={t('ui.create')}
          className="-mt-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow outline-none ring-4 ring-background transition-transform active:scale-95 focus-visible:ring-ring"
        >
          <Plus className="size-6" aria-hidden />
        </button>
      </div>
      <Link
        href={`/workspace/${workspaceId}/reports`}
        className={cn(item, onReports ? 'text-foreground' : 'text-muted-foreground')}
        aria-current={onReports ? 'page' : undefined}
      >
        {onReports && <Indicator />}
        <BarChart3 className={cn('size-5', onReports && 'text-primary')} aria-hidden />
        {t('reports.tabAnalytics')}
      </Link>
      <button type="button" onClick={onAccount} className={cn(item, 'text-muted-foreground')}>
        <UserRound className="size-5" aria-hidden />
        {t('ui.profile')}
      </button>
    </nav>
  );
}
