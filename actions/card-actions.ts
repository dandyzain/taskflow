"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  assertWorkspaceRole,
  assertBoardInWorkspace,
  assertColumnInBoard,
} from "@/lib/rbac";
import {
  reorderCardSchema,
  moveCardToColumnSchema,
  type ReorderCardInput,
  type MoveCardToColumnInput,
} from "@/lib/validations/card";
import {
  calculatePosition,
  getPositionContext,
  rebalancePositions,
  PositionExhaustedError,
} from "@/lib/fractional-indexing";


// ─── Result Types ────────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── reorderCard ─────────────────────────────────────────────────────────────

/**
 * Reorders a card within the same column using fractional indexing.
 *
 * Flow:
 *   1. Validate input (Zod)
 *   2. Authenticate user
 *   3. Assert MEMBER role in workspace
 *   4. Assert board belongs to workspace, column belongs to board
 *   5. Assert card belongs to the column
 *   6. Fetch sorted sibling positions (excluding the moved card)
 *   7. Calculate new fractional position
 *   8. Update card position in a transaction
 *   9. Log activity
 *
 * If the fractional position space is exhausted, the entire column
 * is rebalanced within the same transaction.
 */
export async function reorderCard(
  input: ReorderCardInput
): Promise<ActionResult<{ cardId: string; newPosition: number }>> {
  const parsed = reorderCardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const { cardId, columnId, targetIndex, workspaceId, boardId } = parsed.data;

  try {
    const user = await getCurrentUser();

    await assertWorkspaceRole(user.id, workspaceId, "MEMBER");
    await assertBoardInWorkspace(boardId, workspaceId);
    await assertColumnInBoard(columnId, boardId);

    const card = await prisma.card.findFirst({
      where: { id: cardId, columnId },
      select: { id: true, position: true },
    });

    if (!card) {
      return {
        success: false,
        error: "Card not found in the specified column.",
      };
    }

    const siblings = await prisma.card.findMany({
      where: { columnId, id: { not: cardId } },
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
        return await rebalanceColumnAndPlace(
          columnId,
          cardId,
          targetIndex,
          workspaceId,
          user.id
        );
      }
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.card.update({
        where: { id: cardId },
        data: { position: newPosition },
        select: { id: true, position: true },
      });

      await tx.activity.create({
        data: {
          action: "CARD_REORDERED",
          userId: user.id,
          workspaceId,
          entityType: "CARD",
          entityId: cardId,
          metadata: JSON.stringify({
            columnId,
            previousPosition: card.position,
            newPosition,
            targetIndex,
          }),
        },
      });

      return updated;
    });

    return {
      success: true,
      data: { cardId: result.id, newPosition: result.position },
    };
  } catch (error) {
    return {
      success: false,
      error: resolveErrorMessage(error),
    };
  }
}

// ─── moveCardToColumn ────────────────────────────────────────────────────────

/**
 * Moves a card from one column to another using fractional indexing.
 *
 * Flow:
 *   1. Validate input (Zod)
 *   2. Authenticate user
 *   3. Assert MEMBER role in workspace
 *   4. Assert board ownership and both columns belong to the board
 *   5. Assert card belongs to the source column
 *   6. Fetch sorted card positions in the destination column
 *   7. Calculate new fractional position for the target index
 *   8. Update card's columnId + position atomically
 *   9. Log activity with metadata (source/destination column, positions)
 */
export async function moveCardToColumn(
  input: MoveCardToColumnInput
): Promise<ActionResult<{ cardId: string; newColumnId: string; newPosition: number }>> {
  const parsed = moveCardToColumnSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const {
    cardId,
    sourceColumnId,
    destinationColumnId,
    targetIndex,
    workspaceId,
    boardId,
  } = parsed.data;

  if (sourceColumnId === destinationColumnId) {
    return {
      success: false,
      error: "Source and destination columns are the same. Use reorderCard instead.",
    };
  }

  try {
    const user = await getCurrentUser();

    await assertWorkspaceRole(user.id, workspaceId, "MEMBER");
    await assertBoardInWorkspace(boardId, workspaceId);
    await assertColumnInBoard(sourceColumnId, boardId);
    await assertColumnInBoard(destinationColumnId, boardId);

    const card = await prisma.card.findFirst({
      where: { id: cardId, columnId: sourceColumnId },
      select: { id: true, position: true, columnId: true },
    });

    if (!card) {
      return {
        success: false,
        error: "Card not found in the source column.",
      };
    }

    const destinationCards = await prisma.card.findMany({
      where: { columnId: destinationColumnId },
      orderBy: { position: "asc" },
      select: { id: true, position: true },
    });

    const sortedPositions = destinationCards.map((c) => c.position);
    const positionContext = getPositionContext(sortedPositions, targetIndex);

    let newPosition: number;

    try {
      newPosition = calculatePosition(positionContext);
    } catch (error) {
      if (error instanceof PositionExhaustedError) {
        return await rebalanceDestinationAndPlace(
          destinationColumnId,
          cardId,
          targetIndex,
          sourceColumnId,
          card.position,
          workspaceId,
          boardId,
          user.id
        );
      }
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.card.update({
        where: { id: cardId },
        data: {
          columnId: destinationColumnId,
          position: newPosition,
        },
        select: { id: true, columnId: true, position: true },
      });

      await tx.activity.create({
        data: {
          action: "CARD_MOVED",
          userId: user.id,
          workspaceId,
          entityType: "CARD",
          entityId: cardId,
          metadata: JSON.stringify({
            sourceColumnId,
            destinationColumnId,
            previousPosition: card.position,
            newPosition,
            targetIndex,
          }),
        },
      });

      return updated;
    });

    return {
      success: true,
      data: {
        cardId: result.id,
        newColumnId: result.columnId,
        newPosition: result.position,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: resolveErrorMessage(error),
    };
  }
}

