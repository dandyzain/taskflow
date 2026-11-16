'use client';

import * as React from 'react';
import { useState } from 'react';
import { Columns3, List, RotateCcw, Search, SlidersHorizontal, Tag, UserX, Users, Flag, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PriorityBadge } from '@/components/patterns/priority-badge';
import { UserAvatar } from '@/components/patterns/user-avatar';
import type { PriorityFilter } from '@/hooks/use-board-filter';
import { PRIORITY_ORDER } from '@/lib/design/tokens';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useEverTrue } from '@/hooks/use-ever-true';

const FiltersDrawer = dynamic(() => import('@/components/kanban/filters-drawer').then((m) => m.FiltersDrawer), {
  ssr: false,
});

export type BoardView = 'board' | 'list';

interface BoardToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: PriorityFilter;
  onPriorityFilterChange: (priority: PriorityFilter) => void;
  labelFilter: string;
  onLabelFilterChange: (labelId: string) => void;
  availableLabels: Array<{ id: string; name: string; color: string }>;
  employeeFilter: string;
  onEmployeeFilterChange: (employeeId: string) => void;
  availableMembers: Array<{ id: string; name: string; avatarUrl: string | null }>;
  activeFilterCount: number;
  onClearFilters: () => void;
  view: BoardView;
  onViewChange: (view: BoardView) => void;
}

export const BoardToolbar = React.forwardRef<HTMLInputElement, BoardToolbarProps>(function BoardToolbar(
  {
    searchQuery,
    onSearchChange,
    priorityFilter,
    onPriorityFilterChange,
    labelFilter,
    onLabelFilterChange,
    availableLabels,
    employeeFilter,
    onEmployeeFilterChange,
    availableMembers,
    activeFilterCount,
    onClearFilters,
    view,
    onViewChange,
  },
  ref
) {
  const { t } = useLanguage();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersMounted = useEverTrue(filtersOpen);
  const nonSearchFilters = activeFilterCount - (searchQuery.trim() ? 1 : 0);

  const triggerCls = (active: boolean) =>
    cn('h-9 w-full justify-start gap-2 text-sm [&>svg:last-child]:ml-auto', active && 'border-primary/50 bg-accent text-accent-foreground');

  const filters = (
    <>
      <Select value={priorityFilter} onValueChange={onPriorityFilterChange as (v: string) => void}>
        <SelectTrigger className={triggerCls(priorityFilter !== 'all')} aria-label={t('common.priority')}>
          <Flag className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <SelectValue placeholder={t('kanban.allPriorities')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('kanban.allPriorities')}</SelectItem>
          {PRIORITY_ORDER.map((level) => (
            <SelectItem key={level} value={String(level)}>
              <PriorityBadge priority={level} hideNone={false} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={labelFilter} onValueChange={onLabelFilterChange}>
        <SelectTrigger className={triggerCls(labelFilter !== 'all')} aria-label={t('common.labels')}>
          <Tag className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <SelectValue placeholder={t('kanban.allLabels')} />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          <SelectItem value="all">{t('kanban.allLabels')}</SelectItem>
          {availableLabels.map((label) => (
            <SelectItem key={label.id} value={label.id}>
              <span className="flex items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: label.color }} aria-hidden />
                <span className="truncate">{label.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={employeeFilter} onValueChange={onEmployeeFilterChange}>
        <SelectTrigger className={triggerCls(employeeFilter !== 'all')} aria-label={t('common.assignees')}>
          <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <SelectValue placeholder={t('kanban.allMembers')} />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          <SelectItem value="all">{t('kanban.allMembers')}</SelectItem>
          <SelectItem value="unassigned">
            <span className="flex items-center gap-2">
              <UserX className="size-4 text-muted-foreground" aria-hidden />
              {t('kanban.unassignedOnly')}
            </span>
          </SelectItem>
          {availableMembers.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              <span className="flex items-center gap-2">
                <UserAvatar user={member} size="xs" />
                <span className="truncate">{member.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  return (
    <div className="mb-4 flex shrink-0 flex-wrap items-center gap-2" data-print-hide>
      {/* Search */}
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          ref={ref}
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('kanban.searchTasks')}
          aria-label={t('kanban.searchTasks')}
          className="h-9 pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label={t('ui.clear')}
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <Kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 sm:inline-flex">/</Kbd>
        )}
      </div>

      {/* Desktop inline filters */}
      <div className="hidden items-center gap-2 lg:flex [&>button]:w-[10.5rem]">{filters}</div>

      {/* Compact filters button (mobile / tablet) */}
      <Button
        variant="outline"
        className={cn('h-9 lg:hidden', nonSearchFilters > 0 && 'border-primary/50 bg-accent text-accent-foreground')}
        onClick={() => setFiltersOpen(true)}
        aria-label={nonSearchFilters > 0 ? `${t('ui.filters')} (${nonSearchFilters})` : t('ui.filters')}
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        <span className="hidden xs:inline">{t('ui.filters')}</span>
        {nonSearchFilters > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-2xs font-semibold text-primary-foreground">
            {nonSearchFilters}
          </span>
        )}
      </Button>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-9 animate-scale-in text-muted-foreground">
          <RotateCcw className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">{t('kanban.clearFilters')}</span>
        </Button>
      )}

      <ToggleGroup
        type="single"
        value={view}
        onValueChange={(v) => v && onViewChange(v as BoardView)}
        className="ml-auto"
        aria-label={t('ui.viewMode')}
      >
        <ToggleGroupItem value="board" aria-label={t('ui.boardView')}>
          <Columns3 aria-hidden />
          <span className="hidden md:inline">{t('ui.boardView')}</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label={t('ui.listView')}>
          <List aria-hidden />
          <span className="hidden md:inline">{t('ui.listView')}</span>
        </ToggleGroupItem>
      </ToggleGroup>

      {filtersMounted && (
        <FiltersDrawer open={filtersOpen} onOpenChange={setFiltersOpen} onClearFilters={onClearFilters}>
          {filters}
        </FiltersDrawer>
      )}
    </div>
  );
});
