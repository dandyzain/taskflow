'use client';

import { useState } from 'react';
import type { EmployeeMetric } from '@/lib/queries/report-queries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Award, CheckCircle2, AlertTriangle, Clock, Activity, Search, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TeamAnalyticsCharts } from '@/components/reports/team-analytics-charts';
import { useLanguage } from '@/lib/i18n/language-context';

interface EmployeePerformanceViewProps {
  employeeMetrics: EmployeeMetric[];
  leaderboard: EmployeeMetric[];
}

function getWorkloadBadge(status: EmployeeMetric['workloadStatus'], t: (key: any) => string) {
  switch (status) {
    case 'optimal':
      return {
        label: t('reports.workloadOptimal'),
        class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
      };
    case 'heavy':
      return {
        label: t('reports.workloadHeavy'),
        class: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60',
      };
    case 'overloaded':
      return {
        label: t('reports.workloadOverloaded'),
        class: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60',
      };
    default:
      return {
        label: t('reports.workloadLight'),
        class: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60',
      };
  }
}

export function EmployeePerformanceView({ employeeMetrics, leaderboard }: EmployeePerformanceViewProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = employeeMetrics.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Aggregate Team Performance KPIs & Workload Distribution Charts */}
      <TeamAnalyticsCharts employeeMetrics={employeeMetrics} />

      {/* Top Performers Podium / Highlights */}
      {topThree.length > 0 && (
        <div className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                {t('reports.leaderboardTitle')}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('reports.leaderboardSub')}
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs font-semibold text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-full border border-border/60 flex items-center gap-1.5 shrink-0">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              {t('reports.topPerformers')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {topThree.map((member, index) => {
              const medalColors = [
                'from-amber-400 to-amber-500 text-white shadow-amber-300/40',
                'from-slate-300 to-slate-400 text-slate-800 shadow-slate-300/40',
                'from-amber-700 to-amber-800 text-amber-100 shadow-amber-700/40',
              ];
              const rankLabels = ['1st Place', '2nd Place', '3rd Place'];
              const cardBg = [
                'border-amber-300/50 dark:border-amber-700/50 bg-amber-500/5',
                'border-slate-300/50 dark:border-slate-700/50 bg-slate-500/5',
                'border-amber-700/30 dark:border-amber-800/30 bg-amber-700/5',
              ];

              return (
                <div
                  key={member.id}
                  className={cn(
                    'relative rounded-2xl p-4 border transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
                    cardBg[index]
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={cn(
                        'w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shadow-xs bg-gradient-to-br',
                        medalColors[index]
                      )}
                    >
                      #{index + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {rankLabels[index]}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10 border border-border shadow-xs">
                      {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
                      <AvatarFallback className="bg-pastel-lavender text-pastel-lavender-text font-bold text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">{member.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{member.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('reports.tasksCompleted')}</span>
                      <span className="font-bold text-foreground">{member.completedTasks} / {member.totalAssigned}</span>
                    </div>
                    {/* Completion bar */}
                    <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${member.completionRate}%` }}
                        className="h-full rounded-full bg-pastel-mint transition-all duration-500"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-0.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{member.completionRate}% {t('common.completed')}</span>
                      <span className="text-muted-foreground">{member.activityCount} {t('reports.activityActions')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Complete Employee Performance Table */}
      <div className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              {t('reports.tableEvaluationTitle', { count: filteredMembers.length.toString() })}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('reports.tableEvaluationSub')}
            </p>
          </div>

          {/* Search Member */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('reports.searchEmployeePlaceholder')}
              className="pl-8 h-8 text-xs rounded-xl bg-background/60 border-border/80"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-secondary/40 border-b border-border/70 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">{t('reports.colEmployee')}</th>
                <th className="px-3 py-3">{t('reports.colRole')}</th>
                <th className="px-3 py-3 text-center">{t('reports.colWorkload')}</th>
                <th className="px-3 py-3 text-center">{t('reports.colTotalTask')}</th>
                <th className="px-3 py-3 text-center">{t('reports.colCompleted')}</th>
                <th className="px-3 py-3 text-center">{t('reports.colInProgress')}</th>
                <th className="px-3 py-3 text-center">{t('reports.colOverdue')}</th>
                <th className="px-4 py-3">{t('reports.colCompletionPct')}</th>
                <th className="px-4 py-3">{t('reports.colOnTime')}</th>
                <th className="px-3 py-3 text-center">{t('reports.colActivities')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredMembers.map((member) => {
                const badge = getWorkloadBadge(member.workloadStatus, t);
                return (
                  <tr key={member.id} className="hover:bg-secondary/30 transition-colors">
                    {/* Employee Info */}
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-7 h-7 border border-border">
                          {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
                          <AvatarFallback className="bg-pastel-lavender text-pastel-lavender-text text-[10px] font-bold">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate leading-tight text-foreground">{member.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-3 py-3 text-muted-foreground font-semibold">
                      {member.role}
                    </td>

                    {/* Workload Status */}
                    <td className="px-3 py-3 text-center">
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', badge.class)}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Total Tasks */}
                    <td className="px-3 py-3 text-center font-bold text-foreground">
                      {member.totalAssigned}
                    </td>

                    {/* Completed */}
                    <td className="px-3 py-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                      {member.completedTasks}
                    </td>

                    {/* In Progress */}
                    <td className="px-3 py-3 text-center text-amber-600 dark:text-amber-400 font-bold">
                      {member.inProgressTasks}
                    </td>

                    {/* Overdue */}
                    <td className="px-3 py-3 text-center font-bold">
                      {member.overdueTasks > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">
                          {member.overdueTasks}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">0</span>
                      )}
                    </td>

                    {/* Completion Bar */}
                    <td className="px-4 py-3 min-w-[130px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-foreground">{member.completionRate}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${member.completionRate}%` }}
                            className="h-full rounded-full bg-pastel-mint"
                          />
                        </div>
                      </div>
                    </td>

                    {/* On-Time Rate */}
                    <td className="px-4 py-3 font-semibold text-xs">
                      <span className={member.onTimeRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                        {member.onTimeRate}%
                      </span>
                    </td>

                    {/* Activity Count */}
                    <td className="px-3 py-3 text-center text-muted-foreground font-medium">
                      {member.activityCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