// ─── Rebalance Helpers ───────────────────────────────────────────────────────

/**
 * Rebalances all cards in a column and places the moved card at the target index.
 * Called as a fallback when fractional position space is exhausted during reorder.
 */
async function rebalanceColumnAndPlace(
  columnId: string,
  movedCardId: string,
  targetIndex: number,
  workspaceId: string,
  userId: string
): Promise<ActionResult<{ cardId: string; newPosition: number }>> {
  const allCards = await prisma.card.findMany({
    where: { columnId },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  const orderedIds = allCards
    .filter((c) => c.id !== movedCardId)
    .map((c) => c.id);

  const clampedIndex = Math.min(targetIndex, orderedIds.length);
  orderedIds.splice(clampedIndex, 0, movedCardId);

  const newPositions = rebalancePositions(orderedIds);

  const result = await prisma.$transaction(async (tx) => {
    const updates = orderedIds.map((id) =>
      tx.card.update({
        where: { id },
        data: { position: newPositions.get(id)! },
      })
    );
    await Promise.all(updates);

    await tx.activity.create({
      data: {
        action: "CARD_REORDERED",
        userId,
        workspaceId,
        entityType: "CARD",
        entityId: movedCardId,
        metadata: JSON.stringify({
          columnId,
          rebalanced: true,
          targetIndex,
          newPosition: newPositions.get(movedCardId)!,
        }),
      },
    });

    return { cardId: movedCardId, newPosition: newPositions.get(movedCardId)! };
  });

  return { success: true, data: result };
}

/**
 * Rebalances the destination column and places the moved card from another column.
 * Called as a fallback when fractional position space is exhausted during cross-column move.
 */
async function rebalanceDestinationAndPlace(
  destinationColumnId: string,
  movedCardId: string,
  targetIndex: number,
  sourceColumnId: string,
  previousPosition: number,
  workspaceId: string,
  boardId: string,
  userId: string
): Promise<ActionResult<{ cardId: string; newColumnId: string; newPosition: number }>> {
  const destinationCards = await prisma.card.findMany({
    where: { columnId: destinationColumnId },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  const orderedIds = destinationCards.map((c) => c.id);
  const clampedIndex = Math.min(targetIndex, orderedIds.length);
  orderedIds.splice(clampedIndex, 0, movedCardId);

  const newPositions = rebalancePositions(orderedIds);

  const result = await prisma.$transaction(async (tx) => {
    await tx.card.update({
      where: { id: movedCardId },
      data: {
        columnId: destinationColumnId,
        position: newPositions.get(movedCardId)!,
      },
    });

    const siblingUpdates = orderedIds
      .filter((id) => id !== movedCardId)
      .map((id) =>
        tx.card.update({
          where: { id },
          data: { position: newPositions.get(id)! },
        })
      );
    await Promise.all(siblingUpdates);

    await tx.activity.create({
      data: {
        action: "CARD_MOVED",
        userId,
        workspaceId,
        entityType: "CARD",
        entityId: movedCardId,
        metadata: JSON.stringify({
          sourceColumnId,
          destinationColumnId,
          previousPosition,
          newPosition: newPositions.get(movedCardId)!,
          targetIndex,
          rebalanced: true,
        }),
      },
    });

    return {
      cardId: movedCardId,
      newColumnId: destinationColumnId,
      newPosition: newPositions.get(movedCardId)!,
    };
  });

  return { success: true, data: result };
}

// ─── Error Resolution ────────────────────────────────────────────────────────

function resolveErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
}
