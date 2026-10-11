'use client';

import { useState } from 'react';
import type { DailyActivityTrend } from '@/lib/queries/report-queries';
import { TrendingUp, PlusCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';

interface VelocityChartProps {
  dailyTrends: DailyActivityTrend[];
}

export function VelocityChart({ dailyTrends }: VelocityChartProps) {
  const { t, lang } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxVal = Math.max(
    1,
    ...dailyTrends.map((d) => Math.max(d.createdCount, d.completedCount))
  );

  const totalCreated = dailyTrends.reduce((acc, d) => acc + d.createdCount, 0);
  const totalCompleted = dailyTrends.reduce((acc, d) => acc + d.completedCount, 0);

  const formatDay = (dateStr: string, fallback: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return fallback;
      return d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' });
    } catch {
      return fallback;
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md p-3.5 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary shrink-0" />
            {t('reports.velocityChartTitle')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('reports.velocityChartSub')}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] sm:text-xs shrink-0 bg-secondary/50 px-2.5 sm:px-3 py-1.5 rounded-xl border border-border/50 self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pastel-sky ring-2 ring-sky-400/30" />
            <span className="text-muted-foreground font-medium">{t('reports.createdLegend')} ({totalCreated})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pastel-mint ring-2 ring-emerald-400/30" />
            <span className="text-muted-foreground font-medium">{t('reports.completedLegend')} ({totalCompleted})</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div className="pt-4 pb-2">
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-border/60">
          {dailyTrends.map((day, idx) => {
            const createdHeight = Math.max(8, (day.createdCount / maxVal) * 100);
            const completedHeight = Math.max(8, (day.completedCount / maxVal) * 100);
            const isHovered = hoveredIndex === idx;
            const displayDate = formatDay(day.date, day.formattedDate);

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className={cn(
                    "absolute -top-16 z-20 bg-popover/95 backdrop-blur-md border border-border/80 shadow-pastel px-2.5 py-1.5 rounded-xl text-center pointer-events-none whitespace-nowrap animate-in fade-in-up duration-150",
                    idx === 0 ? "left-0" : idx === dailyTrends.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2"
                  )}>
                    <p className="text-[11px] font-bold text-foreground">{displayDate}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span className="text-sky-600 dark:text-sky-400 font-semibold">+{day.createdCount} {t('reports.trendCreatedSuffix')}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{day.completedCount} {t('reports.trendCompletedSuffix')}</span>
                    </div>
                  </div>
                )}

                {/* Bars Pair */}
                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1.5 h-full pb-1">
                  {/* Created Bar */}
                  <div
                    style={{ height: `${createdHeight}%` }}
                    className={cn(
                      'w-2 sm:w-4 rounded-t-md sm:rounded-t-lg bg-pastel-sky transition-all duration-300 shadow-xs hover:brightness-105',
                      isHovered ? 'ring-2 ring-sky-400/40' : ''
                    )}
                  />
                  {/* Completed Bar */}
                  <div
                    style={{ height: `${completedHeight}%` }}
                    className={cn(
                      'w-2 sm:w-4 rounded-t-md sm:rounded-t-lg bg-pastel-mint transition-all duration-300 shadow-xs hover:brightness-105',
                      isHovered ? 'ring-2 ring-emerald-400/40' : ''
                    )}
                  />
                </div>

                {/* Date Label */}
                <span className={cn(
                  'text-[10px] font-semibold text-muted-foreground transition-colors pt-1.5',
                  isHovered ? 'text-primary font-bold' : ''
                )}>
                  {displayDate}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
