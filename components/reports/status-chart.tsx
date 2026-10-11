'use client';

import type { StatusDistributionItem } from '@/lib/queries/report-queries';
import { cn } from '@/lib/utils';
import { Layers } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

interface StatusChartProps {
  statusDistribution: StatusDistributionItem[];
  totalTasks: number;
}

export function StatusChart({ statusDistribution, totalTasks }: StatusChartProps) {
  const { t } = useLanguage();

  if (totalTasks === 0 || statusDistribution.length === 0) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md p-5 flex flex-col justify-center items-center h-[260px] text-center shadow-xs">
        <Layers className="w-8 h-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm font-semibold text-foreground">{t('reports.statusChartEmpty')}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t('reports.statusChartEmptySub')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md p-3.5 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pastel-mint ring-2 ring-emerald-400/30 shrink-0" />
            {t('reports.statusChartTitle')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('reports.statusChartSub')}
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs font-semibold text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-full border border-border/60 shrink-0">
          {totalTasks} Total
        </span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-border/50">
          {statusDistribution.map((item, idx) => (
            <div
              key={idx}
              style={{ width: `${Math.max(item.percentage, 2)}%` }}
              title={`${item.title}: ${item.count} task (${item.percentage}%)`}
              className={cn(
                'h-full rounded-full transition-all duration-500 hover:opacity-80',
                item.bgClass
              )}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Status Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1">
        {statusDistribution.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/70 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn('w-2.5 h-2.5 rounded-full shrink-0 shadow-xs', item.bgClass)} />
              <span className="text-xs font-medium truncate text-foreground">{item.title}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <span className="text-xs font-bold text-foreground">{item.count}</span>
              <span className="text-[10px] text-muted-foreground font-medium">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
