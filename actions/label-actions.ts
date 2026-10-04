'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { assertWorkspaceRole, assertBoardInWorkspace } from '@/lib/rbac';
import {
  createLabelSchema,
  deleteLabelSchema,
  toggleCardLabelSchema,
  type CreateLabelInput,
  type DeleteLabelInput,
  type ToggleCardLabelInput,
} from '@/lib/validations/label';

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

export async function createLabel(input: CreateLabelInput): Promise<ActionResult<{ labelId: string }>> {
  try {
    const parsed = createLabelSchema.parse(input);
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, parsed.workspaceId, 'MEMBER');
    await assertBoardInWorkspace(parsed.boardId, parsed.workspaceId);

    const label = await prisma.label.create({
      data: {
        name: parsed.name,
        color: parsed.color,
        boardId: parsed.boardId,
      },
    });

    await prisma.activity.create({
      data: {
        action: 'LABEL_CREATED',
        userId: user.id,
        workspaceId: parsed.workspaceId,
        entityType: 'LABEL',
        entityId: label.id,
        metadata: JSON.stringify({ name: parsed.name, color: parsed.color }),
      },
    });

    return { success: true, data: { labelId: label.id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create label' };
  }
}

export async function deleteLabel(input: DeleteLabelInput): Promise<ActionResult> {
  try {
    const parsed = deleteLabelSchema.parse(input);
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, parsed.workspaceId, 'MEMBER');
    await assertBoardInWorkspace(parsed.boardId, parsed.workspaceId);

    const label = await prisma.label.findUnique({ where: { id: parsed.labelId } });
    if (!label) return { success: false, error: 'Label not found' };

    await prisma.label.delete({ where: { id: parsed.labelId } });

    await prisma.activity.create({
      data: {
        action: 'LABEL_DELETED',
        userId: user.id,
        workspaceId: parsed.workspaceId,
        entityType: 'LABEL',
        entityId: parsed.labelId,
        metadata: JSON.stringify({ name: label.name }),
      },
    });

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete label' };
  }
}

export async function toggleCardLabel(input: ToggleCardLabelInput): Promise<ActionResult<{ added: boolean }>> {
  try {
    const parsed = toggleCardLabelSchema.parse(input);
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, parsed.workspaceId, 'MEMBER');
    await assertBoardInWorkspace(parsed.boardId, parsed.workspaceId);

    const existing = await prisma.cardLabel.findUnique({
      where: { cardId_labelId: { cardId: parsed.cardId, labelId: parsed.labelId } },
    });

    if (existing) {
      await prisma.cardLabel.delete({
        where: { cardId_labelId: { cardId: parsed.cardId, labelId: parsed.labelId } },
      });
      return { success: true, data: { added: false } };
    } else {
      await prisma.cardLabel.create({
        data: { cardId: parsed.cardId, labelId: parsed.labelId },
      });
      return { success: true, data: { added: true } };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to toggle label' };
  }
}
