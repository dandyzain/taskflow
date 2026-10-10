'use client';

import type { PriorityDistributionItem } from '@/lib/queries/report-queries';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface PriorityChartProps {
  priorityDistribution: PriorityDistributionItem[];
  totalTasks: number;
}

export function PriorityChart({ priorityDistribution, totalTasks }: PriorityChartProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md p-3.5 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500 shrink-0" />
            Distribusi Tingkat Prioritas
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Komposisi urgensi tugas untuk perencanaan beban kerja
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs font-semibold text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-full border border-border/60 shrink-0">
          Urgensi Task
        </span>
      </div>

      {/* Priority Progress Bars */}
      <div className="space-y-3 pt-1">
        {priorityDistribution.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span className={cn('w-2 h-2 rounded-full', item.bgClass)} />
                {item.label}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground">{item.count}</span>
                <span className="text-[11px] text-muted-foreground">({item.percentage}%)</span>
              </div>
            </div>

            {/* Individual Bar */}
            <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden p-0.5">
              <div
                style={{ width: `${item.percentage}%` }}
                className={cn('h-full rounded-full transition-all duration-500', item.bgClass)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
