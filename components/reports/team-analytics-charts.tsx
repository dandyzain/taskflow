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
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-pastel-mint flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-success-soft text-success border border-success/25">
              {t('reports.tabTeamShort')}
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{t('reports.teamSummaryAvgCompletion')}</p>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">{avgCompletionRate}%</h3>
            <p className="text-2xs sm:text-[11px] text-muted-foreground/80 truncate">{t('reports.teamSummaryAvgCompletionSub', { completed: totalCompletedAll, total: totalAssignedAll })}</p>
          </div>
        </div>

        {/* Card 2: On-Time Delivery Rate */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-pastel-sky flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4 text-info" />
            </div>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-info-soft text-info border border-info/25">
              SLA Delivery
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{t('reports.teamSummaryOnTime')}</p>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">{avgOnTimeRate}%</h3>
            <p className="text-2xs sm:text-[11px] text-muted-foreground/80 truncate">
              {totalOverdueAll > 0 ? t('reports.teamSummaryOnTimeSub', { overdue: totalOverdueAll }) : t('reports.teamSummaryOnTimeClean')}
            </p>
          </div>
        </div>

        {/* Card 3: Workload Balance */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-pastel-peach flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4 text-warning" />
            </div>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-warning-soft text-warning border border-warning/25">
              Capacity
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{t('reports.teamSummaryWorkload')}</p>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              {capacityCounts.optimal + capacityCounts.light}/{employeeMetrics.length}
            </h3>
            <p className="text-2xs sm:text-[11px] text-muted-foreground/80 truncate">{t('reports.teamSummaryWorkloadSub')}</p>
          </div>
        </div>

        {/* Card 4: Total Collaborative Activities */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-pastel-lavender flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-primary/25">
              Activities
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{t('reports.teamSummaryActivity')}</p>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">{totalActivitiesAll}</h3>
            <p className="text-2xs sm:text-[11px] text-muted-foreground/80 truncate">{t('reports.teamSummaryActivitySub')}</p>
          </div>
        </div>
      </div>

      {/* 2-Column Visual Charts: Workload Comparison & Capacity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Member Workload & Delivery Comparison Chart (Span 2) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-[0.9375rem] font-semibold text-foreground flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary shrink-0" />
                {t('reports.teamWorkloadChartTitle')}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('reports.teamWorkloadChartSub')}
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-2xs sm:text-[11px] bg-secondary/50 px-2.5 py-1 rounded-xl border border-border/50 shrink-0 self-start sm:self-auto">
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
                        <AvatarFallback className="text-[9px] font-semibold bg-pastel-lavender text-pastel-lavender-text">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate block">{member.name}</span>
                        <span className="text-2xs text-muted-foreground truncate block">{member.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-right">
                      <div className="text-[11px]">
                        <span className="font-semibold text-success">{member.completedTasks}</span>
                        <span className="text-muted-foreground">/{member.totalAssigned}</span>
                      </div>
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-secondary border border-border/60">
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
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-[0.9375rem] font-semibold text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4 text-warning shrink-0" />
              {t('reports.teamCapacityChartTitle')}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('reports.teamCapacityChartSub')}
            </p>
          </div>

          {/* Capacity Categories */}
          <div className="space-y-3 pt-2">
            {/* Optimal */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-success/25 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-mint ring-2 ring-success/30" />
                  {t('reports.capacityOptimal')}
                </span>
                <span className="font-semibold text-success">{capacityCounts.optimal}</span>
              </div>
              <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${(capacityCounts.optimal / Math.max(1, employeeMetrics.length)) * 100}%` }}
                  className="h-full bg-pastel-mint rounded-full" 
                />
              </div>
            </div>

            {/* Heavy */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-warning/25 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-peach ring-2 ring-warning/30" />
                  {t('reports.capacityHeavy')}
                </span>
                <span className="font-semibold text-warning">{capacityCounts.heavy}</span>
              </div>
              <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${(capacityCounts.heavy / Math.max(1, employeeMetrics.length)) * 100}%` }}
                  className="h-full bg-pastel-peach rounded-full" 
                />
              </div>
            </div>

            {/* Overloaded */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-danger/25 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-rose ring-2 ring-danger/30" />
                  {t('reports.capacityOverloaded')}
                </span>
                <span className="font-semibold text-danger">{capacityCounts.overloaded}</span>
              </div>
              <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${(capacityCounts.overloaded / Math.max(1, employeeMetrics.length)) * 100}%` }}
                  className="h-full bg-pastel-rose rounded-full" 
                />
              </div>
            </div>

            {/* Available / Light */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-pastel-sky ring-2 ring-info/30" />
                  {t('reports.capacityLight')}
                </span>
                <span className="font-semibold text-info">{capacityCounts.light}</span>
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
