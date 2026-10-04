'use client';

import { useState, useMemo, useCallback } from 'react';
import type { BoardColumn } from '@/types/kanban';

export type PriorityFilter = 'all' | '0' | '1' | '2' | '3';

export function useBoardFilter(columns: BoardColumn[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');

  const filteredColumns = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    return columns.map(column => ({
      ...column,
      cards: column.cards.filter(card => {
        const matchesSearch = query === '' || 
          card.title.toLowerCase().includes(query) ||
          (card.description?.toLowerCase().includes(query) ?? false);
        
        const matchesPriority = priorityFilter === 'all' || 
          card.priority === parseInt(priorityFilter, 10);
        
        const matchesLabel = labelFilter === 'all' ||
          card.labels.some(l => l.id === labelFilter);
        
        return matchesSearch && matchesPriority && matchesLabel;
      }),
    }));
  }, [columns, searchQuery, priorityFilter, labelFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== '') count++;
    if (priorityFilter !== 'all') count++;
    if (labelFilter !== 'all') count++;
    return count;
  }, [searchQuery, priorityFilter, labelFilter]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setPriorityFilter('all');
    setLabelFilter('all');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    labelFilter,
    setLabelFilter,
    filteredColumns,
    activeFilterCount,
    clearFilters,
  };
}
