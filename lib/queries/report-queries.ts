import { prisma } from "@/lib/prisma";

export interface ReportFilterOptions {
  boardId?: string; // "all" or specific board id
  timeRange?: 'all' | '30d' | '7d';
}

export interface TaskItemReport {
  id: string;
  title: string;
  description: string | null;
  boardId: string;
  boardTitle: string;
  columnId: string;
  columnTitle: string;
  isCompleted: boolean;
  isInProgress: boolean;
  priority: number;
  priorityLabel: 'None' | 'Low' | 'Medium' | 'High';
  dueDate: string | null;
  isOverdue: boolean;
  isDueSoon: boolean;
  createdAt: string;
  updatedAt: string;
  assignees: Array<{ id: string; name: string; avatarUrl: string | null }>;
  labels: Array<{ id: string; name: string; color: string }>;
}

export interface EmployeeMetric {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  totalAssigned: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number; // 0 to 100
  onTimeRate: number; // 0 to 100
  workloadStatus: 'light' | 'optimal' | 'heavy' | 'overloaded';
  activityCount: number;
}

export interface StatusDistributionItem {
  id: string;
  title: string;
  count: number;
  percentage: number;
  colorClass: string;
  bgClass: string;
}

export interface PriorityDistributionItem {
  priority: number;
  label: string;
  count: number;
  percentage: number;
  colorClass: string;
  bgClass: string;
  badgeClass: string;
}

export interface DailyActivityTrend {
  date: string;
  formattedDate: string;
  createdCount: number;
  completedCount: number;
}

export interface WorkspaceReportData {
  workspace: {
    id: string;
    name: string;
  };
  boards: Array<{ id: string; title: string }>;
  tasks: TaskItemReport[];
  summary: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    backlogTasks: number;
    completionRate: number;
    overdueTasks: number;
    dueSoonTasks: number;
    averageTasksPerMember: number;
    totalMembers: number;
  };
  statusDistribution: StatusDistributionItem[];
  priorityDistribution: PriorityDistributionItem[];
  dailyTrends: DailyActivityTrend[];
  employeeMetrics: EmployeeMetric[];
  leaderboard: EmployeeMetric[];
}

function getPriorityLabel(priority: number): 'None' | 'Low' | 'Medium' | 'High' {
  switch (priority) {
    case 3:
      return 'High';
    case 2:
      return 'Medium';
    case 1:
      return 'Low';
    default:
      return 'None';
  }
}

function isColumnDone(title: string): boolean {
  const lower = title.toLowerCase();
  return lower.includes('done') || lower.includes('complete') || lower.includes('selesai') || lower.includes('berhasil');
}

function isColumnProgress(title: string): boolean {
  const lower = title.toLowerCase();
  return (
    lower.includes('progress') ||
    lower.includes('doing') ||
    lower.includes('in dev') ||
    lower.includes('development') ||
    lower.includes('review') ||
    lower.includes('sedang')
  );
}

