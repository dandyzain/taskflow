'use client'

import * as React from 'react'
import type { ActivityItem } from '@/lib/queries/activity-queries'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Activity as ActivityIcon, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityFeedProps {
  activities: ActivityItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    'CARD_CREATED': 'created a card',
    'CARD_UPDATED': 'updated card details',
    'CARD_MOVED': 'moved a card',
    'CARD_REORDERED': 'reordered a card',
    'CARD_DELETED': 'deleted a card',
    'COLUMN_CREATED': 'created a column',
    'COLUMN_UPDATED': 'renamed a column',
    'COLUMN_DELETED': 'deleted a column',
    'COLUMN_REORDERED': 'reordered columns',
    'BOARD_CREATED': 'created a board',
    'BOARD_UPDATED': 'updated board details',
    'BOARD_DELETED': 'deleted a board',
    'CARD_ASSIGNED': 'assigned a member',
    'CARD_UNASSIGNED': 'unassigned a member',
    'WORKSPACE_CREATED': 'created the workspace',
  };
  return actionMap[action] ?? action.toLowerCase().replace(/_/g, ' ');
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getEntityBadge(entityType: string) {
  switch (entityType) {
    case 'CARD':
      return { dot: 'bg-pastel-sky ring-sky-300/50', label: 'Card' };
    case 'COLUMN':
      return { dot: 'bg-pastel-lavender ring-purple-300/50', label: 'Column' };
    case 'BOARD':
      return { dot: 'bg-pastel-mint ring-emerald-300/50', label: 'Board' };
    case 'WORKSPACE':
      return { dot: 'bg-pastel-peach ring-amber-300/50', label: 'Workspace' };
    default:
      return { dot: 'bg-muted-foreground ring-border', label: entityType };
  }
}

export function ActivityFeed({ activities, open, onOpenChange }: ActivityFeedProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full w-[380px] sm:w-[480px] border-l border-border/70 bg-card/95 backdrop-blur-xl px-0 py-5 shadow-pastel">
        <SheetHeader className="px-6 mb-3 border-b border-border/50 pb-3">
          <SheetTitle className="flex items-center gap-2.5 text-base font-bold text-foreground">
            <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <ActivityIcon className="w-4 h-4" />
            </div>
            Activity Trail
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-6">
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground/70 py-12 text-xs italic">
              No recorded activity yet
            </div>
          ) : (
            <div className="relative pl-4 border-l border-border/60 space-y-4 py-2">
              {activities.map((activity) => {
                const badge = getEntityBadge(activity.entityType);
                return (
                  <div key={activity.id} className="relative group text-xs">
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 shadow-xs transition-transform group-hover:scale-125",
                      badge.dot
                    )} />
                    
                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 shadow-2xs group-hover:border-primary/20 transition-all space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">
                          {activity.user.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatRelativeTime(activity.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        {formatAction(activity.action)}
                      </p>

                      {'title' in activity.metadata && typeof activity.metadata.title === 'string' && (
                        <div className="text-[11px] font-medium text-foreground bg-card/80 px-2 py-1 rounded-lg border border-border/40 mt-1 truncate">
                          &quot;{activity.metadata.title}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
