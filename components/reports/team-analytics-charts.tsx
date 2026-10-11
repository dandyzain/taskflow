'use client';

import type { EmployeeMetric } from '@/lib/queries/report-queries';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  BarChart2, 
  Scale, 
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

interface TeamAnalyticsChartsProps {
  employeeMetrics: EmployeeMetric[];
}

export function TeamAnalyticsCharts({ employeeMetrics }: TeamAnalyticsChartsProps) {
  const { t } = useLanguage();

  if (employeeMetrics.length === 0) return null;

  // 1. Calculate overall team aggregate KPIs
  const totalAssignedAll = employeeMetrics.reduce((acc, m) => acc + m.totalAssigned, 0);
  const totalCompletedAll = employeeMetrics.reduce((acc, m) => acc + m.completedTasks, 0);
  const totalInProgressAll = employeeMetrics.reduce((acc, m) => acc + m.inProgressTasks, 0);
  const totalOverdueAll = employeeMetrics.reduce((acc, m) => acc + m.overdueTasks, 0);
  const totalActivitiesAll = employeeMetrics.reduce((acc, m) => acc + m.activityCount, 0);

  const avgCompletionRate = totalAssignedAll > 0 
    ? Math.round((totalCompletedAll / totalAssignedAll) * 100) 
    : 0;

  const avgOnTimeRate = employeeMetrics.length > 0
    ? Math.round(employeeMetrics.reduce((acc, m) => acc + m.onTimeRate, 0) / employeeMetrics.length)
    : 100;

  // Workload distributions
  const capacityCounts = {
    optimal: employeeMetrics.filter((m) => m.workloadStatus === 'optimal').length,
    heavy: employeeMetrics.filter((m) => m.workloadStatus === 'heavy').length,
    overloaded: employeeMetrics.filter((m) => m.workloadStatus === 'overloaded').length,
    light: employeeMetrics.filter((m) => m.workloadStatus === 'light').length,
  };

  return (
    <div className="space-y-6">
      {/* 4 Team Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Team Avg Completion Rate */}
        <div className="rounded-2xl border border-border/80 bg-card/85 dark:bg-card/40 backdrop-blur-md p-3.5 sm:p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-pastel-mint flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60">
              {t('reports.tabTeamShort')}
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{t('reports.teamSummaryAvgCompletion')}</p>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{avgCompletionRate}%</h3>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 truncate">{t('reports.teamSummaryAvgCompletionSub', { completed: totalCompletedAll, total: totalAssignedAll })}</p>
          </div>
        </div>

        {/* Card 2: On-Time Delivery Rate */}
        <div className="rounded-2xl border border-border/80 bg-card/85 dark:bg-card/40 backdrop-blur-md p-3.5 sm:p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-pastel-sky flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4 text-sky-700 dark:text-sky-300" />
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/60">
              SLA Delivery
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{t('reports.teamSummaryOnTime')}</p>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{avgOnTimeRate}%</h3>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 truncate">
              {totalOverdueAll > 0 ? t('reports.teamSummaryOnTimeSub', { overdue: totalOverdueAll }) : t('reports.teamSummaryOnTimeClean')}
            </p>
          </div>
        </div>

        {/* Card 3: Workload Balance */}
        <div className="rounded-2xl border border-border/80 bg-card/85 dark:bg-card/40 backdrop-blur-md p-3.5 sm:p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-pastel-peach flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60">
              Capacity
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{t('reports.teamSummaryWorkload')}</p>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {capacityCounts.optimal + capacityCounts.light}/{employeeMetrics.length}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 truncate">{t('reports.teamSummaryWorkloadSub')}</p>
          </div>
        </div>

        {/* Card 4: Total Collaborative Activities */}
        <div className="rounded-2xl border border-border/80 bg-card/85 dark:bg-card/40 backdrop-blur-md p-3.5 sm:p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-pastel-lavender flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4 text-purple-700 dark:text-purple-300" />
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60">
              Activities
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{t('reports.teamSummaryActivity')}</p>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{totalActivitiesAll}</h3>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 truncate">{t('reports.teamSummaryActivitySub')}</p>
          </div>
        </div>
      </div>

      {/* 2-Column Visual Charts: Workload Comparison & Capacity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Member Workload & Delivery Comparison Chart (Span 2) */}
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md p-3.5 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary shrink-0" />
                {t('reports.teamWorkloadChartTitle')}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('reports.teamWorkloadChartSub')}
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] bg-secondary/50 px-2.5 py-1 rounded-xl border border-border/50 shrink-0 self-start sm:self-auto">
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-pastel-mint" /> {t('common.completed')}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-pastel-peach" /> {t('common.inProgress')}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-pastel-rose" /> {t('common.overdue')}
              </span>
            </div>
          </div>

          {/* Members Bar Chart List */}
          <div className="space-y-3 pt-1">
            {employeeMetrics.map((member) => {
              const completedPct = member.totalAssigned > 0 
                ? (member.completedTasks / member.totalAssigned) * 100 
                : 0;
              const inProgressPct = member.totalAssigned > 0 
                ? (member.inProgressTasks / member.totalAssigned) * 100 
                : 0;
              const overduePct = member.totalAssigned > 0 
                ? (member.overdueTasks / member.totalAssigned) * 100 
                : 0;

              return (
                <div key={member.id} className="p-2.5 rounded-xl bg-secondary/20 border border-border/60 hover:bg-secondary/40 transition-colors space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="w-6 h-6 border border-border shrink-0">
                        {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
                        <AvatarFallback className="text-[9px] font-bold bg-pastel-lavender text-pastel-lavender-text">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-foreground truncate block">{member.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate block">{member.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-right">
                      <div className="text-[11px]">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{member.completedTasks}</span>
                        <span className="text-muted-foreground">/{member.totalAssigned}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary border border-border/60">
                        {member.completionRate}%
                      </span>
                    </div>
                  </div>

                  {/* Segmented Bar */}
                  <div className="h-2 w-full bg-secondary/80 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                    {member.totalAssigned > 0 ? (
                      <>
                        <div
                          style={{ width: `${completedPct}%` }}
                          className="h-full rounded-full bg-pastel-mint transition-all"
                          title={`${member.completedTasks} ${t('common.completed')}`}
                        />
                        <div
                          style={{ width: `${inProgressPct}%` }}
                          className="h-full rounded-full bg-pastel-peach transition-all"
                          title={`${member.inProgressTasks} ${t('common.inProgress')}`}
                        />
                        <div
                          style={{ width: `${overduePct}%` }}
                          className="h-full rounded-full bg-pastel-rose transition-all"
                          title={`${member.overdueTasks} ${t('common.overdue')}`}
                        />
                      </>
                    ) : (
                      <div className="h-full w-full rounded-full bg-muted" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Capacity Status Breakdown & Workload Distribution */}
        <div className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md p-3.5 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-500 shrink-0" />
              {t('reports.teamCapacityChartTitle')}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('reports.teamCapacityChartSub')}
            </p>
          </div>

          {/* Capacity Categories */}
          <div className="space-y-3 pt-2">
            {/* Optimal */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-emerald-300/30 dark:border-emerald-700/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-mint ring-2 ring-emerald-400/30" />
                  {t('reports.capacityOptimal')}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{capacityCounts.optimal}</span>
              </div>
              <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${(capacityCounts.optimal / Math.max(1, employeeMetrics.length)) * 100}%` }}
                  className="h-full bg-pastel-mint rounded-full" 
                />
              </div>
            </div>

            {/* Heavy */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-amber-300/30 dark:border-amber-700/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-peach ring-2 ring-amber-400/30" />
                  {t('reports.capacityHeavy')}
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{capacityCounts.heavy}</span>
              </div>
              <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${(capacityCounts.heavy / Math.max(1, employeeMetrics.length)) * 100}%` }}
                  className="h-full bg-pastel-peach rounded-full" 
                />
              </div>
            </div>

            {/* Overloaded */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-rose-300/30 dark:border-rose-700/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-rose ring-2 ring-rose-400/30" />
                  {t('reports.capacityOverloaded')}
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{capacityCounts.overloaded}</span>
              </div>
              <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${(capacityCounts.overloaded / Math.max(1, employeeMetrics.length)) * 100}%` }}
                  className="h-full bg-pastel-rose rounded-full" 
                />
              </div>
            </div>

            {/* Available / Light */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/70 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-sky ring-2 ring-sky-400/30" />
                  {t('reports.capacityLight')}
                </span>
                <span className="font-bold text-sky-600 dark:text-sky-400">{capacityCounts.light}</span>
              </div>
              <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${(capacityCounts.light / Math.max(1, employeeMetrics.length)) * 100}%` }}
                  className="h-full bg-pastel-sky rounded-full" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