export async function getWorkspaceReportData(
  workspaceId: string,
  options: ReportFilterOptions = {}
): Promise<WorkspaceReportData | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });

  if (!workspace) return null;

  // 1. Fetch boards in workspace
  const boards = await prisma.board.findMany({
    where: { workspaceId },
    select: { id: true, title: true },
    orderBy: { createdAt: 'asc' },
  });

  // 2. Fetch workspace members
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // 3. Fetch cards with column and board data
  const boardIdFilter = options.boardId && options.boardId !== 'all' ? options.boardId : undefined;

  let dateFilter: Date | undefined;
  if (options.timeRange === '7d') {
    dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - 7);
  } else if (options.timeRange === '30d') {
    dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - 30);
  }

  const cards = await prisma.card.findMany({
    where: {
      column: {
        board: {
          workspaceId,
          ...(boardIdFilter ? { id: boardIdFilter } : {}),
        },
      },
      ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
    },
    include: {
      column: {
        select: {
          id: true,
          title: true,
          board: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      assignees: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      labels: {
        include: {
          label: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 4. Fetch activities for audit / productivity count
  const activities = await prisma.activity.findMany({
    where: {
      workspaceId,
      ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
    },
    select: {
      id: true,
      userId: true,
      action: true,
      createdAt: true,
    },
  });

  const now = new Date();
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

  // Map tasks
  const tasks: TaskItemReport[] = cards.map((c) => {
    const isCompleted = isColumnDone(c.column.title);
    const isInProgress = !isCompleted && isColumnProgress(c.column.title);
    const dueDateObj = c.dueDate ? new Date(c.dueDate) : null;
    const isOverdue = !!dueDateObj && !isCompleted && dueDateObj < now;
    const isDueSoon = !!dueDateObj && !isCompleted && !isOverdue && dueDateObj <= twoDaysFromNow;

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      boardId: c.column.board.id,
      boardTitle: c.column.board.title,
      columnId: c.column.id,
      columnTitle: c.column.title,
      isCompleted,
      isInProgress,
      priority: c.priority,
      priorityLabel: getPriorityLabel(c.priority),
      dueDate: c.dueDate ? c.dueDate.toISOString() : null,
      isOverdue,
      isDueSoon,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      assignees: c.assignees.map((a) => a.user),
      labels: c.labels.map((l) => l.label),
    };
  });

  // Summary Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const inProgressTasks = tasks.filter((t) => t.isInProgress).length;
  const backlogTasks = totalTasks - completedTasks - inProgressTasks;
  const overdueTasks = tasks.filter((t) => t.isOverdue).length;
  const dueSoonTasks = tasks.filter((t) => t.isDueSoon).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalMembers = members.length;
  const averageTasksPerMember = totalMembers > 0 ? Number((totalTasks / totalMembers).toFixed(1)) : 0;

  // Status Distribution
  const statusMap = new Map<string, number>();
  for (const t of tasks) {
    statusMap.set(t.columnTitle, (statusMap.get(t.columnTitle) || 0) + 1);
  }

  const statusDistribution: StatusDistributionItem[] = Array.from(statusMap.entries()).map(
    ([title, count]) => {
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
    }
  );

  // Priority Distribution
  const priorityCounts = { 3: 0, 2: 0, 1: 0, 0: 0 };
  for (const t of tasks) {
    if (t.priority in priorityCounts) {
      priorityCounts[t.priority as 0 | 1 | 2 | 3]++;
    }
  }

  const priorityDistribution: PriorityDistributionItem[] = [
    {
      priority: 3,
      label: 'High (Urgent)',
      count: priorityCounts[3],
      percentage: totalTasks > 0 ? Math.round((priorityCounts[3] / totalTasks) * 100) : 0,
      colorClass: 'text-rose-600 dark:text-rose-400',
      bgClass: 'bg-pastel-rose',
      badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    },
    {
      priority: 2,
      label: 'Medium',
      count: priorityCounts[2],
      percentage: totalTasks > 0 ? Math.round((priorityCounts[2] / totalTasks) * 100) : 0,
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-pastel-peach',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    {
      priority: 1,
      label: 'Low',
      count: priorityCounts[1],
      percentage: totalTasks > 0 ? Math.round((priorityCounts[1] / totalTasks) * 100) : 0,
      colorClass: 'text-sky-600 dark:text-sky-400',
      bgClass: 'bg-pastel-sky',
      badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    },
    {
      priority: 0,
      label: 'Normal',
      count: priorityCounts[0],
      percentage: totalTasks > 0 ? Math.round((priorityCounts[0] / totalTasks) * 100) : 0,
      colorClass: 'text-slate-600 dark:text-slate-400',
      bgClass: 'bg-muted',
      badgeClass: 'bg-muted text-muted-foreground border-border',
    },
  ];

  // Daily Trends (last 7 days)
  const dailyTrendsMap = new Map<string, { created: number; completed: number; formatted: string }>();
  const daysToShow = 7;
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const formatted = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    dailyTrendsMap.set(dateKey, { created: 0, completed: 0, formatted });
  }

  for (const t of tasks) {
    const createdKey = t.createdAt.split('T')[0];
    if (dailyTrendsMap.has(createdKey)) {
      dailyTrendsMap.get(createdKey)!.created++;
    }
    if (t.isCompleted) {
      const updatedKey = t.updatedAt.split('T')[0];
      if (dailyTrendsMap.has(updatedKey)) {
        dailyTrendsMap.get(updatedKey)!.completed++;
      }
    }
  }

  const dailyTrends: DailyActivityTrend[] = Array.from(dailyTrendsMap.entries()).map(
    ([date, val]) => ({
      date,
      formattedDate: val.formatted,
      createdCount: val.created,
      completedCount: val.completed,
    })
  );

  // Employee Metrics
  const activityCountByUser = new Map<string, number>();
  for (const a of activities) {
    activityCountByUser.set(a.userId, (activityCountByUser.get(a.userId) || 0) + 1);
  }

  const employeeMetrics: EmployeeMetric[] = members.map((m) => {
    const memberTasks = tasks.filter((t) => t.assignees.some((u) => u.id === m.user.id));
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
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      totalAssigned,
      completedTasks: completedMemberTasks,
      inProgressTasks: inProgressMemberTasks,
      overdueTasks: overdueMemberTasks,
      completionRate: memberCompletionRate,
      onTimeRate,
      workloadStatus,
      activityCount: activityCountByUser.get(m.user.id) || 0,
    };
  });

  // Leaderboard: Top performers sorted by completed tasks desc, then completionRate desc
  const leaderboard = [...employeeMetrics].sort((a, b) => {
    if (b.completedTasks !== a.completedTasks) return b.completedTasks - a.completedTasks;
    if (b.completionRate !== a.completionRate) return b.completionRate - a.completionRate;
    return b.activityCount - a.activityCount;
  });

  return {
    workspace: {
      id: workspace.id,
      name: workspace.name,
    },
    boards,
    tasks,
    summary: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      backlogTasks,
      completionRate,
      overdueTasks,
      dueSoonTasks,
      averageTasksPerMember,
      totalMembers,
    },
    statusDistribution,
    priorityDistribution,
    dailyTrends,
    employeeMetrics,
    leaderboard,
  };
}
