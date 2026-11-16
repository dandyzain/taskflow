'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { BoardColumn } from '@/types/kanban';

export type PriorityFilter = 'all' | '0' | '1' | '2' | '3';

const PRIORITIES: PriorityFilter[] = ['all', '0', '1', '2', '3'];

/** Read the initial filter state from the URL (?q=&priority=&label=&user=). */
function readParams() {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search);
  const priority = p.get('priority') as PriorityFilter | null;
  return {
    q: p.get('q') ?? '',
    priority: priority && PRIORITIES.includes(priority) ? priority : 'all',
    label: p.get('label') ?? 'all',
    user: p.get('user') ?? 'all',
  };
}

export function useBoardFilter(columns: BoardColumn[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from the URL once on mount so filtered views are shareable
  useEffect(() => {
    const init = readParams();
    if (init) {
      setSearchQuery(init.q);
      setPriorityFilter(init.priority as PriorityFilter);
      setLabelFilter(init.label);
      setEmployeeFilter(init.user);
    }
    setHydrated(true);
  }, []);

  // Mirror filters into the URL without triggering a navigation
  useEffect(() => {
    if (!hydrated) return;
    const handle = window.setTimeout(() => {
      const url = new URL(window.location.href);
      const set = (k: string, v: string, empty: string) =>
        v && v !== empty ? url.searchParams.set(k, v) : url.searchParams.delete(k);
      set('q', searchQuery.trim(), '');
      set('priority', priorityFilter, 'all');
      set('label', labelFilter, 'all');
      set('user', employeeFilter, 'all');
      if (url.href !== window.location.href) {
        window.history.replaceState(window.history.state, '', url);
      }
    }, 250);
    return () => window.clearTimeout(handle);
  }, [hydrated, searchQuery, priorityFilter, labelFilter, employeeFilter]);

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

        const matchesEmployee = employeeFilter === 'all' ||
          (employeeFilter === 'unassigned'
            ? (!card.assignees || card.assignees.length === 0)
            : Boolean(card.assignees?.some(a => a.id === employeeFilter)));

        return matchesSearch && matchesPriority && matchesLabel && matchesEmployee;
      }),
    }));
  }, [columns, searchQuery, priorityFilter, labelFilter, employeeFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== '') count++;
    if (priorityFilter !== 'all') count++;
    if (labelFilter !== 'all') count++;
    if (employeeFilter !== 'all') count++;
    return count;
  }, [searchQuery, priorityFilter, labelFilter, employeeFilter]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setPriorityFilter('all');
    setLabelFilter('all');
    setEmployeeFilter('all');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    labelFilter,
    setLabelFilter,
    employeeFilter,
    setEmployeeFilter,
    filteredColumns,
    activeFilterCount,
    clearFilters,
  };
}
