'use server';

import { getBoardActivities, type ActivityItem } from '@/lib/queries/activity-queries';

export async function fetchActivities(workspaceId: string): Promise<ActivityItem[]> {
  return getBoardActivities(workspaceId);
}
