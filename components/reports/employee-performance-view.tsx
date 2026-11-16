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
        class: 'bg-success-soft text-success border-success/25',
      };
    case 'heavy':
      return {
        label: t('reports.workloadHeavy'),
        class: 'bg-warning-soft text-warning border-warning/25',
      };
    case 'overloaded':
      return {
        label: t('reports.workloadOverloaded'),
        class: 'bg-danger-soft text-danger border-danger/25',
      };
    default:
      return {
        label: t('reports.workloadLight'),
        class: 'bg-info-soft text-info border-info/25',
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
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
            <div>
              <h3 className="text-[0.9375rem] font-semibold text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-warning shrink-0" />
                {t('reports.leaderboardTitle')}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('reports.leaderboardSub')}
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs font-semibold text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-full border border-border/60 flex items-center gap-1.5 shrink-0">
              <Award className="w-3.5 h-3.5 text-warning" />
              {t('reports.topPerformers')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {topThree.map((member, index) => {
              const medalColors = [
                // Gold / silver / bronze — literal medal colours are intentional here
                'from-[#F5C451] to-[#E0A526] text-[#3B2A05] shadow-[0_6px_16px_-6px_#E0A526]',
                'from-[#D9DDE5] to-[#AEB5C2] text-[#1F2430] shadow-[0_6px_16px_-6px_#AEB5C2]',
                'from-[#D69A6A] to-[#B0703F] text-[#2A1606] shadow-[0_6px_16px_-6px_#B0703F]',
              ];
              const rankLabels = ['1st Place', '2nd Place', '3rd Place'];
              const cardBg = [
                'border-[#E0A526]/40 bg-[#F5C451]/[0.07]',
                'border-[#AEB5C2]/50 bg-[#D9DDE5]/[0.10]',
                'border-[#B0703F]/40 bg-[#D69A6A]/[0.07]',
              ];

              return (
                <div
                  key={member.id}
                  className={cn(
                    'relative rounded-2xl p-4 border transition-all duration-300 hover:shadow-e2 hover:-translate-y-0.5',
                    cardBg[index]
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={cn(
                        'w-7 h-7 rounded-xl font-semibold text-xs flex items-center justify-center shadow-xs bg-gradient-to-br',
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
                      <AvatarFallback className="bg-pastel-lavender text-pastel-lavender-text font-semibold text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">{member.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{member.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('reports.tasksCompleted')}</span>
                      <span className="font-semibold text-foreground">{member.completedTasks} / {member.totalAssigned}</span>
                    </div>
                    {/* Completion bar */}
                    <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${member.completionRate}%` }}
                        className="h-full rounded-full bg-pastel-mint transition-all duration-500"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-0.5">
                      <span className="text-success font-semibold">{member.completionRate}% {t('common.completed')}</span>
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
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-[0.9375rem] font-semibold text-foreground flex items-center gap-2">
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
              className="pl-8 h-8 text-xs rounded-xl bg-background/60 border-border"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground uppercase text-2xs font-semibold tracking-wider">
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
                          <AvatarFallback className="bg-pastel-lavender text-pastel-lavender-text text-2xs font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs truncate leading-tight text-foreground">{member.name}</p>
                          <p className="text-2xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-3 py-3 text-muted-foreground font-semibold">
                      {member.role}
                    </td>

                    {/* Workload Status */}
                    <td className="px-3 py-3 text-center">
                      <span className={cn('text-2xs font-semibold px-2 py-0.5 rounded-full border', badge.class)}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Total Tasks */}
                    <td className="px-3 py-3 text-center font-semibold text-foreground">
                      {member.totalAssigned}
                    </td>

                    {/* Completed */}
                    <td className="px-3 py-3 text-center text-success font-semibold">
                      {member.completedTasks}
                    </td>

                    {/* In Progress */}
                    <td className="px-3 py-3 text-center text-warning font-semibold">
                      {member.inProgressTasks}
                    </td>

                    {/* Overdue */}
                    <td className="px-3 py-3 text-center font-semibold">
                      {member.overdueTasks > 0 ? (
                        <span className="text-danger">
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
                      <span className={member.onTimeRate >= 80 ? 'text-success' : 'text-warning'}>
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
