'use client';

import { useState, useCallback, useRef } from 'react';
import type { DragStartEvent, DragOverEvent, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import type { BoardData, BoardColumn, CardItem } from '@/types/kanban';
import { reorderCard, moveCardToColumn } from '@/actions/card-actions';
import { createCard } from '@/actions/card-crud-actions';
import { createColumn, reorderColumn } from '@/actions/column-actions';

export function useKanbanBoard(initialData: BoardData) {
  const [columns, setColumns] = useState<BoardColumn[]>(initialData.columns);
  const [activeCard, setActiveCard] = useState<CardItem | null>(null);
  const [activeColumn, setActiveColumn] = useState<BoardColumn | null>(null);
  const snapshotRef = useRef<BoardColumn[] | null>(null);

  const restoreSnapshot = useCallback(() => {
    if (snapshotRef.current) {
      setColumns(snapshotRef.current);
      snapshotRef.current = null;
    }
  }, []);

  const findColumnByCardId = useCallback((cardId: UniqueIdentifier) => {
    return columns.find(col => col.cards.some(c => c.id === cardId));
  }, [columns]);

  const findCardById = useCallback((cardId: UniqueIdentifier) => {
    for (const col of columns) {
      const card = col.cards.find(c => c.id === cardId);
      if (card) return card;
    }
    return null;
  }, [columns]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;
    
    if (type === 'Card') {
      const card = findCardById(active.id);
      if (card) {
        setActiveCard(card);
        snapshotRef.current = JSON.parse(JSON.stringify(columns));
      }
    } else if (type === 'Column') {
      const column = columns.find(c => c.id === active.id);
      if (column) {
        setActiveColumn(column);
        snapshotRef.current = JSON.parse(JSON.stringify(columns));
      }
    }
  }, [columns, findCardById]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    if (active.data.current?.type !== 'Card') return;

    const activeColumn = findColumnByCardId(active.id);
    
    // Find target column either by card id or column id
    let overColumn = findColumnByCardId(over.id);
    if (!overColumn) {
      overColumn = columns.find(col => col.id === over.id);
    }

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setColumns(prev => {
      const activeColIndex = prev.findIndex(c => c.id === activeColumn.id);
      const overColIndex = prev.findIndex(c => c.id === overColumn.id);
      
      const activeCol = prev[activeColIndex];
      const overCol = prev[overColIndex];

      const activeCards = [...activeCol.cards];
      const overCards = [...overCol.cards];
      
      const activeIndex = activeCards.findIndex(c => c.id === active.id);
      const [movedCard] = activeCards.splice(activeIndex, 1);
      
      const overIndex = overCards.findIndex(c => c.id === over.id);
      const insertIndex = overIndex >= 0 ? overIndex : overCards.length;
      
      overCards.splice(insertIndex, 0, { ...movedCard, columnId: overColumn.id });
      
      const newColumns = [...prev];
      newColumns[activeColIndex] = { ...activeCol, cards: activeCards };
      newColumns[overColIndex] = { ...overCol, cards: overCards };
      
      return newColumns;
    });
  }, [columns, findColumnByCardId]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    const type = active.data.current?.type;

    setActiveCard(null);
    setActiveColumn(null);

    if (!over) {
      restoreSnapshot();
      return;
    }

    if (type === 'Column') {
      // Handle column reorder
      const oldIndex = columns.findIndex(c => c.id === active.id);
      if (oldIndex === -1) {
        snapshotRef.current = null;
        return;
      }

      // Determine which column is being targeted
      let targetColumnId: string | null = null;
      if (over.data.current?.type === 'Column') {
        targetColumnId = String(over.id);
      } else if (over.data.current?.type === 'Card' && over.data.current.card?.columnId) {
        targetColumnId = over.data.current.card.columnId;
      } else if (columns.some(c => c.id === over.id)) {
        targetColumnId = String(over.id);
      } else {
        const foundCol = columns.find(c => c.cards.some(card => card.id === over.id));
        if (foundCol) {
          targetColumnId = foundCol.id;
        }
      }

      if (!targetColumnId || targetColumnId === active.id) {
        snapshotRef.current = null;
        return;
      }

      const rawNewIndex = columns.findIndex(c => c.id === targetColumnId);
      if (rawNewIndex === -1 || oldIndex === rawNewIndex) {
        snapshotRef.current = null;
        return;
      }

      const newIndex = Math.max(0, Math.min(rawNewIndex, columns.length - 1));

      // Optimistic reorder
      setColumns(prev => arrayMove(prev, oldIndex, newIndex));

      const result = await reorderColumn({
        columnId: String(active.id),
        boardId: initialData.id,
        targetIndex: newIndex,
        workspaceId: initialData.workspaceId,
      });

      if (result.success) {
        snapshotRef.current = null;
      } else {
        restoreSnapshot();
        toast.error(result.error);
      }
      return;
    }

    const currentColumn = findColumnByCardId(active.id);
    
    const snapshotCols = snapshotRef.current;
    if (!snapshotCols) return;
    
    const originalColumn = snapshotCols.find(col => col.cards.some(c => c.id === active.id));
    if (!currentColumn || !originalColumn) {
      restoreSnapshot();
      return;
    }

    const activeCardData = snapshotCols.flatMap(c => c.cards).find(c => c.id === active.id);
    if (!activeCardData) return;

    // Handle same-column reorder
    if (originalColumn.id === currentColumn.id) {
      if (active.id === over.id) {
        snapshotRef.current = null;
        return;
      }

      const column = columns.find(c => c.id === currentColumn.id);
      if (!column) {
        restoreSnapshot();
        return;
      }

      const oldIndex = column.cards.findIndex(c => c.id === active.id);
      if (oldIndex === -1) {
        restoreSnapshot();
        return;
      }

      // Determine target index
      let targetIndex = column.cards.findIndex(c => c.id === over.id);
      if (targetIndex === -1) {
        // Must have dropped on the empty part of the column
        targetIndex = Math.max(0, column.cards.length - 1);
      } else {
        targetIndex = Math.max(0, Math.min(targetIndex, column.cards.length - 1));
      }

      if (oldIndex === targetIndex) {
        snapshotRef.current = null;
        return;
      }

      // Optimistically update
      setColumns(prev => prev.map(col => {
        if (col.id === currentColumn.id) {
          return { ...col, cards: arrayMove(col.cards, oldIndex, targetIndex) };
        }
        return col;
      }));

      const result = await reorderCard({
        cardId: String(active.id),
        columnId: currentColumn.id,
        targetIndex,
        workspaceId: initialData.workspaceId,
        boardId: initialData.id
      });

      if (result.success) {
        snapshotRef.current = null;
      } else {
        restoreSnapshot();
        toast.error(result.error);
      }
    } else {
      // Cross-column move
      // State is already updated from dragOver
      const overIndex = currentColumn.cards.findIndex(c => c.id === over.id);
      let targetIndex = overIndex >= 0 ? overIndex : Math.max(0, currentColumn.cards.length - 1);
      // In case we dropped on empty column
      if (overIndex === -1) {
        const isColumnDrop = columns.some(c => c.id === over.id);
        if (isColumnDrop) {
          targetIndex = Math.max(0, currentColumn.cards.length - 1); 
        }
      }
      targetIndex = Math.max(0, targetIndex);

      const result = await moveCardToColumn({
        cardId: String(active.id),
        sourceColumnId: originalColumn.id,
        destinationColumnId: currentColumn.id,
        targetIndex,
        workspaceId: initialData.workspaceId,
        boardId: initialData.id
      });

      if (result.success) {
        snapshotRef.current = null;
      } else {
        restoreSnapshot();
        toast.error(result.error);
      }
    }
  }, [columns, findColumnByCardId, restoreSnapshot, initialData]);

  const handleCreateCard = useCallback((card: CardItem) => {
    setColumns(prev => prev.map(col => 
      col.id === card.columnId ? { ...col, cards: [...col.cards, card] } : col
    ));
  }, []);

  const handleCreateColumn = useCallback((column: BoardColumn) => {
    setColumns(prev => [...prev, column]);
  }, []);

  const handleUpdateCard = useCallback((updatedCard: CardItem) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(c => c.id === updatedCard.id ? updatedCard : c)
    })));
  }, []);

  const handleDeleteCard = useCallback((cardId: string) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.filter(c => c.id !== cardId)
    })));
  }, []);

  const handleUpdateColumn = useCallback((columnId: string, title: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, title } : col
    ));
  }, []);

  const handleDeleteColumn = useCallback((columnId: string) => {
    setColumns(prev => prev.filter(col => col.id !== columnId));
  }, []);

  return {
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
  };
}
