'use client';

import { useState } from 'react';
import type { TaskItemReport } from '@/lib/queries/report-queries';
import { Search, Filter, AlertTriangle, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TaskTableProps {
  tasks: TaskItemReport[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'progress' | 'overdue'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.boardTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.columnTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.assignees.some((a) => a.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && t.isCompleted) ||
      (statusFilter === 'progress' && t.isInProgress) ||
      (statusFilter === 'overdue' && t.isOverdue);

    const matchesPriority =
      priorityFilter === 'all' || t.priority.toString() === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Rincian Laporan Seluruh Task ({filteredTasks.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar tugas terstruktur dengan status, penanggung jawab, dan tenggat waktu
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul task, assignee..."
              className="pl-8 h-8 text-xs rounded-xl bg-background/60 border-border/80"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-xl border border-border/60 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all',
                statusFilter === 'all' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter('progress')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all',
                statusFilter === 'progress' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all',
                statusFilter === 'completed' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Selesai
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all',
                statusFilter === 'overdue' ? 'bg-card text-rose-600 dark:text-rose-400 shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Terlambat
            </button>
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="overflow-x-auto rounded-xl border border-border/70">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/40 border-b border-border/70 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-4 py-3">Judul Task</th>
              <th className="px-3 py-3">Board</th>
              <th className="px-3 py-3">Status / Kolom</th>
              <th className="px-3 py-3">Prioritas</th>
              <th className="px-3 py-3">Tenggat Waktu</th>
              <th className="px-4 py-3">Assignee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                  Tidak ada task yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const priorityBadge =
                  task.priority === 3
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200'
                    : task.priority === 2
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200'
                    : task.priority === 1
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200'
                    : 'bg-muted text-muted-foreground border-border';

                return (
                  <tr key={task.id} className="hover:bg-secondary/30 transition-colors">
                    {/* Title */}
                    <td className="px-4 py-3 font-semibold text-foreground max-w-xs truncate">
                      <div className="space-y-0.5">
                        <span className="block truncate">{task.title}</span>
                        {task.labels.length > 0 && (
                          <div className="flex gap-1 flex-wrap pt-0.5">
                            {task.labels.map((l) => (
                              <span
                                key={l.id}
                                className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-secondary text-muted-foreground border border-border/40"
                              >
                                {l.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Board */}
                    <td className="px-3 py-3 text-muted-foreground font-medium">
                      {task.boardTitle}
                    </td>

                    {/* Column */}
                    <td className="px-3 py-3">
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                        task.isCompleted
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200'
                          : task.isInProgress
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200'
                          : 'bg-secondary text-foreground border-border/60'
                      )}>
                        {task.columnTitle}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-3 py-3">
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', priorityBadge)}>
                        {task.priorityLabel}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="px-3 py-3">
                      {task.dueDate ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span
                            className={cn(
                              'font-medium',
                              task.isOverdue
                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                : task.isDueSoon
                                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                : 'text-muted-foreground'
                            )}
                          >
                            {new Date(task.dueDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {task.isOverdue && (
                            <span className="text-[9px] bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 px-1 py-0.2 rounded font-bold border border-rose-200">
                              Telat
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>

                    {/* Assignees */}
                    <td className="px-4 py-3">
                      {task.assignees.length > 0 ? (
                        <div className="flex -space-x-1.5 items-center">
                          {task.assignees.map((u) => (
                            <Avatar key={u.id} className="w-6 h-6 border-2 border-background" title={u.name}>
                              {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.name} />}
                              <AvatarFallback className="text-[9px] font-bold bg-pastel-lavender text-pastel-lavender-text">
                                {u.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {task.assignees.length === 1 && (
                            <span className="text-xs text-muted-foreground font-medium pl-3 truncate max-w-[100px]">
                              {task.assignees[0].name}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 text-[11px]">Unassigned</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
