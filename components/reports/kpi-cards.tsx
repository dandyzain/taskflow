'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  Users,
  Timer,
  Inbox,
  ArrowUp,
  ChevronRight,
} from 'lucide-react';
import type { TaskItemReport, EmployeeMetric, WorkspaceReportData } from '@/lib/queries/report-queries';
import { KpiDetailModal, type KpiMetricType } from '@/components/reports/kpi-detail-modal';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';

interface KpiCardsProps {
  summary: WorkspaceReportData['summary'];
  boardsCount: number;
  tasks: TaskItemReport[];
  members: EmployeeMetric[];
  workspaceId: string;
}

export function KpiCards({ summary, boardsCount, tasks, members, workspaceId }: KpiCardsProps) {
  const [selectedMetric, setSelectedMetric] = useState<KpiMetricType | null>(null);
  const { t } = useLanguage();

  const urgentTasksCount = tasks.filter((t) => t.priority === 3).length;

  const cards = [
    {
      metricType: 'total' as KpiMetricType,
      title: t('reports.kpiTotalTasks'),
      value: summary.totalTasks,
      subtitle: `${boardsCount} ${t('reports.kpiTotalTasksSub')}`,
      icon: ListTodo,
      iconBg: 'bg-pastel-sky/60 text-sky-800 dark:text-sky-200',
      badge: t('reports.allBoards'),
      badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60',
      borderGlow: 'hover:border-sky-300/80 dark:hover:border-sky-700',
      tag: 'Overview',
    },
    {
      metricType: 'completed' as KpiMetricType,
      title: t('reports.kpiCompleted'),
      value: summary.completedTasks,
      subtitle: `${summary.completionRate}% ${t('reports.kpiCompletedSub')}`,
      icon: CheckCircle2,
      iconBg: 'bg-pastel-mint/60 text-emerald-800 dark:text-emerald-200',
      badge: `${summary.completionRate}%`,
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
      borderGlow: 'hover:border-emerald-300/80 dark:hover:border-emerald-700',
      tag: 'Success',
    },
    {
      metricType: 'in_progress' as KpiMetricType,
      title: t('reports.kpiInProgress'),
      value: summary.inProgressTasks,
      subtitle: t('reports.kpiInProgressSub'),
      icon: Clock,
      iconBg: 'bg-pastel-peach/60 text-amber-800 dark:text-amber-200',
      badge: t('common.inProgress'),
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60',
      borderGlow: 'hover:border-amber-300/80 dark:hover:border-amber-700',
      tag: 'Active',
    },
    {
      metricType: 'backlog' as KpiMetricType,
      title: t('reports.kpiBacklog'),
      value: summary.backlogTasks,
      subtitle: t('reports.kpiBacklogSub'),
      icon: Inbox,
      iconBg: 'bg-pastel-lavender/60 text-purple-800 dark:text-purple-200',
      badge: 'Backlog',
      badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60',
      borderGlow: 'hover:border-purple-300/80 dark:hover:border-purple-700',
      tag: 'Pipeline',
    },
    {
      metricType: 'overdue' as KpiMetricType,
      title: t('reports.kpiOverdue'),
      value: summary.overdueTasks,
      subtitle: t('reports.kpiOverdueSub'),
      icon: AlertTriangle,
      iconBg: 'bg-pastel-rose/60 text-rose-800 dark:text-rose-200',
      badge: summary.overdueTasks > 0 ? t('common.overdue') : t('common.onTrack'),
      badgeColor:
        summary.overdueTasks > 0
          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60'
          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
      borderGlow:
        summary.overdueTasks > 0
          ? 'border-rose-300/70 hover:border-rose-500'
          : 'hover:border-emerald-300/80 dark:hover:border-emerald-700',
      tag: 'Risk',
    },
    {
      metricType: 'due_soon' as KpiMetricType,
      title: t('reports.kpiDueSoon'),
      value: summary.dueSoonTasks,
      subtitle: t('reports.kpiDueSoonSub'),
      icon: Timer,
      iconBg: 'bg-pastel-peach/70 text-amber-800 dark:text-amber-200',
      badge: t('common.dueSoon'),
      badgeColor:
        summary.dueSoonTasks > 0
          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60'
          : 'bg-muted text-muted-foreground border-border/50',
      borderGlow: 'hover:border-amber-300/80 dark:hover:border-amber-700',
      tag: 'Urgent',
    },
    {
      metricType: 'urgent' as KpiMetricType,
      title: t('reports.kpiUrgent'),
      value: urgentTasksCount,
      subtitle: t('reports.kpiUrgentSub'),
      icon: ArrowUp,
      iconBg: 'bg-pastel-rose/70 text-rose-800 dark:text-rose-200',
      badge: t('kanban.priorityUrgent'),
      badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60',
      borderGlow: 'hover:border-rose-300/80 dark:hover:border-rose-700',
      tag: 'Critical',
    },
    {
      metricType: 'members' as KpiMetricType,
      title: t('reports.kpiMembers'),
      value: summary.totalMembers,
      subtitle: t('reports.kpiMembersSub', { avg: summary.averageTasksPerMember }),
      icon: Users,
      iconBg: 'bg-pastel-lavender/60 text-purple-800 dark:text-purple-200',
      badge: t('reports.tabTeam'),
      badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60',
      borderGlow: 'hover:border-purple-300/80 dark:hover:border-purple-700',
      tag: 'Capacity',
    },
  ];

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span className="font-semibold text-foreground/80">{t('reports.kpiSummaryTitle')}</span>
          <span className="text-[11px] text-muted-foreground/70 hidden sm:inline">
            {t('reports.clickCardHint')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.metricType}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedMetric(card.metricType)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedMetric(card.metricType);
                  }
                }}
                className={cn(
                  'group relative rounded-2xl bg-card/85 dark:bg-card/40 backdrop-blur-md p-3 sm:p-4 border border-border/80 shadow-xs hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-primary/40',
                  card.borderGlow
                )}
              >
                {/* Header Icon & Badge */}
                <div className="flex items-center justify-between gap-1.5 mb-2.5">
                  <div
                    className={cn(
                      'w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs shrink-0',
                      card.iconBg
                    )}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span
                    className={cn(
                      'text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full border truncate',
                      card.badgeColor
                    )}
                  >
                    {card.badge}
                  </span>
                </div>

                {/* Number & Labels */}
                <div className="space-y-0.5">
                  <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">{card.title}</p>
                  <div className="flex items-baseline justify-between gap-1">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {card.value}
                    </h3>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 truncate pt-0.5">{card.subtitle}</p>
                </div>

                {/* Subtle Click Hint on Hover */}
                <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground/70 group-hover:text-primary transition-colors font-medium">
                  <span>{t('common.viewDetails')}</span>
                  <span>↗</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pop-up Detail Modal */}
      <KpiDetailModal
        open={selectedMetric !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMetric(null);
        }}
        metricType={selectedMetric}
        tasks={tasks}
        members={members}
        summary={summary}
        workspaceId={workspaceId}
      />
    </>
  );
}
