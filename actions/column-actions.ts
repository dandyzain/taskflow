"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertWorkspaceRole, assertBoardInWorkspace, assertColumnInBoard } from "@/lib/rbac";
import {
  createColumnSchema,
  updateColumnSchema,
  deleteColumnSchema,
  reorderColumnSchema,
  type CreateColumnInput,
  type UpdateColumnInput,
  type DeleteColumnInput,
  type ReorderColumnInput,
} from "@/lib/validations/column";

import { calculatePosition, getPositionContext, rebalancePositions, PositionExhaustedError } from "@/lib/fractional-indexing";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const POSITION_GAP = 1000;
const BASE_POSITION = 1000;

export async function createColumn(
  input: CreateColumnInput
): Promise<ActionResult<{ columnId: string; position: number }>> {
  const parsed = createColumnSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const { title, boardId, workspaceId } = parsed.data;

  try {
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, workspaceId, "MEMBER");
    await assertBoardInWorkspace(boardId, workspaceId);

    const result = await prisma.$transaction(async (tx) => {
      const lastColumn = await tx.column.findFirst({
        where: { boardId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const position = lastColumn ? lastColumn.position + POSITION_GAP : BASE_POSITION;

      const column = await tx.column.create({
        data: {
          title,
          boardId,
          position,
        },
      });

      await tx.activity.create({
        data: {
          action: "COLUMN_CREATED",
          userId: user.id,
          workspaceId,
          entityType: "COLUMN",
          entityId: column.id,
          metadata: JSON.stringify({ title, position }),
        },
      });

      return column;
    });

    return { success: true, data: { columnId: result.id, position: result.position } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}

export async function updateColumn(
  input: UpdateColumnInput
): Promise<ActionResult<{ columnId: string }>> {
  const parsed = updateColumnSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const { columnId, title, boardId, workspaceId } = parsed.data;

  try {
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, workspaceId, "MEMBER");
    await assertBoardInWorkspace(boardId, workspaceId);
    await assertColumnInBoard(columnId, boardId);

    const result = await prisma.$transaction(async (tx) => {
      const column = await tx.column.update({
        where: { id: columnId },
        data: {
          ...(title !== undefined && { title }),
        },
      });

      await tx.activity.create({
        data: {
          action: "COLUMN_UPDATED",
          userId: user.id,
          workspaceId,
          entityType: "COLUMN",
          entityId: column.id,
          metadata: JSON.stringify({ title }),
        },
      });

      return column;
    });

    return { success: true, data: { columnId: result.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}

export async function deleteColumn(
  input: DeleteColumnInput
): Promise<ActionResult> {
  const parsed = deleteColumnSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const { columnId, boardId, workspaceId } = parsed.data;

  try {
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, workspaceId, "ADMIN");
    await assertBoardInWorkspace(boardId, workspaceId);
    await assertColumnInBoard(columnId, boardId);

    await prisma.$transaction(async (tx) => {
      await tx.column.delete({
        where: { id: columnId },
      });

      await tx.activity.create({
        data: {
          action: "COLUMN_DELETED",
          userId: user.id,
          workspaceId,
          entityType: "COLUMN",
          entityId: columnId,
          metadata: JSON.stringify({ columnId, boardId }),
        },
      });
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}

export async function reorderColumn(
  input: ReorderColumnInput
): Promise<ActionResult<{ columnId: string; newPosition: number }>> {
  const parsed = reorderColumnSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const { columnId, boardId, targetIndex, workspaceId } = parsed.data;

  try {
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, workspaceId, "MEMBER");
    await assertBoardInWorkspace(boardId, workspaceId);
    await assertColumnInBoard(columnId, boardId);

    const column = await prisma.column.findFirst({
      where: { id: columnId, boardId },
      select: { id: true, position: true },
    });

    if (!column) {
      return { success: false, error: "Column not found." };
    }

    const siblings = await prisma.column.findMany({
      where: { boardId, id: { not: columnId } },
      orderBy: { position: "asc" },
      select: { id: true, position: true },
    });

    const sortedPositions = siblings.map((s) => s.position);
    const positionContext = getPositionContext(sortedPositions, targetIndex);

    let newPosition: number;
    try {
      newPosition = calculatePosition(positionContext);
    } catch (error) {
      if (error instanceof PositionExhaustedError) {
        return await rebalanceBoardAndPlace(boardId, columnId, targetIndex, workspaceId, user.id);
      }
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.column.update({
        where: { id: columnId },
        data: { position: newPosition },
        select: { id: true, position: true },
      });

      await tx.activity.create({
        data: {
          action: "COLUMN_REORDERED",
          userId: user.id,
          workspaceId,
          entityType: "COLUMN",
          entityId: columnId,
          metadata: JSON.stringify({ previousPosition: column.position, newPosition, targetIndex }),
        },
      });

      return updated;
    });

    return { success: true, data: { columnId: result.id, newPosition: result.position } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}

async function rebalanceBoardAndPlace(
  boardId: string,
  movedColumnId: string,
  targetIndex: number,
  workspaceId: string,
  userId: string
): Promise<ActionResult<{ columnId: string; newPosition: number }>> {
  const allColumns = await prisma.column.findMany({
    where: { boardId },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  const orderedIds = allColumns.filter((c) => c.id !== movedColumnId).map((c) => c.id);
  const clampedIndex = Math.min(targetIndex, orderedIds.length);
  orderedIds.splice(clampedIndex, 0, movedColumnId);

  const newPositions = rebalancePositions(orderedIds);

  const result = await prisma.$transaction(async (tx) => {
    const updates = orderedIds.map((id) =>
      tx.column.update({
        where: { id },
        data: { position: newPositions.get(id)! },
      })
    );
    await Promise.all(updates);

    await tx.activity.create({
      data: {
        action: "COLUMN_REORDERED",
        userId,
        workspaceId,
        entityType: "COLUMN",
        entityId: movedColumnId,
        metadata: JSON.stringify({ rebalanced: true, targetIndex, newPosition: newPositions.get(movedColumnId)! }),
      },
    });

    return { columnId: movedColumnId, newPosition: newPositions.get(movedColumnId)! };
  });

  return { success: true, data: result };
}
