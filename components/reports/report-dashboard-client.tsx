'use client';

import { useState } from 'react';
import type { WorkspaceReportData } from '@/lib/queries/report-queries';
import { KpiCards } from '@/components/reports/kpi-cards';
import { StatusChart } from '@/components/reports/status-chart';
import { PriorityChart } from '@/components/reports/priority-chart';
import { VelocityChart } from '@/components/reports/velocity-chart';
import { EmployeePerformanceView } from '@/components/reports/employee-performance-view';
import { TaskTable } from '@/components/reports/task-table';
import { BoardComparisonChart } from '@/components/reports/board-comparison-chart';
import { DeadlineHealthChart } from '@/components/reports/deadline-health-chart';
import { exportTasksToCSV, exportEmployeesToCSV } from '@/components/reports/export-utils';
import { 
  BarChart3, 
  Users, 
  ListFilter, 
  Download, 
  Printer, 
  Layers, 
  Calendar,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ReportDashboardClientProps {
  initialData: WorkspaceReportData;
  workspaceId: string;
}

export function ReportDashboardClient({ initialData, workspaceId }: ReportDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'employees' | 'table'>('tasks');
  const [selectedBoardId, setSelectedBoardId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d'>('all');

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
      colorClass = 'text-emerald-600 dark:text-emerald-400';
      bgClass = 'bg-pastel-mint';
    } else if (lower.includes('progress') || lower.includes('in dev') || lower.includes('sedang')) {
      colorClass = 'text-amber-600 dark:text-amber-400';
      bgClass = 'bg-pastel-peach';
    } else if (lower.includes('review') || lower.includes('test')) {
      colorClass = 'text-purple-600 dark:text-purple-400';
      bgClass = 'bg-pastel-lavender';
    } else if (lower.includes('todo') || lower.includes('to do')) {
      colorClass = 'text-sky-600 dark:text-sky-400';
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
      label: 'Urgent / Tinggi',
      count: priorityCounts[3],
      percentage: totalTasks > 0 ? Math.round((priorityCounts[3] / totalTasks) * 100) : 0,
      colorClass: 'text-rose-600 dark:text-rose-400',
      bgClass: 'bg-pastel-rose',
      badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200',
    },
    {
      priority: 2,
      label: 'Medium / Sedang',
      count: priorityCounts[2],
      percentage: totalTasks > 0 ? Math.round((priorityCounts[2] / totalTasks) * 100) : 0,
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-pastel-peach',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200',
    },
    {
      priority: 1,
      label: 'Low / Rendah',
      count: priorityCounts[1],
      percentage: totalTasks > 0 ? Math.round((priorityCounts[1] / totalTasks) * 100) : 0,
      colorClass: 'text-sky-600 dark:text-sky-400',
      bgClass: 'bg-pastel-sky',
      badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200',
    },
    {
      priority: 0,
      label: 'Normal / Tanpa Prioritas',
      count: priorityCounts[0],
      percentage: totalTasks > 0 ? Math.round((priorityCounts[0] / totalTasks) * 100) : 0,
      colorClass: 'text-slate-600 dark:text-slate-400',
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header & Reporting Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/60 shrink-0">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/20 flex items-center justify-center shadow-xs shrink-0">
                <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </span>
              <h1 className="text-base sm:text-2xl font-bold tracking-tight text-foreground truncate">
                Dashboard & Laporan
              </h1>
            </div>

            {/* Live Indicator Pill */}
            <span className="text-[10px] sm:text-[11px] font-semibold bg-pastel-mint/70 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-300/40 shadow-xs shrink-0 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <p className="text-xs text-muted-foreground mt-1 pl-[42px] sm:pl-0 truncate sm:whitespace-normal">
            Analitik tugas dan produktivitas tim
          </p>
        </div>

        {/* Global Controls & Export */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Row 1 on mobile: Board & Time Filter */}
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            {/* Board Selector */}
            <div className="col-span-1 flex items-center gap-1.5 bg-card/80 border border-border/80 rounded-xl px-2.5 h-9 text-xs shadow-xs min-w-0">
              <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <select
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer w-full truncate pr-1"
              >
                <option value="all">Semua Board ({initialData.boards.length})</option>
                {initialData.boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range Filter */}
            <div className="col-span-1 flex items-center gap-1.5 bg-card/80 border border-border/80 rounded-xl px-2.5 h-9 text-xs shadow-xs min-w-0">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'all' | '30d' | '7d')}
                className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer w-full truncate pr-1"
              >
                <option value="all">Semua Waktu</option>
                <option value="30d">30 Hari Terakhir</option>
                <option value="7d">7 Hari Terakhir</option>
              </select>
            </div>
          </div>

          {/* Row 2 on mobile: Export & Print */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Export Dropdown Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-initial rounded-xl border-border/80 text-xs gap-2 shadow-xs bg-card/80 hover:bg-card h-9 px-3 justify-between sm:justify-center font-semibold"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Download className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Ekspor Data</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 rounded-2xl p-2 border-border/80 shadow-pastel bg-card/95 backdrop-blur-xl">
                <div className="space-y-1">
                  <button
                    onClick={() => exportTasksToCSV(filteredTasks, initialData.workspace.name)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary/70 transition-colors flex items-center gap-2"
                  >
                    <ListFilter className="w-4 h-4 text-sky-500" />
                    Ekspor Data Tugas (CSV)
                  </button>
                  <button
                    onClick={() => exportEmployeesToCSV(employeeMetrics, initialData.workspace.name)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary/70 transition-colors flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-purple-500" />
                    Ekspor Kinerja Tim (CSV)
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Print Button */}
            <Button
              onClick={handlePrint}
              variant="outline"
              className="h-9 px-3 rounded-xl border border-border/80 bg-card/80 hover:bg-card text-muted-foreground hover:text-foreground shrink-0 shadow-xs flex items-center gap-1.5 text-xs font-semibold"
              title="Cetak Laporan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Cetak</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 p-1 bg-secondary/50 rounded-2xl border border-border/60 w-full sm:max-w-fit shrink-0">
        <button
          onClick={() => setActiveTab('tasks')}
          className={cn(
            'flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 text-center',
            activeTab === 'tasks'
              ? 'bg-card text-foreground shadow-xs border border-border/50'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <BarChart3 className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">Analitik</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={cn(
            'flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 text-center',
            activeTab === 'employees'
              ? 'bg-card text-foreground shadow-xs border border-border/50'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <span className="truncate">Kinerja Tim</span>
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={cn(
            'flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 text-center',
            activeTab === 'table'
              ? 'bg-card text-foreground shadow-xs border border-border/50'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ListFilter className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Daftar Task</span>
        </button>
      </div>

      {/* Tab 1: Task Analytics & Overview */}
      {activeTab === 'tasks' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* KPI Cards with 8 Expanded Metrics & Clickable Detail Modals */}
          <KpiCards
            summary={summary}
            boardsCount={initialData.boards.length}
            tasks={filteredTasks}
            members={employeeMetrics}
            workspaceId={workspaceId}
          />

          {/* 2-Column Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <StatusChart statusDistribution={statusDistribution} totalTasks={totalTasks} />
            <PriorityChart priorityDistribution={priorityDistribution} totalTasks={totalTasks} />
          </div>

          {/* SLA & Deadline Health Distribution Chart */}
          <DeadlineHealthChart tasks={filteredTasks} />

          {/* Board Performance & Workload Comparison */}
          <BoardComparisonChart
            boards={initialData.boards}
            tasks={filteredTasks}
            workspaceId={workspaceId}
          />

          {/* Velocity Trend Line/Bar Chart */}
          <VelocityChart dailyTrends={initialData.dailyTrends} />
        </div>
      )}

      {/* Tab 2: Employee Performance & Evaluation */}
      {activeTab === 'employees' && (
        <div className="animate-in fade-in duration-300">
          <EmployeePerformanceView employeeMetrics={employeeMetrics} leaderboard={leaderboard} />
        </div>
      )}

      {/* Tab 3: Detailed Task Report Table & Inventory Analytics */}
      {activeTab === 'table' && (
        <div className="animate-in fade-in duration-300">
          <TaskTable tasks={filteredTasks} workspaceId={workspaceId} />
        </div>
      )}
    </div>
  );
}
