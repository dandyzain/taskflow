'use client';

import { useState } from 'react';
import { BarChart3, Table2, TrendingUp } from 'lucide-react';
import type { DailyActivityTrend } from '@/lib/queries/report-queries';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';

interface VelocityChartProps {
  dailyTrends: DailyActivityTrend[];
}

/**
 * Created vs completed per day. Bars are keyboard-focusable and show the same
 * tooltip on hover or focus; a table view gives an accessible fallback.
 */
export function VelocityChart({ dailyTrends }: VelocityChartProps) {
  const { t, lang } = useLanguage();
  const [active, setActive] = useState<number | null>(null);
  const [mode, setMode] = useState<'chart' | 'table'>('chart');

  const maxVal = Math.max(1, ...dailyTrends.map((d) => Math.max(d.createdCount, d.completedCount)));
  const totalCreated = dailyTrends.reduce((acc, d) => acc + d.createdCount, 0);
  const totalCompleted = dailyTrends.reduce((acc, d) => acc + d.completedCount, 0);

  const formatDay = (dateStr: string, fallback: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-4 shadow-e1 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold">
            <TrendingUp className="size-4 shrink-0 text-primary" aria-hidden />
            {t('reports.velocityChartTitle')}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('reports.velocityChartSub')}</p>
        </div>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => v && setMode(v as 'chart' | 'table')}
          data-print-hide
          aria-label={t('ui.viewMode')}
        >
          <ToggleGroupItem value="chart" aria-label={t('ui.viewAsChart')}>
            <BarChart3 aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label={t('ui.viewAsTable')}>
            <Table2 aria-hidden />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[hsl(var(--brand-to))]" aria-hidden />
          <span className="text-muted-foreground">{t('reports.createdLegend')}</span>
          <span className="font-semibold tabular-nums">{totalCreated}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-success" aria-hidden />
          <span className="text-muted-foreground">{t('reports.completedLegend')}</span>
          <span className="font-semibold tabular-nums">{totalCompleted}</span>
        </span>
      </div>

      {mode === 'chart' ? (
        <div className="relative mt-auto">
          {/* gridlines */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="border-t border-dashed border-border/70" />
            ))}
          </div>
          <div className="relative flex h-48 items-end gap-1.5 sm:gap-3" role="list" aria-label={t('reports.velocityChartTitle')}>
            {dailyTrends.map((day, idx) => {
              const createdH = Math.max(4, (day.createdCount / maxVal) * 100);
              const completedH = Math.max(4, (day.completedCount / maxVal) * 100);
              const isActive = active === idx;
              const label = formatDay(day.date, day.formattedDate);
              return (
                <div
                  key={idx}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${label}: ${day.createdCount} ${t('reports.trendCreatedSuffix')}, ${day.completedCount} ${t('reports.trendCompletedSuffix')}`}
                  onMouseEnter={() => setActive(idx)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(idx)}
                  onBlur={() => setActive(null)}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {isActive && (
                    <div
                      className={cn(
                        'pointer-events-none absolute -top-2 z-10 -translate-y-full animate-scale-in whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background shadow-e2',
                        idx === 0 ? 'left-0' : idx === dailyTrends.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                      )}
                    >
                      <p className="font-semibold">{label}</p>
                      <p className="opacity-80">
                        +{day.createdCount} {t('reports.trendCreatedSuffix')} · {day.completedCount} {t('reports.trendCompletedSuffix')}
                      </p>
                    </div>
                  )}
                  <div
                    className={cn(
                      'flex h-[calc(100%-1.5rem)] w-full items-end justify-center gap-0.5 rounded-md transition-colors sm:gap-1',
                      isActive && 'bg-secondary/70'
                    )}
                  >
                    <div
                      style={{ height: `${createdH}%` }}
                      className="w-2.5 rounded-t-[4px] bg-[hsl(var(--brand-to))] transition-opacity sm:w-3.5"
                    />
                    <div
                      style={{ height: `${completedH}%` }}
                      className="w-2.5 rounded-t-[4px] bg-success transition-opacity sm:w-3.5"
                    />
                  </div>
                  <span
                    className={cn(
                      'h-6 pt-1.5 text-2xs tabular-nums text-muted-foreground transition-colors',
                      isActive && 'font-medium text-foreground'
                    )}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 text-left font-medium">{t('ui.date')}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{t('reports.createdLegend')}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{t('reports.completedLegend')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dailyTrends.map((day, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2">{formatDay(day.date, day.formattedDate)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{day.createdCount}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{day.completedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
