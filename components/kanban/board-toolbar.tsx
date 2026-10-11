'use client';

import * as React from 'react';
import { Search, X, Filter, Tag, RotateCcw, Circle, ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PriorityFilter } from '@/hooks/use-board-filter';

interface BoardToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: PriorityFilter;
  onPriorityFilterChange: (priority: PriorityFilter) => void;
  labelFilter: string;
  onLabelFilterChange: (labelId: string) => void;
  availableLabels: Array<{ id: string; name: string; color: string }>;
  activeFilterCount: number;
  onClearFilters: () => void;
}

export const BoardToolbar = React.forwardRef<HTMLInputElement, BoardToolbarProps>(
  function BoardToolbar(
    {
      searchQuery,
      onSearchChange,
      priorityFilter,
      onPriorityFilterChange,
      labelFilter,
      onLabelFilterChange,
      availableLabels,
      activeFilterCount,
      onClearFilters,
    },
    ref
  ) {
    return (
      <div className="flex items-center gap-2 mb-3 sm:mb-5 flex-wrap p-2 rounded-2xl bg-card/60 backdrop-blur-md border border-border/70 shadow-xs shrink-0">
        {/* Search Input with Shortcut Pill */}
        <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-[200px] sm:max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
          <Input
            ref={ref}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="pl-8 pr-8 h-9 text-xs rounded-xl bg-background/80 border-border/70 focus-visible:ring-primary/40 focus-visible:bg-background transition-all w-full"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-medium text-muted-foreground/70 bg-muted/80 rounded border border-border/60">
            /
          </kbd>
        </div>

        {/* Priority Filter */}
        <div className="flex-1 min-w-[130px] sm:flex-initial sm:w-[145px]">
          <Select value={priorityFilter} onValueChange={onPriorityFilterChange as (value: string) => void}>
            <SelectTrigger className="w-full h-9 text-xs rounded-xl bg-background/80 border-border/70 focus:ring-primary/40 hover:bg-background transition-all">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-3.5 w-3.5 text-primary shrink-0" />
                <SelectValue placeholder="All Priorities" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/70 shadow-pastel">
              <SelectItem value="all" className="text-xs">All Priorities</SelectItem>
              <SelectItem value="0" className="text-xs">
                <span className="flex items-center gap-1.5">
                  <Circle className="h-2.5 w-2.5 text-muted-foreground/60 shrink-0" />
                  <span>None</span>
                </span>
              </SelectItem>
              <SelectItem value="1" className="text-xs">
                <span className="flex items-center gap-1.5">
                  <ArrowDown className="h-3 w-3 text-sky-500 shrink-0" />
                  <span>Low Priority</span>
                </span>
              </SelectItem>
              <SelectItem value="2" className="text-xs">
                <span className="flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 text-amber-500 shrink-0" />
                  <span>Medium Priority</span>
                </span>
              </SelectItem>
              <SelectItem value="3" className="text-xs">
                <span className="flex items-center gap-1.5">
                  <ArrowUp className="h-3 w-3 text-rose-500 shrink-0" />
                  <span>High Priority</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Label Filter */}
        <div className="flex-1 min-w-[130px] sm:flex-initial sm:w-[145px]">
          <Select value={labelFilter} onValueChange={onLabelFilterChange as (value: string) => void}>
            <SelectTrigger className="w-full h-9 text-xs rounded-xl bg-background/80 border-border/70 focus:ring-primary/40 hover:bg-background transition-all">
              <div className="flex items-center gap-2 truncate">
                <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
                <SelectValue placeholder="All Labels" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/70 shadow-pastel max-h-56">
              <SelectItem value="all" className="text-xs">All Labels</SelectItem>
              {availableLabels.map(label => (
                <SelectItem key={label.id} value={label.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                    <span className="truncate">{label.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground rounded-xl hover:bg-pastel-rose/30 transition-all duration-200 animate-scale-in ml-auto sm:ml-0"
          >
            <RotateCcw className="h-3 w-3 mr-1.5" />
            Reset
            <Badge className="ml-1.5 px-1.5 py-0 text-[10px] font-semibold bg-primary/15 text-primary border-transparent rounded-full">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>
    );
  }
);
