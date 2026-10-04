export interface LabelItem {
  id: string;
  name: string;
  color: string;
}

export interface AssigneeItem {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CardItem {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: number;
  columnId: string;
  dueDate: string | null;
  labels: LabelItem[];
  assignees: AssigneeItem[];
  createdAt: string; // ISO string for serialization across server/client boundary
}

export interface BoardColumn {
  id: string;
  title: string;
  position: number;
  cards: CardItem[];
}

export interface BoardData {
  id: string;
  title: string;
  description: string | null;
  workspaceId: string;
  columns: BoardColumn[];
}
