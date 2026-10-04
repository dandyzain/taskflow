'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { assertWorkspaceRole, assertBoardInWorkspace } from '@/lib/rbac';
import { toggleAssigneeSchema, type ToggleAssigneeInput } from '@/lib/validations/assignee';

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

export async function toggleCardAssignee(input: ToggleAssigneeInput): Promise<ActionResult<{ assigned: boolean }>> {
  try {
    const parsed = toggleAssigneeSchema.parse(input);
    const user = await getCurrentUser();
    await assertWorkspaceRole(user.id, parsed.workspaceId, 'MEMBER');
    await assertBoardInWorkspace(parsed.boardId, parsed.workspaceId);

    const existing = await prisma.cardAssignee.findFirst({
      where: { cardId: parsed.cardId, userId: parsed.userId },
    });

    if (existing) {
      await prisma.cardAssignee.delete({ where: { id: existing.id } });

      await prisma.activity.create({
        data: {
          action: 'CARD_UNASSIGNED',
          userId: user.id,
          workspaceId: parsed.workspaceId,
          entityType: 'CARD',
          entityId: parsed.cardId,
          metadata: JSON.stringify({ unassignedUserId: parsed.userId }),
        },
      });

      return { success: true, data: { assigned: false } };
    } else {
      await prisma.cardAssignee.create({
        data: { cardId: parsed.cardId, userId: parsed.userId },
      });

      await prisma.activity.create({
        data: {
          action: 'CARD_ASSIGNED',
          userId: user.id,
          workspaceId: parsed.workspaceId,
          entityType: 'CARD',
          entityId: parsed.cardId,
          metadata: JSON.stringify({ assignedUserId: parsed.userId }),
        },
      });

      return { success: true, data: { assigned: true } };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to toggle assignee' };
  }
}

export async function fetchWorkspaceMembers(workspaceId: string) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
  return members.map(m => m.user);
}
