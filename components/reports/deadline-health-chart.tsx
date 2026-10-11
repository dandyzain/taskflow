'use client';

import type { TaskItemReport } from '@/lib/queries/report-queries';
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

interface DeadlineHealthChartProps {
  tasks: TaskItemReport[];
}

export function DeadlineHealthChart({ tasks }: DeadlineHealthChartProps) {
  const { t } = useLanguage();
  const total = tasks.length;

  if (total === 0) {
    return null;
  }

  const withoutDueDate = tasks.filter((t) => t.dueDate === null).length;
  const overdue = tasks.filter((t) => t.isOverdue).length;
  const dueSoon = tasks.filter((t) => t.isDueSoon).length;
  const onTrack = total - overdue - dueSoon - withoutDueDate;

  // SLA Compliance rate: percentage of non-overdue tasks
  const slaCompliance = Math.round(((total - overdue) / Math.max(1, total)) * 100);

  const onTrackPercent = Math.round((onTrack / total) * 100);
  const dueSoonPercent = Math.round((dueSoon / total) * 100);
  const overduePercent = Math.round((overdue / total) * 100);
  const withoutDueDatePercent = Math.round((withoutDueDate / total) * 100);

  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md p-3.5 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            {t('reports.deadlineHealthTitle')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('reports.deadlineHealthSub')}
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border/60 text-xs font-semibold text-foreground">
          <span>{t('reports.slaScore')}</span>
          <span className={cn(
            'font-bold',
            slaCompliance >= 90 ? 'text-emerald-600 dark:text-emerald-400' : slaCompliance >= 75 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
          )}>
            {t('reports.slaCompliance', { score: slaCompliance })}
          </span>
        </div>
      </div>

      {/* Multi-segment SLA Bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-border/50">
          {onTrack > 0 && (
            <div
              style={{ width: `${Math.max(onTrackPercent, 3)}%` }}
              className="h-full rounded-full bg-pastel-mint transition-all"
              title={`${t('common.onTrack')}: ${onTrack} (${onTrackPercent}%)`}
            />
          )}
          {dueSoon > 0 && (
            <div
              style={{ width: `${Math.max(dueSoonPercent, 3)}%` }}
              className="h-full rounded-full bg-pastel-peach transition-all"
              title={`${t('common.dueSoon')}: ${dueSoon} (${dueSoonPercent}%)`}
            />
          )}
          {overdue > 0 && (
            <div
              style={{ width: `${Math.max(overduePercent, 3)}%` }}
              className="h-full rounded-full bg-pastel-rose transition-all"
              title={`${t('common.overdue')}: ${overdue} (${overduePercent}%)`}
            />
          )}
          {withoutDueDate > 0 && (
            <div
              style={{ width: `${Math.max(withoutDueDatePercent, 3)}%` }}
              className="h-full rounded-full bg-muted transition-all"
              title={`${t('common.noDeadline')}: ${withoutDueDate} (${withoutDueDatePercent}%)`}
            />
          )}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
          <span>0%</span>
          <span>{t('reports.timelineDistribution')}</span>
          <span>100%</span>
        </div>
      </div>

      {/* 4 Health Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* On Track */}
        <div className="p-3 rounded-xl bg-secondary/30 border border-emerald-300/30 dark:border-emerald-700/30 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-pastel-mint ring-2 ring-emerald-400/30" />
              {t('common.onTrack')}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">{onTrack}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">{onTrackPercent}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground/80">{t('reports.onTrackDesc')}</p>
        </div>

        {/* Due Soon */}
        <div className="p-3 rounded-xl bg-secondary/30 border border-amber-300/30 dark:border-amber-700/30 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-pastel-peach ring-2 ring-amber-400/30" />
              {t('common.dueSoon')}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">{dueSoon}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">{dueSoonPercent}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground/80">{t('reports.dueSoonDesc')}</p>
        </div>

        {/* Overdue */}
        <div className="p-3 rounded-xl bg-secondary/30 border border-rose-300/30 dark:border-rose-700/30 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-pastel-rose ring-2 ring-rose-400/30" />
              {t('common.overdue')}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">{overdue}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">{overduePercent}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground/80">{t('reports.overdueDesc')}</p>
        </div>

        {/* No Deadline */}
        <div className="p-3 rounded-xl bg-secondary/30 border border-border/70 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-muted ring-2 ring-border" />
              {t('common.noDeadline')}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-lg sm:text-xl font-bold text-foreground">{withoutDueDate}</span>
            <span className="text-[10px] font-semibold text-muted-foreground">{withoutDueDatePercent}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground/80">{t('reports.noDeadlineDesc')}</p>
        </div>
      </div>
    </div>
  );
}
