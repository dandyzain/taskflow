'use client';

import { useMemo, useState } from 'react';
import type { WorkspaceReportData } from '@/lib/queries/report-queries';
import { KpiCards } from '@/components/reports/kpi-cards';
import { StatusChart } from '@/components/reports/status-chart';
import { PriorityChart } from '@/components/reports/priority-chart';
import { VelocityChart } from '@/components/reports/velocity-chart';
import { BoardComparisonChart } from '@/components/reports/board-comparison-chart';
import { DeadlineHealthChart } from '@/components/reports/deadline-health-chart';
import { exportTasksToCSV, exportEmployeesToCSV } from '@/components/reports/export-utils';
import { useLanguage } from '@/lib/i18n/language-context';
import { 
  BarChart3, 
  Users, 
  ListFilter, 
  Download, 
  Printer, 
  Layers, 
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Reveal } from '@/components/patterns/reveal';
import dynamic from 'next/dynamic';

// Secondary tabs are fetched on demand
const EmployeePerformanceView = dynamic(() =>
  import('@/components/reports/employee-performance-view').then((m) => m.EmployeePerformanceView)
, { ssr: false });
const TaskTable = dynamic(() => import('@/components/reports/task-table').then((m) => m.TaskTable), { ssr: false });

interface ReportDashboardClientProps {
  initialData: WorkspaceReportData;
  workspaceId: string;
}

