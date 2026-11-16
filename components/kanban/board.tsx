'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  closestCenter,
  defaultDropAnimationSideEffects,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { SearchX } from 'lucide-react';
import { useKanbanBoard } from '@/hooks/use-kanban-board';
import { useBoardFilter } from '@/hooks/use-board-filter';
import { KanbanColumn } from '@/components/kanban/column';
import { CardItemComponent } from '@/components/kanban/card-item';
import { CreateColumnForm } from '@/components/kanban/create-column-form';
import { BoardHeader } from '@/components/kanban/board-header';
import { BoardToolbar, type BoardView } from '@/components/kanban/board-toolbar';
import { BoardShortcuts } from '@/components/kanban/board-shortcuts';
import { BoardListView } from '@/components/kanban/board-list-view';
import { ColumnSwitcher } from '@/components/kanban/column-switcher';
import { CardDetailPanel } from '@/components/kanban/card-detail-panel';
import { useWorkspace } from '@/components/layout/workspace-context';
import { EmptyState } from '@/components/patterns/empty-state';
import { Button } from '@/components/ui/button';
import { fetchBoardLabels } from '@/actions/fetch-labels-action';
import { fetchWorkspaceMembers } from '@/actions/assignee-actions';
import { deleteCard } from '@/actions/card-crud-actions';
import { getStatus, getStatusKind } from '@/lib/design/tokens';
import { useLanguage } from '@/lib/i18n/language-context';
import { celebrate } from '@/lib/celebrate';
import type { BoardData, LabelItem, AssigneeItem, CardItem } from '@/types/kanban';

interface KanbanBoardProps {
  initialData: BoardData;
}

const dropAnimation: DropAnimation = {
  duration: 220,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
};

const UNDO_MS = 5000;

