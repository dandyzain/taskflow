'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TaskItemReport, EmployeeMetric, WorkspaceReportData } from '@/lib/queries/report-queries';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  Inbox,
  AlertTriangle,
  Timer,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Circle,
  Users,
  Search,
  ExternalLink,
  Calendar,
  X,
  User,
  Shield,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';

export type KpiMetricType =
  | 'total'
  | 'completed'
  | 'in_progress'
  | 'backlog'
  | 'overdue'
  | 'due_soon'
  | 'urgent'
  | 'members';

interface KpiDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metricType: KpiMetricType | null;
  tasks: TaskItemReport[];
  members: EmployeeMetric[];
  summary: WorkspaceReportData['summary'];
  workspaceId: string;
}

export function KpiDetailModal({
  open,
  onOpenChange,
  metricType,
  tasks,
  members,
  summary,
  workspaceId,
}: KpiDetailModalProps) {
  const { t, lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [subFilter, setSubFilter] = useState<'all' | 'high_priority' | 'unassigned'>('all');

  // Reset internal search and filter when metricType changes
  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchQuery('');
      setSubFilter('all');
    }
    onOpenChange(isOpen);
  };

  // 1. Determine configuration based on metricType
  const config = useMemo(() => {
    switch (metricType) {
      case 'total':
        return {
          title: lang === 'id' ? 'Semua Tugas (Total Tasks)' : 'All Tasks (Total)',
          description: lang === 'id' 
            ? 'Seluruh daftar tugas yang terdaftar pada papan proyek di workspace ini.' 
            : 'Complete list of tasks registered across project boards in this workspace.',
          icon: ListTodo,
          iconBg: 'bg-pastel-sky/60 text-sky-800 dark:text-sky-200',
          badgeText: `${summary.totalTasks} ${lang === 'id' ? 'Total Tugas' : 'Total Tasks'}`,
          badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60',
        };
      case 'completed':
        return {
          title: lang === 'id' ? 'Tugas Selesai (Completed Tasks)' : 'Completed Tasks',
          description: lang === 'id'
            ? 'Daftar tugas yang telah berhasil diselesaikan oleh tim dengan rasio keberhasilan tinggi.'
            : 'List of tasks successfully finished by team members with high delivery rate.',
          icon: CheckCircle2,
          iconBg: 'bg-pastel-mint/60 text-emerald-800 dark:text-emerald-200',
          badgeText: `${summary.completedTasks} ${lang === 'id' ? 'Selesai' : 'Completed'} (${summary.completionRate}%)`,
          badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
        };
      case 'in_progress':
        return {
          title: lang === 'id' ? 'Sedang Dikerjakan (In Progress)' : 'In Progress Tasks',
          description: lang === 'id'
            ? 'Tugas yang saat ini sedang aktif dikembangkan atau direview oleh anggota tim.'
            : 'Tasks actively being developed or reviewed by teammates.',
          icon: Clock,
          iconBg: 'bg-pastel-peach/60 text-amber-800 dark:text-amber-200',
          badgeText: `${summary.inProgressTasks} In Progress`,
          badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60',
        };
      case 'backlog':
        return {
          title: lang === 'id' ? 'Antrean Tugas (Backlog / To-Do)' : 'Task Backlog / To-Do',
          description: lang === 'id'
            ? 'Daftar tugas yang telah direncanakan dan siap dikerjakan pada tahap berikutnya.'
            : 'Planned tasks in the pipeline ready for subsequent iterations.',
          icon: Inbox,
          iconBg: 'bg-pastel-lavender/60 text-purple-800 dark:text-purple-200',
          badgeText: `${summary.backlogTasks} ${lang === 'id' ? 'di Antrean' : 'In Backlog'}`,
          badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60',
        };
      case 'overdue':
        return {
          title: lang === 'id' ? 'Tugas Terlambat (Overdue Tasks)' : 'Overdue Tasks',
          description: lang === 'id'
            ? 'Tugas yang telah melewati tanggal batas waktu (deadline) dan membutuhkan tindakan segera.'
            : 'Tasks that passed their target deadline requiring immediate attention.',
          icon: AlertTriangle,
          iconBg: 'bg-pastel-rose/60 text-rose-800 dark:text-rose-200',
          badgeText: `${summary.overdueTasks} ${lang === 'id' ? 'Terlambat' : 'Overdue'}`,
          badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60',
        };
      case 'due_soon':
        return {
          title: lang === 'id' ? 'Mendekati Batas Waktu (Due Soon)' : 'Due Soon Tasks',
          description: lang === 'id'
            ? 'Tugas dengan batas waktu dalam waktu kurang dari atau sama dengan 48 jam ke depan.'
            : 'Tasks due within 48 hours requiring prioritization.',
          icon: Timer,
          iconBg: 'bg-pastel-peach/70 text-amber-800 dark:text-amber-200',
          badgeText: `${summary.dueSoonTasks} ${lang === 'id' ? 'Mendekati Batas' : 'Due Soon'}`,
          badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60',
        };
      case 'urgent':
        return {
          title: lang === 'id' ? 'Prioritas Tinggi (High Priority Tasks)' : 'High Priority Tasks',
          description: lang === 'id'
            ? 'Tugas penting dengan tingkat urgensi level High yang memerlukan fokus utama tim.'
            : 'Critical items with high urgency requiring primary focus.',
          icon: ArrowUp,
          iconBg: 'bg-pastel-rose/70 text-rose-800 dark:text-rose-200',
          badgeText: `${tasks.filter((t) => t.priority === 3).length} Urgent`,
          badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60',
        };
      case 'members':
        return {
          title: lang === 'id' ? 'Kapasitas & Beban Kerja Tim' : 'Team Capacity & Workload',
          description: lang === 'id'
            ? 'Rincian produktivitas, tugas yang ditugaskan, dan status beban kerja tiap anggota workspace.'
            : 'Member productivity breakdown, task assignments, and workload health.',
          icon: Users,
          iconBg: 'bg-pastel-lavender/60 text-purple-800 dark:text-purple-200',
          badgeText: `${members.length} ${lang === 'id' ? 'Anggota Kolaborator' : 'Team Members'}`,
          badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60',
        };
      default:
        return null;
    }
  }, [metricType, summary, tasks, members, lang]);

  // 2. Filter tasks based on metric type + sub-filter + search query
  const relevantTasks = useMemo(() => {
    if (!metricType || metricType === 'members') return [];

    let filtered = tasks;

    // Filter by metric
    switch (metricType) {
      case 'completed':
        filtered = filtered.filter((t) => t.isCompleted);
        break;
      case 'in_progress':
        filtered = filtered.filter((t) => t.isInProgress);
        break;
      case 'backlog':
        filtered = filtered.filter((t) => !t.isCompleted && !t.isInProgress);
        break;
      case 'overdue':
        filtered = filtered.filter((t) => t.isOverdue);
        break;
      case 'due_soon':
        filtered = filtered.filter((t) => t.isDueSoon);
        break;
      case 'urgent':
        filtered = filtered.filter((t) => t.priority === 3);
        break;
      case 'total':
      default:
        break;
    }

    // Apply subFilter
    if (subFilter === 'high_priority') {
      filtered = filtered.filter((t) => t.priority === 3);
    } else if (subFilter === 'unassigned') {
      filtered = filtered.filter((t) => !t.assignees || t.assignees.length === 0);
    }

    // Apply search query
    const query = searchQuery.trim().toLowerCase();
    if (query !== '') {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description?.toLowerCase().includes(query) ?? false) ||
          t.boardTitle.toLowerCase().includes(query) ||
          t.columnTitle.toLowerCase().includes(query) ||
          t.assignees.some((a) => a.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [metricType, tasks, subFilter, searchQuery]);

  // 3. Filter members based on search query
  const relevantMembers = useMemo(() => {
    if (metricType !== 'members') return [];
    const query = searchQuery.trim().toLowerCase();
    if (query === '') return members;

    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query)
    );
  }, [metricType, members, searchQuery]);

  if (!config) return null;
  const Icon = config.icon;

  const renderPriorityBadge = (priority: number) => {
    switch (priority) {
      case 3:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-pastel-rose text-pastel-rose-text border border-rose-300/40 shrink-0">
            <ArrowUp className="w-2.5 h-2.5 shrink-0" />
            High
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-pastel-peach text-pastel-peach-text border border-amber-300/40 shrink-0">
            <ArrowRight className="w-2.5 h-2.5 shrink-0" />
            Medium
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-pastel-sky text-pastel-sky-text border border-sky-300/40 shrink-0">
            <ArrowDown className="w-2.5 h-2.5 shrink-0" />
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border border-border/50 shrink-0">
            <Circle className="w-2 h-2 shrink-0 opacity-60" />
            None
          </span>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[calc(100%-1.5rem)] sm:max-w-3xl rounded-3xl border border-border/80 shadow-pastel bg-card/95 backdrop-blur-xl p-4 sm:p-6 max-h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="shrink-0 space-y-2 pb-3 border-b border-border/60">
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs',
                  config.iconBg
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate">
                  {config.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                  {config.description}
                </DialogDescription>
              </div>
            </div>
            <span
              className={cn(
                'text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border shrink-0',
                config.badgeColor
              )}
            >
              {config.badgeText}
            </span>
          </div>

          {/* Quick Mini Metric Strip */}
          {metricType !== 'members' ? (
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-2 text-center">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  {lang === 'id' ? 'Total Terpilih' : 'Total Items'}
                </span>
                <span className="text-sm font-bold text-foreground">{relevantTasks.length}</span>
              </div>
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-2 text-center">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  {t('kanban.priorityUrgent')}
                </span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  {relevantTasks.filter((t) => t.priority === 3).length}
                </span>
              </div>
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-2 text-center">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  {t('reports.inventoryUnassigned')}
                </span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {relevantTasks.filter((t) => !t.assignees || t.assignees.length === 0).length}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-2 text-center">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  {lang === 'id' ? 'Total Anggota' : 'Total Members'}
                </span>
                <span className="text-sm font-bold text-foreground">{members.length}</span>
              </div>
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-2 text-center">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  {lang === 'id' ? 'Rata-rata Tugas' : 'Avg Workload'}
                </span>
                <span className="text-sm font-bold text-primary">
                  {summary.averageTasksPerMember} {lang === 'id' ? '/ org' : '/ member'}
                </span>
              </div>
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-2 text-center">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  {lang === 'id' ? 'Rasio Selesai' : 'Completion Rate'}
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {summary.completionRate}%
                </span>
              </div>
            </div>
          )}

          {/* Search & Sub-Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/70" />
              <Input
                placeholder={metricType === 'members' ? (lang === 'id' ? 'Cari nama, email, peran...' : 'Search name, email, role...') : t('reports.modalSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs rounded-xl bg-background/70 border-border/70 focus-visible:ring-primary/40"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {metricType !== 'members' && (
              <div className="flex items-center gap-1 bg-secondary/60 p-0.5 rounded-xl border border-border/60 shrink-0 text-xs">
                <button
                  type="button"
                  onClick={() => setSubFilter('all')}
                  className={cn(
                    'px-2 py-1 rounded-lg text-[11px] font-semibold transition-all',
                    subFilter === 'all'
                      ? 'bg-card text-foreground shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('common.all')}
                </button>
                <button
                  type="button"
                  onClick={() => setSubFilter('high_priority')}
                  className={cn(
                    'px-2 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1',
                    subFilter === 'high_priority'
                      ? 'bg-card text-rose-600 dark:text-rose-400 shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <ArrowUp className="w-2.5 h-2.5" />
                  High
                </button>
                <button
                  type="button"
                  onClick={() => setSubFilter('unassigned')}
                  className={cn(
                    'px-2 py-1 rounded-lg text-[11px] font-semibold transition-all',
                    subFilter === 'unassigned'
                      ? 'bg-card text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('reports.inventoryUnassigned')}
                </button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1 -mr-1">
          {metricType === 'members' ? (
            /* Members List */
            relevantMembers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs italic">
                {lang === 'id' 
                  ? `Tidak ada anggota yang cocok dengan pencarian "${searchQuery}".` 
                  : `No members match search query "${searchQuery}".`}
              </div>
            ) : (
              relevantMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border/70 bg-card hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-pastel-lavender text-pastel-lavender-text flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground truncate">{member.name}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
                          {member.role}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate block">{member.email}</span>
                    </div>
                  </div>

                  {/* Member Stats */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        {t('reports.colWorkload')}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5',
                          member.workloadStatus === 'optimal'
                            ? 'bg-pastel-mint text-emerald-800 dark:text-emerald-200 border-emerald-300/40'
                            : member.workloadStatus === 'heavy'
                            ? 'bg-pastel-peach text-amber-800 dark:text-amber-200 border-amber-300/40'
                            : member.workloadStatus === 'overloaded'
                            ? 'bg-pastel-rose text-rose-800 dark:text-rose-200 border-rose-300/40'
                            : 'bg-muted text-muted-foreground border-border/50'
                        )}
                      >
                        {member.workloadStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        {lang === 'id' ? 'Tugas Ditugaskan' : 'Assigned Tasks'}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {member.completedTasks} / {member.totalAssigned} {t('common.completed')}
                      </span>
                    </div>

                    <div className="w-20 text-right">
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        {t('common.completed')}
                      </span>
                      <span className="text-xs font-bold text-primary">{member.completionRate}%</span>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${member.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            /* Tasks List */
            relevantTasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs italic">
                {searchQuery || subFilter !== 'all'
                  ? t('reports.emptyFilterNotice')
                  : (lang === 'id' ? 'Tidak ada tugas dalam kategori ini saat ini.' : 'No tasks in this category at the moment.')}
              </div>
            ) : (
              relevantTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 sm:p-3.5 rounded-2xl border border-border/70 bg-card hover:bg-secondary/40 hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {renderPriorityBadge(task.priority)}
                      <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {task.title}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata Badges */}
                    <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-medium bg-secondary/80 px-2 py-0.5 rounded-lg border border-border/50">
                        <Layers className="w-3 h-3 text-primary shrink-0" />
                        <span className="font-semibold text-foreground">{task.boardTitle}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span>{task.columnTitle}</span>
                      </span>

                      {task.dueDate && (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-lg border',
                            task.isOverdue
                              ? 'bg-pastel-rose/80 text-rose-800 dark:text-rose-200 border-rose-300/50 font-bold'
                              : task.isDueSoon
                              ? 'bg-pastel-peach/80 text-amber-800 dark:text-amber-200 border-amber-300/50 font-bold'
                              : 'bg-muted/70 text-muted-foreground border-border/50'
                          )}
                        >
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {task.isOverdue && ` (${t('common.overdue')})`}
                          {task.isDueSoon && !task.isOverdue && ` (${t('common.dueSoon')})`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assignees & Direct Board Link Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    {/* Assignees */}
                    {task.assignees && task.assignees.length > 0 ? (
                      <div className="flex items-center -space-x-1.5 shrink-0" title={task.assignees.map((a) => a.name).join(', ')}>
                        {task.assignees.slice(0, 3).map((assignee) => (
                          <div
                            key={assignee.id}
                            className="w-6 h-6 rounded-full bg-pastel-lavender text-pastel-lavender-text font-bold text-[10px] flex items-center justify-center border-2 border-card shadow-2xs"
                          >
                            {assignee.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {task.assignees.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground font-bold text-[9px] flex items-center justify-center border-2 border-card">
                            +{task.assignees.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/70 italic px-2 py-0.5 rounded-md bg-muted/40">
                        {t('common.unassigned')}
                      </span>
                    )}

                    {/* Direct Board Link */}
                    <Link
                      href={`/workspace/${workspaceId}/board/${task.boardId}`}
                      onClick={() => onOpenChange(false)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all active:scale-95 shrink-0"
                    >
                      <span>{t('common.openBoard')}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </Link>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 flex flex-row items-center justify-between gap-2 pt-3 border-t border-border/60">
          <p className="text-[11px] text-muted-foreground">
            {lang === 'id' ? 'Menampilkan' : 'Showing'}{' '}
            <span className="font-bold text-foreground">
              {metricType === 'members' ? relevantMembers.length : relevantTasks.length}
            </span>{' '}
            {metricType === 'members' 
              ? (lang === 'id' ? 'anggota' : 'members') 
              : (lang === 'id' ? 'tugas' : 'tasks')}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleModalClose(false)}
            className="rounded-xl h-8 px-4 text-xs font-semibold"
          >
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
