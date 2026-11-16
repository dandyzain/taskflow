'use client';

import * as React from 'react';

export interface ShellBoard {
  id: string;
  title: string;
  description: string | null;
}

export interface ShellUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

/**
 * The board page registers a small "bridge" so app-wide chrome (command
 * palette, mobile "+" button) can search its tasks and trigger board actions
 * without owning board state.
 */
export interface BoardBridge {
  boardId: string;
  cards: Array<{ id: string; title: string; columnTitle: string; priority: number }>;
  openCard: (cardId: string) => void;
  newTask: () => void;
}

interface WorkspaceContextValue {
  workspaceId: string;
  workspaceName: string;
  boards: ShellBoard[];
  currentUser: ShellUser | null;
  openPalette: () => void;
  openCreateBoard: () => void;
  openShortcuts: () => void;
  /** Read the current board bridge (ref-backed: updating it never re-renders the shell) */
  getBridge: () => BoardBridge | null;
  setBridge: (bridge: BoardBridge | null) => void;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export const WorkspaceProvider = WorkspaceContext.Provider;

export function useWorkspace() {
  return React.useContext(WorkspaceContext);
}
