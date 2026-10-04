"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertWorkspaceRole, assertBoardInWorkspace } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import {
  createBoardSchema,
  updateBoardSchema,
  deleteBoardSchema,
  type CreateBoardInput,
  type UpdateBoardInput,
  type DeleteBoardInput,
} from "@/lib/validations/board";


export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createBoard(
  input: CreateBoardInput
): Promise<ActionResult<{ boardId: string }>> {
  const parsed = createBoardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const { title, description, workspaceId } = parsed.data;

  try {
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, workspaceId, "MEMBER");

    const result = await prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          title,
          description,
          workspaceId,
        },
      });

      await tx.activity.create({
        data: {
          action: "BOARD_CREATED",
          userId: user.id,
          workspaceId,
          entityType: "BOARD",
          entityId: board.id,
          metadata: JSON.stringify({ title }),
        },
      });

      return board;
    });

    revalidatePath(`/workspace/${workspaceId}`);

    return { success: true, data: { boardId: result.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}

export async function updateBoard(
  input: UpdateBoardInput
): Promise<ActionResult<{ boardId: string }>> {
  const parsed = updateBoardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const { boardId, title, description, workspaceId } = parsed.data;

  try {
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, workspaceId, "MEMBER");
    await assertBoardInWorkspace(boardId, workspaceId);

    const result = await prisma.$transaction(async (tx) => {
      const board = await tx.board.update({
        where: { id: boardId },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
        },
      });

      await tx.activity.create({
        data: {
          action: "BOARD_UPDATED",
          userId: user.id,
          workspaceId,
          entityType: "BOARD",
          entityId: board.id,
          metadata: JSON.stringify({ title, description }),
        },
      });

      return board;
    });

    revalidatePath(`/workspace/${workspaceId}`);
    revalidatePath(`/workspace/${workspaceId}/board/${boardId}`);

    return { success: true, data: { boardId: result.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}

export async function deleteBoard(
  input: DeleteBoardInput
): Promise<ActionResult> {
  const parsed = deleteBoardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const { boardId, workspaceId } = parsed.data;

  try {
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, workspaceId, "ADMIN");
    await assertBoardInWorkspace(boardId, workspaceId);

    await prisma.$transaction(async (tx) => {
      await tx.board.delete({
        where: { id: boardId },
      });

      await tx.activity.create({
        data: {
          action: "BOARD_DELETED",
          userId: user.id,
          workspaceId,
          entityType: "BOARD",
          entityId: boardId,
          metadata: JSON.stringify({ boardId }),
        },
      });
    });

    revalidatePath(`/workspace/${workspaceId}`);
    revalidatePath(`/workspace/${workspaceId}/board/${boardId}`);

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}
