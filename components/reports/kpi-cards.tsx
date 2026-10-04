'use client';

import { CheckCircle2, Clock, AlertTriangle, ListTodo, Users, TrendingUp } from 'lucide-react';
import type { WorkspaceReportData } from '@/lib/queries/report-queries';
import { cn } from '@/lib/utils';

interface KpiCardsProps {
  summary: WorkspaceReportData['summary'];
  boardsCount: number;
}

export function KpiCards({ summary, boardsCount }: KpiCardsProps) {
  const cards = [
    {
      title: 'Total Tugas',
      value: summary.totalTasks,
      subtitle: `${boardsCount} Board aktif`,
      icon: ListTodo,
      iconBg: 'bg-pastel-sky/60 text-sky-800 dark:text-sky-200',
      badge: 'Semua Board',
      badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60',
      borderGlow: 'hover:border-sky-300/60 dark:hover:border-sky-800/60',
    },
    {
      title: 'Tugas Selesai',
      value: summary.completedTasks,
      subtitle: `${summary.completionRate}% Tingkat penyelesaian`,
      icon: CheckCircle2,
      iconBg: 'bg-pastel-mint/60 text-emerald-800 dark:text-emerald-200',
      badge: `${summary.completionRate}% Selesai`,
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
      borderGlow: 'hover:border-emerald-300/60 dark:hover:border-emerald-800/60',
    },
    {
      title: 'Sedang Dikerjakan',
      value: summary.inProgressTasks,
      subtitle: `${summary.backlogTasks} task menunggu antrean`,
      icon: Clock,
      iconBg: 'bg-pastel-peach/60 text-amber-800 dark:text-amber-200',
      badge: 'In Progress',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60',
      borderGlow: 'hover:border-amber-300/60 dark:hover:border-amber-800/60',
    },
    {
      title: 'Tugas Terlambat',
      value: summary.overdueTasks,
      subtitle: summary.dueSoonTasks > 0 ? `${summary.dueSoonTasks} mendekati deadline (< 48j)` : 'Tidak ada deadline mendesak',
      icon: AlertTriangle,
      iconBg: 'bg-pastel-rose/60 text-rose-800 dark:text-rose-200',
      badge: summary.overdueTasks > 0 ? 'Perlu Perhatian' : 'Aman',
      badgeColor:
        summary.overdueTasks > 0
          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60'
          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60',
      borderGlow: summary.overdueTasks > 0 ? 'border-rose-200/70 hover:border-rose-400' : 'hover:border-primary/40',
    },
    {
      title: 'Anggota Tim',
      value: summary.totalMembers,
      subtitle: `Rata-rata ${summary.averageTasksPerMember} task / orang`,
      icon: Users,
      iconBg: 'bg-pastel-lavender/60 text-purple-800 dark:text-purple-200',
      badge: 'Kolaborasi',
      badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60',
      borderGlow: 'hover:border-purple-300/60 dark:hover:border-purple-800/60',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={cn(
              'group relative rounded-2xl bg-card/80 dark:bg-card/40 backdrop-blur-md p-3 sm:p-4 border border-border/80 shadow-xs hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5',
              card.borderGlow,
              idx === 4 ? 'col-span-2 sm:col-span-1' : ''
            )}
          >
            <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-3">
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

            <div className="space-y-0.5">
              <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">{card.title}</p>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{card.value}</h3>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 truncate pt-0.5">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
