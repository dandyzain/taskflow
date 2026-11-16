'use client'

import * as React from 'react'
import * as m from 'motion/react-m'
import { Activity as ActivityIcon } from 'lucide-react'
import type { ActivityItem } from '@/lib/queries/activity-queries'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/patterns/empty-state'
import { UserAvatar } from '@/components/patterns/user-avatar'
import { useLanguage } from '@/lib/i18n/language-context'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface ActivityFeedProps {
  activities: ActivityItem[]
  open: boolean
  loading?: boolean
  onOpenChange: (open: boolean) => void
}

const ENTITY_DOT: Record<string, string> = {
  CARD: 'bg-[hsl(205_85%_55%)]',
  COLUMN: 'bg-[hsl(268_70%_65%)]',
  BOARD: 'bg-[hsl(152_60%_45%)]',
  WORKSPACE: 'bg-[hsl(32_95%_55%)]',
}

export function ActivityFeed({ activities, open, loading, onOpenChange }: ActivityFeedProps) {
  const { t, lang } = useLanguage()

  const relative = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return t('ui.justNow')
    if (mins < 60) return t('ui.minutesAgo', { n: mins })
    const hours = Math.floor(mins / 60)
    if (hours < 24) return t('ui.hoursAgo', { n: hours })
    const days = Math.floor(hours / 24)
    if (days < 7) return t('ui.daysAgo', { n: days })
    return new Date(dateStr).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US')
  }

  const describe = (action: string) => {
    const key = `ui.act${action}`
    const v = t(key)
    return v === key ? action.toLowerCase().replace(/_/g, ' ') : v
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-[420px] max-w-[92vw] flex-col gap-0 p-0 sm:max-w-[420px]">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2.5 text-base">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <ActivityIcon className="size-4" aria-hidden />
            </span>
            {t('ui.activityTrail')}
          </SheetTitle>
          <SheetDescription className="sr-only">{t('ui.activityTrail')}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <EmptyState icon={ActivityIcon} title={t('ui.noActivity')} size="sm" />
          ) : (
            <ol className="relative space-y-1 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-border">
              {activities.map((activity, i) => {
                const title =
                  'title' in activity.metadata && typeof activity.metadata.title === 'string'
                    ? activity.metadata.title
                    : null
                return (
                  <m.li
                    key={activity.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: EASE_OUT, delay: Math.min(i, 12) * 0.025 }}
                    className="relative flex gap-3 rounded-xl p-1.5 transition-colors hover:bg-secondary/60"
                  >
                    <span className="relative">
                      <UserAvatar user={{ id: activity.user.id ?? activity.user.name, name: activity.user.name }} size="md" ring />
                      <span
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card',
                          ENTITY_DOT[activity.entityType] ?? 'bg-muted-foreground'
                        )}
                        aria-hidden
                      />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5 text-sm">
                      <p className="leading-snug">
                        <span className="font-medium text-foreground">{activity.user.name}</span>{' '}
                        <span className="text-muted-foreground">{describe(activity.action)}</span>
                      </p>
                      {title && <p className="mt-0.5 truncate text-sm text-foreground/90">“{title}”</p>}
                      <time className="text-xs text-muted-foreground" dateTime={activity.createdAt}>
                        {relative(activity.createdAt)}
                      </time>
                    </div>
                  </m.li>
                )
              })}
            </ol>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
