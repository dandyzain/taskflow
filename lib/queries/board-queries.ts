import { prisma } from "@/lib/prisma";
import type { BoardData, AssigneeItem } from "@/types/kanban";

export async function getBoardWithColumns(
  boardId: string,
  workspaceId: string
): Promise<BoardData | null> {
  const board = await prisma.board.findFirst({
    where: { id: boardId, workspaceId },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            include: {
              labels: {
                include: {
                  label: { select: { id: true, name: true, color: true } },
                },
              },
              assignees: {
                include: {
                  user: { select: { id: true, name: true, avatarUrl: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!board) {
    return null;
  }

  return {
    id: board.id,
    title: board.title,
    description: board.description,
    workspaceId: board.workspaceId,
    columns: board.columns.map((column) => ({
      id: column.id,
      title: column.title,
      position: column.position,
      cards: column.cards.map((card) => ({
        id: card.id,
        title: card.title,
        description: card.description,
        position: card.position,
        priority: card.priority,
        columnId: card.columnId,
        dueDate: card.dueDate ? card.dueDate.toISOString() : null,
        labels: card.labels.map((cl) => cl.label),
        assignees: card.assignees.map((a) => a.user),
        createdAt: card.createdAt.toISOString(),
      })),
    })),
  };
}

export async function getWorkspaceMembers(workspaceId: string): Promise<AssigneeItem[]> {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
  return members.map(m => m.user);
}

export async function getWorkspaceBoards(
  workspaceId: string
): Promise<Array<{ id: string; title: string; description: string | null }>> {
  const boards = await prisma.board.findMany({
    where: { workspaceId },
    select: {
      id: true,
      title: true,
      description: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return boards;
}

export async function getBoardLabels(boardId: string): Promise<Array<{ id: string; name: string; color: string }>> {
  const labels = await prisma.label.findMany({
    where: { boardId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, color: true },
  });
  return labels;
}
