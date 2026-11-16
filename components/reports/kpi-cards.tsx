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
import type { TaskItemReport, EmployeeMetric, WorkspaceReportData, DailyActivityTrend } from '@/lib/queries/report-queries';
import NumberFlow from '@number-flow/react';
import * as m from 'motion/react-m';
import { EASE_OUT } from '@/lib/motion';
import type { KpiMetricType } from '@/components/reports/kpi-detail-modal';
import dynamic from 'next/dynamic';
import { useEverTrue } from '@/hooks/use-ever-true';

const KpiDetailModal = dynamic(() => import('@/components/reports/kpi-detail-modal').then((m) => m.KpiDetailModal), { ssr: false });
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';

interface KpiCardsProps {
  summary: WorkspaceReportData['summary'];
  boardsCount: number;
  tasks: TaskItemReport[];
  members: EmployeeMetric[];
  workspaceId: string;
  dailyTrends?: DailyActivityTrend[];
}

/** Tiny trend line for KPI tiles. */
function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${28 - (v / max) * 24}`).join(' ');
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={cn('h-7 w-20', className)} aria-hidden>
      <polyline points={`0,30 ${pts} 100,30`} className="fill-current opacity-[0.12]" stroke="none" />
      <m.polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: EASE_OUT, delay: 0.2 }}
      />
    </svg>
  );
}

export function KpiCards({ summary, boardsCount, tasks, members, workspaceId, dailyTrends = [] }: KpiCardsProps) {
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
      iconBg: 'bg-pastel-sky/60 text-info',
      badge: t('reports.allBoards'),
      badgeColor: 'bg-info-soft text-info border-info/25',
      borderGlow: 'hover:border-info/25 ',
      tag: 'Overview',
    },
    {
      metricType: 'completed' as KpiMetricType,
      title: t('reports.kpiCompleted'),
      value: summary.completedTasks,
      subtitle: `${summary.completionRate}% ${t('reports.kpiCompletedSub')}`,
      icon: CheckCircle2,
      iconBg: 'bg-pastel-mint/60 text-success',
      badge: `${summary.completionRate}%`,
      badgeColor: 'bg-success-soft text-success border-success/25',
      borderGlow: 'hover:border-success/25 ',
      tag: 'Success',
    },
    {
      metricType: 'in_progress' as KpiMetricType,
      title: t('reports.kpiInProgress'),
      value: summary.inProgressTasks,
      subtitle: t('reports.kpiInProgressSub'),
      icon: Clock,
      iconBg: 'bg-pastel-peach/60 text-warning',
      badge: t('common.inProgress'),
      badgeColor: 'bg-warning-soft text-warning border-warning/25',
      borderGlow: 'hover:border-warning/25 ',
      tag: 'Active',
    },
    {
      metricType: 'backlog' as KpiMetricType,
      title: t('reports.kpiBacklog'),
      value: summary.backlogTasks,
      subtitle: t('reports.kpiBacklogSub'),
      icon: Inbox,
      iconBg: 'bg-pastel-lavender/60 text-accent-foreground',
      badge: 'Backlog',
      badgeColor: 'bg-accent text-accent-foreground border-primary/25',
      borderGlow: 'hover:border-primary/25 ',
      tag: 'Pipeline',
    },
    {
      metricType: 'overdue' as KpiMetricType,
      title: t('reports.kpiOverdue'),
      value: summary.overdueTasks,
      subtitle: t('reports.kpiOverdueSub'),
      icon: AlertTriangle,
      iconBg: 'bg-pastel-rose/60 text-danger',
      badge: summary.overdueTasks > 0 ? t('common.overdue') : t('common.onTrack'),
      badgeColor:
        summary.overdueTasks > 0
          ? 'bg-danger-soft text-danger border-danger/25'
          : 'bg-success-soft text-success border-success/25',
      borderGlow:
        summary.overdueTasks > 0
          ? 'border-danger/25 hover:border-danger/25'
          : 'hover:border-success/25 ',
      tag: 'Risk',
    },
    {
      metricType: 'due_soon' as KpiMetricType,
      title: t('reports.kpiDueSoon'),
      value: summary.dueSoonTasks,
      subtitle: t('reports.kpiDueSoonSub'),
      icon: Timer,
      iconBg: 'bg-pastel-peach/70 text-warning',
      badge: t('common.dueSoon'),
      badgeColor:
        summary.dueSoonTasks > 0
          ? 'bg-warning-soft text-warning border-warning/25'
          : 'bg-muted text-muted-foreground border-border/50',
      borderGlow: 'hover:border-warning/25 ',
      tag: 'Urgent',
    },
    {
      metricType: 'urgent' as KpiMetricType,
      title: t('reports.kpiUrgent'),
      value: urgentTasksCount,
      subtitle: t('reports.kpiUrgentSub'),
      icon: ArrowUp,
      iconBg: 'bg-pastel-rose/70 text-danger',
      badge: t('kanban.priorityUrgent'),
      badgeColor: 'bg-danger-soft text-danger border-danger/25',
      borderGlow: 'hover:border-danger/25 ',
      tag: 'Critical',
    },
    {
      metricType: 'members' as KpiMetricType,
      title: t('reports.kpiMembers'),
      value: summary.totalMembers,
      subtitle: t('reports.kpiMembersSub', { avg: summary.averageTasksPerMember }),
      icon: Users,
      iconBg: 'bg-pastel-lavender/60 text-accent-foreground',
      badge: t('reports.tabTeam'),
      badgeColor: 'bg-accent text-accent-foreground border-primary/25',
      borderGlow: 'hover:border-primary/25 ',
      tag: 'Capacity',
    },
  ];

  const modalMounted = useEverTrue(selectedMetric !== null);
  const trendFor: Partial<Record<KpiMetricType, number[]>> = {
    total: dailyTrends.map((d) => d.createdCount),
    completed: dailyTrends.map((d) => d.completedCount),
  };

  return (
    <>
      <section className="space-y-3" aria-labelledby="kpi-heading">
        <div className="flex items-end justify-between gap-2 px-0.5">
          <h2 id="kpi-heading" className="text-sm font-medium text-foreground">
            {t('reports.kpiSummaryTitle')}
          </h2>
          <span className="hidden text-xs text-muted-foreground sm:inline">{t('reports.clickCardHint')}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4 @container">
          {cards.map((card, i) => {
            const Icon = card.icon;
            const trend = trendFor[card.metricType];
            return (
              <m.button
                key={card.metricType}
                type="button"
                data-kpi={card.metricType}
                data-value={card.value}
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT, delay: i * 0.04 }}
                onClick={() => setSelectedMetric(card.metricType)}
                className={cn(
                  'group relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-3.5 text-left shadow-e1 outline-none transition-[box-shadow,border-color,transform] duration-quick sm:p-4',
                  'hover:-translate-y-0.5 hover:shadow-e2 focus-visible:ring-2 focus-visible:ring-ring',
                  card.borderGlow
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', card.iconBg)}>
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className={cn('max-w-[60%] truncate rounded-full border px-2 py-0.5 text-2xs font-medium', card.badgeColor)}>
                    {card.badge}
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">{card.title}</p>
                  <div className="mt-0.5 flex items-end justify-between gap-2">
                    <span className="font-mono text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums text-foreground sm:text-3xl">
                      <NumberFlow value={card.value} />
                    </span>
                    {trend && trend.some((v) => v > 0) && (
                      <Sparkline values={trend} className={cn('mb-0.5 shrink-0', card.metricType === 'completed' ? 'text-success' : 'text-info')} />
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-xs text-muted-foreground">{card.subtitle}</p>
                </div>

                <span className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground transition-colors group-hover:text-primary">
                  {t('common.viewDetails')}
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </m.button>
            );
          })}
        </div>
      </section>

      {/* Pop-up Detail Modal */}
      {modalMounted && (
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
      )}
    </>
  );
}
