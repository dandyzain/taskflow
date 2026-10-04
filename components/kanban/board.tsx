'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  closestCenter,
  type CollisionDetection,
  PointerSensor, 
  KeyboardSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useKanbanBoard } from '@/hooks/use-kanban-board';
import { useBoardFilter } from '@/hooks/use-board-filter';
import { KanbanColumn } from '@/components/kanban/column';
import { CardItemComponent } from '@/components/kanban/card-item';
import { CreateColumnForm } from '@/components/kanban/create-column-form';
import { BoardHeader } from '@/components/kanban/board-header';
import { BoardToolbar } from '@/components/kanban/board-toolbar';
import { BoardShortcuts } from '@/components/kanban/board-shortcuts';
import { fetchBoardLabels } from '@/actions/fetch-labels-action';
import type { BoardData, LabelItem } from '@/types/kanban';

interface KanbanBoardProps {
  initialData: BoardData;
}

export function KanbanBoard({ initialData }: KanbanBoardProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [availableLabels, setAvailableLabels] = useState<LabelItem[]>([]);

  useEffect(() => {
    fetchBoardLabels(initialData.id).then(setAvailableLabels);
  }, [initialData.id]);

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
    filteredColumns,
    activeFilterCount,
    clearFilters,
  } = useBoardFilter(columns);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    if (args.active.data.current?.type === 'Column') {
      const columnContainers = args.droppableContainers.filter(
        (c) => c.data.current?.type === 'Column'
      );
      if (columnContainers.length > 0) {
        return closestCenter({
          ...args,
          droppableContainers: columnContainers,
        });
      }
    }

    return closestCorners(args);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <BoardShortcuts searchInputRef={searchInputRef} onClearFilters={clearFilters} />
      <BoardHeader 
        title={initialData.title} 
        description={initialData.description}
        boardId={initialData.id}
        workspaceId={initialData.workspaceId}
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
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredColumns.map(col => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 flex-1 items-start snap-x snap-mandatory sm:snap-none -mx-3 px-3 sm:mx-0 sm:px-0">
            {filteredColumns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                boardId={initialData.id}
                workspaceId={initialData.workspaceId}
                onCardCreated={handleCreateCard}
                onCardUpdated={handleUpdateCard}
                onCardDeleted={handleDeleteCard}
                onColumnUpdated={handleUpdateColumn}
                onColumnDeleted={handleDeleteColumn}
              />
            ))}
            <CreateColumnForm
              boardId={initialData.id}
              workspaceId={initialData.workspaceId}
              onColumnCreated={handleCreateColumn}
            />
          </div>
        </SortableContext>
        <DragOverlay>
          {activeCard ? (
            <CardItemComponent 
              card={activeCard} 
              boardId={initialData.id}
              workspaceId={initialData.workspaceId}
              isDragOverlay 
            />
          ) : null}
          {activeColumn ? (
            <div className="w-[280px] sm:w-[300px] min-w-[280px] sm:min-w-[300px] bg-secondary/80 backdrop-blur-md rounded-2xl shadow-float rotate-[2deg] scale-[1.02] border border-primary/30 p-3.5">
              <div className="flex items-center gap-2 px-1 py-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary/60 shrink-0" />
                <h3 className="font-semibold text-sm">{activeColumn.title}</h3>
                <span className="text-[11px] font-semibold text-muted-foreground bg-card/80 rounded-full px-2 py-0.5 ml-auto border border-border/50">
                  {activeColumn.cards.length}
                </span>
              </div>
              <div className="space-y-2 mt-2.5">
                {activeColumn.cards.slice(0, 3).map(card => (
                  <div key={card.id} className="bg-card border border-border/80 rounded-xl p-2.5 shadow-xs">
                    <p className="text-xs font-semibold truncate">{card.title}</p>
                  </div>
                ))}
                {activeColumn.cards.length > 3 && (
                  <p className="text-[11px] text-muted-foreground text-center font-medium">
                    +{activeColumn.cards.length - 3} more cards
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
