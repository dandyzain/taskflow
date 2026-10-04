"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertWorkspaceRole, assertBoardInWorkspace, assertColumnInBoard } from "@/lib/rbac";
import {
  createCardSchema,
  updateCardSchema,
  deleteCardSchema,
  type CreateCardInput,
  type UpdateCardInput,
  type DeleteCardInput,
} from "@/lib/validations/card-crud";


export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const POSITION_GAP = 1000;
const BASE_POSITION = 1000;

export async function createCard(
  input: CreateCardInput
): Promise<ActionResult<{ cardId: string; position: number }>> {
  const parsed = createCardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const { title, description, columnId, boardId, workspaceId, priority } = parsed.data;

  try {
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, workspaceId, "MEMBER");
    await assertBoardInWorkspace(boardId, workspaceId);
    await assertColumnInBoard(columnId, boardId);

    const result = await prisma.$transaction(async (tx) => {
      const lastCard = await tx.card.findFirst({
        where: { columnId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const position = lastCard ? lastCard.position + POSITION_GAP : BASE_POSITION;

      const card = await tx.card.create({
        data: {
          title,
          description,
          columnId,
          position,
          priority: priority ?? 0,
        },
      });

      await tx.activity.create({
        data: {
          action: "CARD_CREATED",
          userId: user.id,
          workspaceId,
          entityType: "CARD",
          entityId: card.id,
          metadata: JSON.stringify({ title, position, columnId }),
        },
      });

      return card;
    });

    return { success: true, data: { cardId: result.id, position: result.position } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}

export async function updateCard(
  input: UpdateCardInput
): Promise<ActionResult<{ cardId: string }>> {
  const parsed = updateCardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const { cardId, title, description, priority, dueDate, columnId, boardId, workspaceId } = parsed.data;

  try {
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, workspaceId, "MEMBER");
    await assertBoardInWorkspace(boardId, workspaceId);
    await assertColumnInBoard(columnId, boardId);

    const result = await prisma.$transaction(async (tx) => {
      const card = await tx.card.update({
        where: { id: cardId },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(priority !== undefined && { priority }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        },
      });

      await tx.activity.create({
        data: {
          action: "CARD_UPDATED",
          userId: user.id,
          workspaceId,
          entityType: "CARD",
          entityId: card.id,
          metadata: JSON.stringify({ title, description, priority }),
        },
      });

      return card;
    });

    return { success: true, data: { cardId: result.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}

export async function deleteCard(
  input: DeleteCardInput
): Promise<ActionResult> {
  const parsed = deleteCardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const { cardId, columnId, boardId, workspaceId } = parsed.data;

  try {
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, workspaceId, "ADMIN"); 
    await assertBoardInWorkspace(boardId, workspaceId);
    await assertColumnInBoard(columnId, boardId);

    const cardExists = await prisma.card.findFirst({
      where: { id: cardId, columnId },
      select: { id: true },
    });

    if (!cardExists) {
      throw new Error("Card not found in the specified column.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.card.delete({
        where: { id: cardId },
      });

      await tx.activity.create({
        data: {
          action: "CARD_DELETED",
          userId: user.id,
          workspaceId,
          entityType: "CARD",
          entityId: cardId,
          metadata: JSON.stringify({ cardId, columnId }),
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
