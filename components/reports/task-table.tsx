'use client';

import { useState } from 'react';
import type { TaskItemReport } from '@/lib/queries/report-queries';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Calendar,
  LayoutList,
  LayoutGrid,
  UserX,
  Flame,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/language-context';

interface TaskTableProps {
  tasks: TaskItemReport[];
  workspaceId?: string;
}

export function TaskTable({ tasks, workspaceId }: TaskTableProps) {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'progress' | 'completed' | 'overdue' | 'due_soon'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [picFilter, setPicFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'newest' | 'title'>('dueDate');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
      t.boardTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.columnTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.assignees.some((a) => a.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && t.isCompleted) ||
      (statusFilter === 'progress' && t.isInProgress) ||
      (statusFilter === 'overdue' && t.isOverdue) ||
      (statusFilter === 'due_soon' && t.isDueSoon);

    const matchesPriority =
      priorityFilter === 'all' || t.priority.toString() === priorityFilter;

    const matchesPic =
      picFilter === 'all' ||
      (picFilter === 'assigned' && t.assignees.length > 0) ||
      (picFilter === 'unassigned' && t.assignees.length === 0);

    return matchesSearch && matchesStatus && matchesPriority && matchesPic;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'priority') {
      return b.priority - a.priority;
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Quick stats derived from filteredTasks
  const totalCount = sortedTasks.length;
  const urgentCount = sortedTasks.filter((t) => t.priority === 3).length;
  const riskyCount = sortedTasks.filter((t) => t.isOverdue || t.isDueSoon).length;
  const unassignedCount = sortedTasks.filter((t) => t.assignees.length === 0).length;
  const completedCount = sortedTasks.filter((t) => t.isCompleted).length;
  const progressCount = sortedTasks.filter((t) => t.isInProgress).length;
  const backlogCount = totalCount - completedCount - progressCount;

  return (
    <div className="space-y-4">
      {/* 4 Task Inventory Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Total Tasks */}
        <div className="rounded-2xl border border-border/80 bg-card/85 dark:bg-card/40 backdrop-blur-md p-3 sm:p-4 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-semibold">{t('reports.inventoryFiltered')}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary border border-border/60">
              {tasks.length > 0 ? Math.round((totalCount / tasks.length) * 100) : 0}% {t('common.all')}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{totalCount}</h3>
            <span className="text-[11px] text-muted-foreground">
              {t('reports.inventoryFilteredSub', { total: tasks.length.toString() })}
            </span>
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="rounded-2xl border border-rose-300/40 dark:border-rose-700/40 bg-card/85 dark:bg-card/40 backdrop-blur-md p-3 sm:p-4 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              {t('reports.inventoryUrgent')}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60">
              High
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{urgentCount}</h3>
            <span className="text-[11px] text-muted-foreground">{t('reports.inventoryUrgentSub')}</span>
          </div>
        </div>

        {/* Risky / Overdue Tasks */}
        <div className="rounded-2xl border border-amber-300/40 dark:border-amber-700/40 bg-card/85 dark:bg-card/40 backdrop-blur-md p-3 sm:p-4 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('reports.inventoryRisk')}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60">
              SLA Risk
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{riskyCount}</h3>
            <span className="text-[11px] text-muted-foreground">{t('reports.inventoryRiskSub')}</span>
          </div>
        </div>

        {/* Unassigned Tasks */}
        <div className="rounded-2xl border border-border/80 bg-card/85 dark:bg-card/40 backdrop-blur-md p-3 sm:p-4 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
              <UserX className="w-3.5 h-3.5 text-muted-foreground" />
              {t('reports.inventoryUnassigned')}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary border border-border/60">
              Unassigned
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{unassignedCount}</h3>
            <span className="text-[11px] text-muted-foreground">{t('reports.inventoryUnassignedSub')}</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md p-3.5 sm:p-5 shadow-xs space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t('reports.taskInventoryTitle', { count: totalCount.toString() })}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('reports.taskInventorySub')}
            </p>
          </div>

          {/* Action Tools: Search, Sort, View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('reports.modalSearchPlaceholder')}
                className="pl-8 h-8 text-xs rounded-xl bg-background/60 border-border/80 w-full"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-secondary/50 border border-border/60 rounded-xl px-2 h-8 text-xs">
              <ArrowUpDown className="w-3 h-3 text-muted-foreground shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[11px] font-semibold text-foreground focus:outline-none cursor-pointer"
              >
                <option value="dueDate">{t('reports.sortDueDate')}</option>
                <option value="priority">{t('reports.sortPriority')}</option>
                <option value="newest">{t('reports.sortNewest')}</option>
                <option value="title">{t('reports.sortTitle')}</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-0.5 bg-secondary/50 p-0.5 rounded-xl border border-border/60">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-1.5 rounded-lg text-xs transition-all',
                  viewMode === 'table' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                )}
                title={t('reports.viewTableMode')}
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-lg text-xs transition-all',
                  viewMode === 'grid' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                )}
                title={t('reports.viewGridMode')}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Filter Row: Status, Priority, PIC */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all',
                statusFilter === 'all' ? 'bg-secondary text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('reports.filterAllStatus')}
            </button>
            <button
              onClick={() => setStatusFilter('progress')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all',
                statusFilter === 'progress' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('common.inProgress')}
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all',
                statusFilter === 'completed' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('common.completed')}
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all',
                statusFilter === 'overdue' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('common.overdue')}
            </button>
            <button
              onClick={() => setStatusFilter('due_soon')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all',
                statusFilter === 'due_soon' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('common.dueSoon')}
            </button>
          </div>

          {/* Sub Filters: Priority & PIC Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-secondary/40 border border-border/60 rounded-lg px-2 h-7 text-[11px] font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">{t('reports.filterAllPriorities')}</option>
              <option value="3">{t('kanban.priorityUrgent')}</option>
              <option value="2">{t('kanban.priorityMedium')}</option>
              <option value="1">{t('kanban.priorityLow')}</option>
              <option value="0">{t('kanban.priorityNone')}</option>
            </select>

            <select
              value={picFilter}
              onChange={(e) => setPicFilter(e.target.value as any)}
              className="bg-secondary/40 border border-border/60 rounded-lg px-2 h-7 text-[11px] font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">{t('reports.filterAllAssignments')}</option>
              <option value="assigned">{t('reports.filterHasPic')}</option>
              <option value="unassigned">{t('reports.filterNoPic')}</option>
            </select>
          </div>
        </div>

        {/* View Mode 1: Table View */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-xl border border-border/70 scrollbar-none -mx-1 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-secondary/40 border-b border-border/70 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">{t('common.title')}</th>
                  <th className="px-3 py-3">Board</th>
                  <th className="px-3 py-3">{t('common.status')}</th>
                  <th className="px-3 py-3">{t('common.priority')}</th>
                  <th className="px-3 py-3">{t('common.dueDate')}</th>
                  <th className="px-4 py-3">{t('common.assignee')}</th>
                  <th className="px-3 py-3 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-xs">
                      {t('reports.emptyFilterNotice')}
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map((task) => {
                    const priorityBadge =
                      task.priority === 3
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200'
                        : task.priority === 2
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200'
                        : task.priority === 1
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200'
                        : 'bg-muted text-muted-foreground border-border';

                    return (
                      <tr key={task.id} className="hover:bg-secondary/30 transition-colors">
                        {/* Title & Labels */}
                        <td className="px-4 py-3 font-semibold text-foreground max-w-xs truncate">
                          <div className="space-y-0.5">
                            <span className="block truncate">{task.title}</span>
                            {task.labels.length > 0 && (
                              <div className="flex gap-1 flex-wrap pt-0.5">
                                {task.labels.map((l) => (
                                  <span
                                    key={l.id}
                                    className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-secondary text-muted-foreground border border-border/40"
                                  >
                                    {l.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Board */}
                        <td className="px-3 py-3 text-muted-foreground font-medium">
                          {task.boardTitle}
                        </td>

                        {/* Column Status */}
                        <td className="px-3 py-3">
                          <span className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                            task.isCompleted
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200'
                              : task.isInProgress
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200'
                              : 'bg-secondary text-foreground border-border/60'
                          )}>
                            {task.columnTitle}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-3 py-3">
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', priorityBadge)}>
                            {task.priorityLabel}
                          </span>
                        </td>

                        {/* Due Date */}
                        <td className="px-3 py-3">
                          {task.dueDate ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span
                                className={cn(
                                  'font-medium',
                                  task.isOverdue
                                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                                    : task.isDueSoon
                                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                    : 'text-muted-foreground'
                                )}
                              >
                                {new Date(task.dueDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              {task.isOverdue && (
                                <span className="text-[9px] bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 px-1 py-0.2 rounded font-bold border border-rose-200">
                                  {t('common.overdue')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </td>

                        {/* Assignees */}
                        <td className="px-4 py-3">
                          {task.assignees.length > 0 ? (
                            <div className="flex -space-x-1.5 items-center">
                              {task.assignees.map((u) => (
                                <Avatar key={u.id} className="w-6 h-6 border-2 border-background" title={u.name}>
                                  {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.name} />}
                                  <AvatarFallback className="text-[9px] font-bold bg-pastel-lavender text-pastel-lavender-text">
                                    {u.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {task.assignees.length === 1 && (
                                <span className="text-xs text-muted-foreground font-medium pl-3 truncate max-w-[100px]">
                                  {task.assignees[0].name}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50 text-[11px]">{t('common.unassigned')}</span>
                          )}
                        </td>

                        {/* Action Link */}
                        <td className="px-3 py-3 text-right">
                          {workspaceId ? (
                            <Link
                              href={`/workspace/${workspaceId}/board/${task.boardId}`}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                            >
                              <span>{t('common.openBoard')}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="text-muted-foreground/40">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* View Mode 2: Interactive Grid Card View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedTasks.length === 0 ? (
              <div className="col-span-full py-8 text-center text-muted-foreground text-xs">
                {t('reports.emptyFilterNotice')}
              </div>
            ) : (
              sortedTasks.map((task) => {
                const priorityBadge =
                  task.priority === 3
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200'
                    : task.priority === 2
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200'
                    : task.priority === 1
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200'
                    : 'bg-muted text-muted-foreground border-border';

                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-secondary/25 border border-border/70 hover:border-primary/40 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      {/* Board & Priority Pills */}
                      <div className="flex items-center justify-between gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-secondary font-medium text-muted-foreground truncate max-w-[140px] border border-border/50">
                          {task.boardTitle}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded-full font-bold border shrink-0', priorityBadge)}>
                          {task.priorityLabel}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Labels */}
                      {task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {task.labels.map((l) => (
                            <span
                              key={l.id}
                              className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-secondary text-muted-foreground border border-border/40"
                            >
                              {l.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer: Status, Due Date, Assignees, Board Link */}
                    <div className="pt-2 border-t border-border/50 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                          task.isCompleted
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200'
                            : task.isInProgress
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200'
                            : 'bg-secondary text-foreground border-border/60'
                        )}>
                          {task.columnTitle}
                        </span>

                        {task.dueDate ? (
                          <div className={cn(
                            'flex items-center gap-1 text-[11px]',
                            task.isOverdue
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : task.isDueSoon
                              ? 'text-amber-600 dark:text-amber-400 font-semibold'
                              : 'text-muted-foreground'
                          )}>
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>
                              {new Date(task.dueDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60">{t('common.noDeadline')}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {/* Assignee Avatars */}
                        <div className="flex -space-x-1.5 items-center">
                          {task.assignees.length > 0 ? (
                            task.assignees.map((u) => (
                              <Avatar key={u.id} className="w-5 h-5 border-2 border-background" title={u.name}>
                                {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.name} />}
                                <AvatarFallback className="text-[8px] font-bold bg-pastel-lavender text-pastel-lavender-text">
                                  {u.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))
                          ) : (
                            <span className="text-[10px] text-muted-foreground/60 italic">{t('common.unassigned')}</span>
                          )}
                        </div>

                        {/* Open Board Action */}
                        {workspaceId && (
                          <Link
                            href={`/workspace/${workspaceId}/board/${task.boardId}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                          >
                            <span>{t('common.openBoard')}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