export function ReportDashboardClient({ initialData, workspaceId }: ReportDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'employees' | 'table'>('tasks');
  const [selectedBoardId, setSelectedBoardId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d'>('all');
  const { t } = useLanguage();
  // Derived report data — calculation logic unchanged, now memoised per filter
  const {
    filteredTasks,
    summary,
    totalTasks,
    statusDistribution,
    priorityDistribution,
    employeeMetrics,
    leaderboard,
  } = useMemo(() => {

    // Filter tasks based on client selection if changed
    const filteredTasks = initialData.tasks.filter((t) => {
      if (selectedBoardId !== 'all' && t.boardId !== selectedBoardId) return false;
      if (timeRange === '7d') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(t.createdAt) >= sevenDaysAgo;
      }
      if (timeRange === '30d') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(t.createdAt) >= thirtyDaysAgo;
      }
      return true;
    });

    // Recompute summary for active filter
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter((t) => t.isCompleted).length;
    const inProgressTasks = filteredTasks.filter((t) => t.isInProgress).length;
    const backlogTasks = totalTasks - completedTasks - inProgressTasks;
    const overdueTasks = filteredTasks.filter((t) => t.isOverdue).length;
    const dueSoonTasks = filteredTasks.filter((t) => t.isDueSoon).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalMembers = initialData.summary.totalMembers;
    const averageTasksPerMember =
      totalMembers > 0 ? Number((totalTasks / totalMembers).toFixed(1)) : 0;

    const summary = {
      totalTasks,
      completedTasks,
      inProgressTasks,
      backlogTasks,
      completionRate,
      overdueTasks,
      dueSoonTasks,
      averageTasksPerMember,
      totalMembers,
    };

    // Recompute status distribution for active filtered tasks
    const statusMap = new Map<string, number>();
    for (const t of filteredTasks) {
      statusMap.set(t.columnTitle, (statusMap.get(t.columnTitle) || 0) + 1);
    }

    const statusDistribution = Array.from(statusMap.entries()).map(([title, count]) => {
      let colorClass = 'text-primary';
      let bgClass = 'bg-primary/20';

      const lower = title.toLowerCase();
      if (lower.includes('done') || lower.includes('complete') || lower.includes('selesai')) {
        colorClass = 'text-success';
        bgClass = 'bg-pastel-mint';
      } else if (lower.includes('progress') || lower.includes('in dev') || lower.includes('sedang')) {
        colorClass = 'text-warning';
        bgClass = 'bg-pastel-peach';
      } else if (lower.includes('review') || lower.includes('test')) {
        colorClass = 'text-accent-foreground';
        bgClass = 'bg-pastel-lavender';
      } else if (lower.includes('todo') || lower.includes('to do')) {
        colorClass = 'text-info';
        bgClass = 'bg-pastel-sky';
      }

      return {
        id: title,
        title,
        count,
        percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0,
        colorClass,
        bgClass,
      };
    });

    // Recompute priority distribution
    const priorityCounts = { 3: 0, 2: 0, 1: 0, 0: 0 };
    for (const t of filteredTasks) {
      if (t.priority in priorityCounts) {
        priorityCounts[t.priority as 0 | 1 | 2 | 3]++;
      }
    }

    const priorityDistribution = [
      {
        priority: 3,
        label: t('kanban.priorityUrgent'),
        count: priorityCounts[3],
        percentage: totalTasks > 0 ? Math.round((priorityCounts[3] / totalTasks) * 100) : 0,
        colorClass: 'text-danger',
        bgClass: 'bg-pastel-rose',
        badgeClass: 'bg-danger-soft text-danger border-danger/25',
      },
      {
        priority: 2,
        label: t('kanban.priorityMedium'),
        count: priorityCounts[2],
        percentage: totalTasks > 0 ? Math.round((priorityCounts[2] / totalTasks) * 100) : 0,
        colorClass: 'text-warning',
        bgClass: 'bg-pastel-peach',
        badgeClass: 'bg-warning-soft text-warning border-warning/25',
      },
      {
        priority: 1,
        label: t('kanban.priorityLow'),
        count: priorityCounts[1],
        percentage: totalTasks > 0 ? Math.round((priorityCounts[1] / totalTasks) * 100) : 0,
        colorClass: 'text-info',
        bgClass: 'bg-pastel-sky',
        badgeClass: 'bg-info-soft text-info border-info/25',
      },
      {
        priority: 0,
        label: t('kanban.priorityNone'),
        count: priorityCounts[0],
        percentage: totalTasks > 0 ? Math.round((priorityCounts[0] / totalTasks) * 100) : 0,
        colorClass: 'text-muted-foreground dark:text-muted-foreground',
        bgClass: 'bg-muted',
        badgeClass: 'bg-muted text-muted-foreground border-border',
      },
    ];

    // Recompute employee metrics based on current filter
    const employeeMetrics = initialData.employeeMetrics.map((m) => {
      const memberTasks = filteredTasks.filter((t) => t.assignees.some((u) => u.id === m.id));
      const totalAssigned = memberTasks.length;
      const completedMemberTasks = memberTasks.filter((t) => t.isCompleted).length;
      const inProgressMemberTasks = memberTasks.filter((t) => t.isInProgress).length;
      const overdueMemberTasks = memberTasks.filter((t) => t.isOverdue).length;

      const memberCompletionRate =
        totalAssigned > 0 ? Math.round((completedMemberTasks / totalAssigned) * 100) : 0;
      const onTimeRate =
        totalAssigned > 0
          ? Math.max(0, Math.min(100, Math.round(((totalAssigned - overdueMemberTasks) / totalAssigned) * 100)))
          : 100;

      let workloadStatus: 'light' | 'optimal' | 'heavy' | 'overloaded' = 'light';
      if (inProgressMemberTasks === 0) {
        workloadStatus = 'light';
      } else if (inProgressMemberTasks <= 3) {
        workloadStatus = 'optimal';
      } else if (inProgressMemberTasks <= 6) {
        workloadStatus = 'heavy';
      } else {
        workloadStatus = 'overloaded';
      }

      return {
        ...m,
        totalAssigned,
        completedTasks: completedMemberTasks,
        inProgressTasks: inProgressMemberTasks,
        overdueTasks: overdueMemberTasks,
        completionRate: memberCompletionRate,
        onTimeRate,
        workloadStatus,
      };
    });

    const leaderboard = [...employeeMetrics].sort((a, b) => {
      if (b.completedTasks !== a.completedTasks) return b.completedTasks - a.completedTasks;
      if (b.completionRate !== a.completionRate) return b.completionRate - a.completionRate;
      return b.activityCount - a.activityCount;
    });

    return {
      filteredTasks,
      summary,
      totalTasks,
      statusDistribution,
      priorityDistribution,
      employeeMetrics,
      leaderboard,
    };
  }, [initialData, selectedBoardId, timeRange, t]);

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: 'tasks', icon: BarChart3, label: t('reports.tabAnalytics'), short: t('reports.tabAnalytics') },
    { id: 'employees', icon: Users, label: t('reports.tabTeam'), short: t('reports.tabTeamShort') },
    { id: 'table', icon: ListFilter, label: t('reports.tabTasks'), short: t('reports.tabTasks') },
  ] as const;

  return (
    <div className="h-full overflow-y-auto" data-print-expand>
      <div className="mx-auto w-full max-w-[1440px] space-y-5 px-3 pb-10 pt-4 sm:space-y-6 sm:px-5 sm:pt-5 lg:px-8 lg:pt-7">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t('reports.title')}</h1>
              <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-success-soft px-2 text-xs font-medium text-success">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-success" />
                </span>
                {t('common.live')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {initialData.workspace.name} · {t('reports.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2" data-print-hide>
            <Select value={selectedBoardId} onValueChange={setSelectedBoardId}>
              <SelectTrigger className="h-9 min-w-0 flex-1 justify-start gap-2 sm:w-[13rem] sm:flex-none [&>svg:last-child]:ml-auto" aria-label={t('ui.board')}>
                <Layers className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('reports.allBoards')} ({initialData.boards.length})
                </SelectItem>
                {initialData.boards.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={(v) => v && setTimeRange(v as 'all' | '30d' | '7d')}
              aria-label={t('ui.dateRange')}
              className="order-last grid w-full grid-cols-3 sm:order-none sm:inline-flex sm:w-auto"
            >
              <ToggleGroupItem value="all">
                <Calendar aria-hidden className="hidden sm:block" />
                {t('reports.allTime')}
              </ToggleGroupItem>
              <ToggleGroupItem value="30d">{t('ui.range30')}</ToggleGroupItem>
              <ToggleGroupItem value="7d">{t('ui.range7')}</ToggleGroupItem>
            </ToggleGroup>

            <div className="flex items-center gap-2 sm:ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9" aria-label={t('common.export')}>
                    <Download className="size-4" aria-hidden />
                    <span className="hidden sm:inline">{t('common.export')}</span>
                    <ChevronDown className="hidden size-4 text-muted-foreground sm:block" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem onSelect={() => exportTasksToCSV(filteredTasks, initialData.workspace.name)}>
                    <ListFilter className="text-info" />
                    {t('common.exportTasksCsv')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => exportEmployeesToCSV(employeeMetrics, initialData.workspace.name)}>
                    <Users className="text-accent-foreground" />
                    {t('common.exportTeamCsv')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={handlePrint} variant="outline" className="h-9" aria-label={t('common.print')}>
                <Printer className="size-4" aria-hidden />
                <span className="hidden sm:inline">{t('common.print')}</span>
              </Button>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} indicatorId="reports-tabs">
          <div className="sticky top-0 z-20 -mx-3 bg-background/80 px-3 py-2 backdrop-blur-lg sm:-mx-5 sm:px-5 lg:-mx-8 lg:px-8" data-print-hide>
            <TabsList className="grid w-full grid-cols-3 sm:inline-flex sm:w-auto">
              {tabs.map(({ id, icon: Icon, label, short }) => (
                <TabsTrigger key={id} value={id} className="min-w-0">
                  <Icon aria-hidden />
                  <span className="truncate sm:hidden">{short}</span>
                  <span className="hidden truncate sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="tasks" className="mt-3 space-y-5 sm:space-y-6">
            <KpiCards
              summary={summary}
              boardsCount={initialData.boards.length}
              tasks={filteredTasks}
              members={employeeMetrics}
              workspaceId={workspaceId}
              dailyTrends={initialData.dailyTrends}
            />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Reveal>
                <StatusChart statusDistribution={statusDistribution} totalTasks={totalTasks} />
              </Reveal>
              <Reveal delay={0.06}>
                <PriorityChart priorityDistribution={priorityDistribution} totalTasks={totalTasks} />
              </Reveal>
            </div>

            <Reveal>
              <DeadlineHealthChart tasks={filteredTasks} />
            </Reveal>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
              <Reveal className="xl:col-span-3">
                <BoardComparisonChart boards={initialData.boards} tasks={filteredTasks} workspaceId={workspaceId} />
              </Reveal>
              <Reveal className="xl:col-span-2" delay={0.06}>
                <VelocityChart dailyTrends={initialData.dailyTrends} />
              </Reveal>
            </div>
          </TabsContent>

          <TabsContent value="employees" className="mt-3">
            <Reveal animateBars>
              <EmployeePerformanceView employeeMetrics={employeeMetrics} leaderboard={leaderboard} />
            </Reveal>
          </TabsContent>

          <TabsContent value="table" className="mt-3">
            <TaskTable tasks={filteredTasks} workspaceId={workspaceId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
