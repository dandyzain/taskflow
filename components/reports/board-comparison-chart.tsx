'use client';

import type { TaskItemReport } from '@/lib/queries/report-queries';
import { cn } from '@/lib/utils';
import { Layers, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/language-context';

interface BoardComparisonChartProps {
  boards: Array<{ id: string; title: string }>;
  tasks: TaskItemReport[];
  workspaceId: string;
}

export function BoardComparisonChart({ boards, tasks, workspaceId }: BoardComparisonChartProps) {
  const { t } = useLanguage();

  if (boards.length === 0) {
    return null;
  }

  // Calculate metrics per board
  const boardMetrics = boards.map((board) => {
    const boardTasks = tasks.filter((t) => t.boardId === board.id);
    const total = boardTasks.length;
    const completed = boardTasks.filter((t) => t.isCompleted).length;
    const inProgress = boardTasks.filter((t) => t.isInProgress).length;
    const overdue = boardTasks.filter((t) => t.isOverdue).length;
    const backlog = total - completed - inProgress;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    let statusLabel = t('reports.boardStatusBacklog');
    let statusClass = 'bg-secondary text-muted-foreground border-border/60';
    if (overdue > 0) {
      statusLabel = t('reports.boardStatusOverdue', { count: overdue });
      statusClass = 'bg-danger-soft text-danger border-danger/25';
    } else if (completionRate >= 75) {
      statusLabel = t('reports.boardStatusEfficient');
      statusClass = 'bg-success-soft text-success border-success/25';
    } else if (inProgress > 0) {
      statusLabel = t('reports.boardStatusActive');
      statusClass = 'bg-info-soft text-info border-info/25';
    }

    return {
      id: board.id,
      title: board.title,
      total,
      completed,
      inProgress,
      overdue,
      backlog,
      completionRate,
      statusLabel,
      statusClass,
    };
  });

  const bestBoard = [...boardMetrics].sort((a, b) => b.completionRate - a.completionRate)[0];

  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-[0.9375rem] font-semibold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-foreground shrink-0" />
            {t('reports.boardComparisonTitle')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('reports.boardComparisonSub')}
          </p>
        </div>

        {bestBoard && bestBoard.total > 0 && (
          <div className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pastel-mint/40 border border-success/25 text-[11px] font-semibold text-success">
            <TrendingUp className="w-3 h-3 text-success" />
            <span>{t('reports.mostProductiveBoard', { board: bestBoard.title, rate: bestBoard.completionRate })}</span>
          </div>
        )}
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-1">
        {boardMetrics.map((b) => (
          <div
            key={b.id}
            className="p-3.5 rounded-xl bg-secondary/30 dark:bg-secondary/20 border border-border hover:border-primary/40 transition-all duration-200 space-y-3"
          >
            {/* Title & Status */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-xs sm:text-[0.9375rem] font-semibold text-foreground truncate">{b.title}</h4>
                <p className="text-[11px] text-muted-foreground">{b.total} {t('reports.kpiTotalTasks')}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className={cn('text-2xs font-semibold px-2 py-0.5 rounded-full border', b.statusClass)}>
                  {b.statusLabel}
                </span>
                <Link
                  href={`/workspace/${workspaceId}/board/${b.id}`}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                  title={t('common.openBoard')}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Completion Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-medium">{t('reports.colCompletionPct')}</span>
                <span className="font-semibold text-foreground">{b.completionRate}%</span>
              </div>
              <div className="h-2 w-full bg-secondary/70 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                {b.total > 0 ? (
                  <>
                    <div
                      style={{ width: `${(b.completed / b.total) * 100}%` }}
                      className="h-full rounded-full bg-pastel-mint transition-all"
                      title={`${b.completed} ${t('common.completed')}`}
                    />
                    <div
                      style={{ width: `${(b.inProgress / b.total) * 100}%` }}
                      className="h-full rounded-full bg-pastel-peach transition-all"
                      title={`${b.inProgress} ${t('common.inProgress')}`}
                    />
                    <div
                      style={{ width: `${(b.backlog / b.total) * 100}%` }}
                      className="h-full rounded-full bg-pastel-sky transition-all"
                      title={`${b.backlog} ${t('reports.kpiBacklog')}`}
                    />
                  </>
                ) : (
                  <div className="h-full w-full rounded-full bg-muted" />
                )}
              </div>
            </div>

            {/* Breakdown Counters */}
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pt-1 text-center">
              <div className="p-1 sm:p-1.5 rounded-lg bg-card/60 border border-border/50 min-w-0">
                <span className="block text-2xs text-muted-foreground truncate" title={t('common.completed')}>{t('common.completed')}</span>
                <span className="text-xs font-semibold text-success">{b.completed}</span>
              </div>
              <div className="p-1 sm:p-1.5 rounded-lg bg-card/60 border border-border/50 min-w-0">
                <span className="block text-2xs text-muted-foreground truncate" title={t('common.inProgress')}>{t('common.inProgress')}</span>
                <span className="text-xs font-semibold text-warning">{b.inProgress}</span>
              </div>
              <div className="p-1 sm:p-1.5 rounded-lg bg-card/60 border border-border/50 min-w-0">
                <span className="block text-2xs text-muted-foreground truncate" title={t('reports.kpiBacklog')}>{t('reports.kpiBacklog')}</span>
                <span className="text-xs font-semibold text-info">{b.backlog}</span>
              </div>
              <div className="p-1 sm:p-1.5 rounded-lg bg-card/60 border border-border/50 min-w-0">
                <span className="block text-2xs text-muted-foreground truncate" title={t('common.overdue')}>{t('common.overdue')}</span>
                <span className={cn('text-xs font-semibold', b.overdue > 0 ? 'text-danger' : 'text-muted-foreground')}>
                  {b.overdue}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