export function KanbanBoard({ initialData }: KanbanBoardProps) {
  const { t } = useLanguage();
  const ws = useWorkspace();
  const setBridge = ws?.setBridge;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const boardId = initialData.id;
  const workspaceId = initialData.workspaceId;

  const [availableLabels, setAvailableLabels] = useState<LabelItem[]>([]);
  const [availableMembers, setAvailableMembers] = useState<AssigneeItem[]>(() => {
    const memberMap = new Map<string, AssigneeItem>();
    initialData.columns.forEach((col) =>
      col.cards.forEach((card) => card.assignees?.forEach((a) => memberMap.set(a.id, a)))
    );
    return Array.from(memberMap.values());
  });

  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [view, setView] = useState<BoardView>('board');
  const [composerColumnId, setComposerColumnId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [mobileColumnId, setMobileColumnId] = useState<string | null>(null);

  useEffect(() => {
    fetchBoardLabels(boardId).then(setAvailableLabels);
    fetchWorkspaceMembers(workspaceId)
      .then((data) => setAvailableMembers(data as AssigneeItem[]))
      .catch(() => {});
  }, [boardId, workspaceId]);

  // Restore per-board UI prefs: collapsed columns + view mode (?view=list)
  const collapseKey = `taskflow_collapsed_${boardId}`;
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(collapseKey) || '[]');
      if (Array.isArray(saved)) setCollapsedIds(saved);
    } catch {
      /* ignore */
    }
    if (new URLSearchParams(window.location.search).get('view') === 'list') setView('list');
  }, [collapseKey]);

  const changeView = useCallback((v: BoardView) => {
    setView(v);
    const url = new URL(window.location.href);
    if (v === 'list') url.searchParams.set('view', 'list');
    else url.searchParams.delete('view');
    window.history.replaceState(window.history.state, '', url);
  }, []);

  const {
    columns,
    activeCard,
    activeColumn,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleCreateCard,
    handleCreateColumn,
    handleUpdateCard,
    handleDeleteCard,
    handleRestoreCard,
    handleUpdateColumn,
    handleDeleteColumn,
  } = useKanbanBoard(initialData);

  const {
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
  } = useBoardFilter(columns);

  const columnsRef = useRef(columns);
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  const visibleColumnIdsRef = useRef<string[]>([]);
  useEffect(() => {
    visibleColumnIdsRef.current = filteredColumns.map((c) => c.id);
  }, [filteredColumns]);

  /**
   * Keyboard moves: ←/→ jump a card to the adjacent column, ↑/↓ use the
   * default sortable behaviour within the column.
   */
  const coordinateGetter: KeyboardCoordinateGetter = useCallback((event, args) => {
    const { active, droppableRects, collisionRect } = args.context;
    if (
      active?.data.current?.type === 'Card' &&
      collisionRect &&
      (event.code === 'ArrowRight' || event.code === 'ArrowLeft')
    ) {
      event.preventDefault();
      const order = visibleColumnIdsRef.current;
      const current = columnsRef.current.find((c) => c.cards.some((k) => k.id === active.id));
      const idx = current ? order.indexOf(current.id) : -1;
      const nextId = order[idx + (event.code === 'ArrowRight' ? 1 : -1)];
      const rect = nextId ? droppableRects.get(nextId) : undefined;
      if (!rect) return undefined;
      return { x: rect.left + 8, y: rect.top + 52 };
    }
    return sortableKeyboardCoordinates(event, args);
  }, []);

  const totals = useMemo(() => Object.fromEntries(columns.map((c) => [c.id, c.cards.length])), [columns]);
  const totalCards = useMemo(() => columns.reduce((n, c) => n + c.cards.length, 0), [columns]);
  const doneCards = useMemo(
    () => columns.filter((c) => getStatusKind(c.title) === 'done').reduce((n, c) => n + c.cards.length, 0),
    [columns]
  );
  const visibleCount = useMemo(() => filteredColumns.reduce((n, c) => n + c.cards.length, 0), [filteredColumns]);

  // ── Sensors: mouse (small distance), touch (long-press), keyboard ──
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter'] },
    })
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    if (args.active.data.current?.type === 'Column') {
      const columnContainers = args.droppableContainers.filter((c) => c.data.current?.type === 'Column');
      if (columnContainers.length > 0) {
        return closestCenter({ ...args, droppableContainers: columnContainers });
      }
    }
    return closestCorners(args);
  }, []);

  // ── Screen-reader announcements (translated) ──
  const nameOf = useCallback(
    (data: Record<string, unknown> | undefined) => {
      const d = data as { type?: string; card?: CardItem; column?: { title: string } } | undefined;
      if (d?.type === 'Card' && d.card) return d.card.title;
      if (d?.type === 'Column' && d.column) return d.column.title;
      return '';
    },
    []
  );
  const activeIdRef = useRef<string | null>(null);
  const targetOf = useCallback((data: Record<string, unknown> | undefined) => {
    const d = data as { type?: string; card?: CardItem; column?: { title: string } } | undefined;
    if (d?.type === 'Column' && d.column) return d.column.title;
    if (d?.type === 'Card' && d.card) {
      // Over its own placeholder → announce the column it now sits in
      const col = columnsRef.current.find((c) => c.cards.some((k) => k.id === d.card!.id));
      if (activeIdRef.current === d.card.id) return col?.title ?? '';
      return col ? `${d.card.title} (${col.title})` : d.card.title;
    }
    return '';
  }, []);
  const announcements: Announcements = useMemo(
    () => ({
      onDragStart: ({ active }) => t('ui.dndPickedUp', { title: nameOf(active.data.current) }),
      onDragOver: ({ active, over }) =>
        over ? t('ui.dndOver', { title: nameOf(active.data.current), target: targetOf(over.data.current) }) : undefined,
      onDragEnd: ({ active, over }) =>
        over
          ? t('ui.dndDropped', { title: nameOf(active.data.current), target: targetOf(over.data.current) })
          : t('ui.dndCancelled', { title: nameOf(active.data.current) }),
      onDragCancel: ({ active }) => t('ui.dndCancelled', { title: nameOf(active.data.current) }),
    }),
    [t, nameOf, targetOf]
  );

  // ── Drag lifecycle wrappers (feedback only — logic lives in useKanbanBoard) ──
  const dragOriginRef = useRef<string | null>(null);

  const onDragStart = useCallback(
    (e: DragStartEvent) => {
      if (e.active.data.current?.type === 'Card') {
        dragOriginRef.current =
          columnsRef.current.find((c) => c.cards.some((card) => card.id === e.active.id))?.id ?? null;
      }
      activeIdRef.current = String(e.active.id);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(8);
      handleDragStart(e);
    },
    [handleDragStart]
  );

  const onDragOver = useCallback(
    (e: DragOverEvent) => {
      handleDragOver(e);
      if (e.active.data.current?.type !== 'Card' || !e.over) {
        setOverColumnId(null);
        return;
      }
      const d = e.over.data.current as { type?: string; card?: CardItem } | undefined;
      setOverColumnId(d?.type === 'Card' && d.card ? d.card.columnId : String(e.over.id));
    },
    [handleDragOver]
  );

  const onDragEnd = useCallback(
    async (e: DragEndEvent) => {
      setOverColumnId(null);
      const isCard = e.active.data.current?.type === 'Card';
      const origin = dragOriginRef.current;
      dragOriginRef.current = null;
      await handleDragEnd(e);
      if (!isCard || !e.over) return;

      requestAnimationFrame(() => {
        const cardId = String(e.active.id);
        const dest = columnsRef.current.find((c) => c.cards.some((card) => card.id === cardId));
        const from = columnsRef.current.find((c) => c.id === origin);
        if (!dest || dest.id === origin) return;
        if (getStatusKind(dest.title) === 'done' && (!from || getStatusKind(from.title) !== 'done')) {
          const el = document.querySelector(`[data-card-id="${cardId}"]`);
          const r = el?.getBoundingClientRect();
          celebrate(r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + 20) / window.innerHeight } : undefined);
          toast.success(t('ui.doneCelebration'));
        }
      });
    },
    [handleDragEnd, t]
  );

  // Escape / cancelled drags previously left the board mid-move; route them
  // through the existing end handler with no target so the snapshot restores.
  const onDragCancel = useCallback(
    (e: DragEndEvent) => {
      setOverColumnId(null);
      dragOriginRef.current = null;
      handleDragEnd({ ...e, over: null } as DragEndEvent);
    },
    [handleDragEnd]
  );

  // ── Card panel ──
  const openCard = useCallback((cardId: string) => {
    setOpenCardId(cardId);
    setPanelOpen(true);
  }, []);

  const openCardData = useMemo(() => {
    if (!openCardId) return null;
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === openCardId);
      if (card) return { card, columnTitle: col.title };
    }
    return null;
  }, [columns, openCardId]);

  // ── Delete with Undo (delayed commit through the existing deleteCard action) ──
  const pendingDeletes = useRef(new Map<string, { timer: number; commit: () => void }>());

  const requestDelete = useCallback(
    (card: CardItem) => {
      const col = columnsRef.current.find((c) => c.id === card.columnId);
      const index = col ? col.cards.findIndex((c) => c.id === card.id) : 0;
      setPanelOpen(false);
      handleDeleteCard(card.id);

      const commit = async () => {
        pendingDeletes.current.delete(card.id);
        try {
          const result = await deleteCard({ cardId: card.id, columnId: card.columnId, boardId, workspaceId });
          if (!result.success) {
            toast.error(result.error || t('ui.updateFailed'));
            handleRestoreCard(card, index);
          }
        } catch {
          toast.error(t('ui.updateFailed'));
          handleRestoreCard(card, index);
        }
      };
      const timer = window.setTimeout(commit, UNDO_MS);
      pendingDeletes.current.set(card.id, { timer, commit });

      toast(t('ui.cardDeleted'), {
        description: card.title,
        duration: UNDO_MS,
        action: {
          label: t('ui.undo'),
          onClick: () => {
            const pending = pendingDeletes.current.get(card.id);
            if (!pending) return;
            window.clearTimeout(pending.timer);
            pendingDeletes.current.delete(card.id);
            handleRestoreCard(card, index);
          },
        },
      });
    },
    [boardId, workspaceId, handleDeleteCard, handleRestoreCard, t]
  );

  // Flush pending deletes when leaving the board / page
  useEffect(() => {
    const pending = pendingDeletes.current;
    const flush = () => {
      pending.forEach(({ timer, commit }) => {
        window.clearTimeout(timer);
        commit();
      });
    };
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);

  // ── Columns: composer, collapse, mobile tracking ──
  const onComposerOpenChange = useCallback((columnId: string, open: boolean) => {
    setComposerColumnId((prev) => (open ? columnId : prev === columnId ? null : prev));
  }, []);

  const onToggleCollapse = useCallback(
    (columnId: string) => {
      setCollapsedIds((prev) => {
        const next = prev.includes(columnId) ? prev.filter((id) => id !== columnId) : [...prev, columnId];
        try {
          localStorage.setItem(collapseKey, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [collapseKey]
  );

  const jumpToColumn = useCallback((columnId: string) => {
    const el = scrollerRef.current?.querySelector(`[data-column-id="${columnId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    setMobileColumnId(columnId);
  }, []);

  const columnIdsKey = filteredColumns.map((c) => c.id).join('|');
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || view !== 'board') return;
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = best?.target.getAttribute('data-column-id');
        if (id) setMobileColumnId(id);
      },
      { root, threshold: [0.55, 0.8] }
    );
    root.querySelectorAll('[data-column-id]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [columnIdsKey, view]);

  const newTask = useCallback(() => {
    const isPhone = window.matchMedia('(max-width: 767px)').matches;
    const target =
      (isPhone && mobileColumnId && columns.some((c) => c.id === mobileColumnId) ? mobileColumnId : null) ??
      columns[0]?.id;
    if (!target) return;
    if (view !== 'board') changeView('board');
    setCollapsedIds((prev) => prev.filter((id) => id !== target));
    setComposerColumnId(target);
    requestAnimationFrame(() => jumpToColumn(target));
  }, [columns, mobileColumnId, view, changeView, jumpToColumn]);

  // ── Expose a bridge to the workspace chrome (⌘K tasks, mobile "+") ──
  useEffect(() => {
    if (!setBridge) return;
    setBridge({
      boardId,
      cards: columns.flatMap((c) =>
        c.cards.map((card) => ({ id: card.id, title: card.title, columnTitle: c.title, priority: card.priority }))
      ),
      openCard,
      newTask,
    });
  }, [setBridge, boardId, columns, openCard, newTask]);
  useEffect(() => () => setBridge?.(null), [setBridge]);

  const noResults = activeFilterCount > 0 && visibleCount === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <BoardShortcuts searchInputRef={searchInputRef} onClearFilters={clearFilters} onNewTask={newTask} />
      <BoardHeader
        title={initialData.title}
        description={initialData.description}
        boardId={boardId}
        workspaceId={workspaceId}
        doneCount={doneCards}
        totalCount={totalCards}
      />
      <BoardToolbar
        ref={searchInputRef}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        labelFilter={labelFilter}
        onLabelFilterChange={setLabelFilter}
        availableLabels={availableLabels}
        employeeFilter={employeeFilter}
        onEmployeeFilterChange={setEmployeeFilter}
        availableMembers={availableMembers}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        view={view}
        onViewChange={changeView}
      />

      {noResults && (
        <div className="mb-3 rounded-2xl border border-dashed bg-card/60">
          <EmptyState
            size="sm"
            icon={SearchX}
            title={t('ui.noResultsTitle')}
            description={t('ui.noResultsDesc')}
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                {t('kanban.clearFilters')}
              </Button>
            }
          />
        </div>
      )}

      {view === 'list' ? (
        <BoardListView
          columns={filteredColumns}
          totals={totals}
          onOpenCard={openCard}
          onAddTask={(id) => {
            changeView('board');
            setComposerColumnId(id);
            requestAnimationFrame(() => jumpToColumn(id));
          }}
        />
      ) : (
        <>
          <ColumnSwitcher columns={filteredColumns} activeId={mobileColumnId} onJump={jumpToColumn} />
          <DndContext
            id={`board-dnd-${boardId}`}
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
            accessibility={{ announcements, screenReaderInstructions: { draggable: t('ui.dragHint') } }}
          >
            <SortableContext items={filteredColumns.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
              <div
                ref={scrollerRef}
                className="-mx-3 flex min-h-0 flex-1 snap-x snap-mandatory items-start gap-3 overflow-x-auto overscroll-x-contain px-3 pb-3 sm:mx-0 sm:gap-4 sm:px-0 md:snap-none"
              >
                {filteredColumns.map((column, index) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    totalCount={totals[column.id] ?? column.cards.length}
                    index={index}
                    boardId={boardId}
                    workspaceId={workspaceId}
                    collapsed={collapsedIds.includes(column.id)}
                    isDropTarget={!!activeCard && overColumnId === column.id}
                    composerOpen={composerColumnId === column.id}
                    availableLabels={availableLabels}
                    availableMembers={availableMembers}
                    onComposerOpenChange={onComposerOpenChange}
                    onToggleCollapse={onToggleCollapse}
                    onOpenCard={openCard}
                    onCardCreated={handleCreateCard}
                    onColumnUpdated={handleUpdateColumn}
                    onColumnDeleted={handleDeleteColumn}
                  />
                ))}
                <CreateColumnForm boardId={boardId} workspaceId={workspaceId} onColumnCreated={handleCreateColumn} />
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={dropAnimation}>
              {activeCard ? <CardItemComponent card={activeCard} isDragOverlay /> : null}
              {activeColumn ? (
                <div className="w-[296px] rotate-[1.5deg] scale-[1.02] rounded-2xl border border-primary/30 bg-surface-sunken p-3 shadow-e3">
                  <div className="flex items-center gap-2 px-1 pb-2">
                    <span className={`size-2.5 rounded-full ${getStatus(activeColumn.title).dot}`} />
                    <h3 className="text-sm font-semibold">{activeColumn.title}</h3>
                    <span className="ml-auto rounded-full bg-card px-2 text-xs tabular-nums text-muted-foreground ring-1 ring-border">
                      {activeColumn.cards.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {activeColumn.cards.slice(0, 3).map((card) => (
                      <div key={card.id} className="truncate rounded-xl border bg-card p-2.5 text-sm font-medium shadow-e1">
                        {card.title}
                      </div>
                    ))}
                    {activeColumn.cards.length > 3 && (
                      <p className="text-center text-xs text-muted-foreground">+{activeColumn.cards.length - 3}</p>
                    )}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </>
      )}

      <CardDetailPanel
        card={openCardData?.card ?? null}
        columnTitle={openCardData?.columnTitle ?? ''}
        boardId={boardId}
        workspaceId={workspaceId}
        open={panelOpen && !!openCardData}
        onOpenChange={setPanelOpen}
        onCardUpdated={handleUpdateCard}
        onRequestDelete={requestDelete}
      />
    </div>
  );
}
