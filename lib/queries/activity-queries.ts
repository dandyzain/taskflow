import { prisma } from '@/lib/prisma';

export interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export async function getBoardActivities(
  workspaceId: string,
  limit: number = 50
): Promise<ActivityItem[]> {
  const activities = await prisma.activity.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  return activities.map((a) => ({
    id: a.id,
    action: a.action,
    entityType: a.entityType,
    entityId: a.entityId,
    metadata: JSON.parse(a.metadata),
    createdAt: a.createdAt.toISOString(),
    user: a.user,
  }));
}
